// process-inquiries-kategorien/index.ts
import { createClient } from "npm:@supabase/supabase-js@2.31.0";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const AI_SERVICE_URL = Deno.env.get('AI_SERVICE_URL') || 'http://localhost:9001';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY - function cannot modify DB without them.');
}

if (!AI_SERVICE_URL) {
    console.error('Missing AI_SERVICE_URL - the function cannot categorize inquiries.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        persistSession: false
    }
});

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;

interface CategorizationResponse {
    category: string;
    confidence: number;
    reasoning?: string;
}

async function atomicClaimRows(limit: number) {
    // Try using rpc('sql') to perform atomic UPDATE ... FOR UPDATE SKIP LOCKED
    const sql = `
    WITH candidate AS (
      SELECT id
      FROM public.inquiries
      WHERE ai_category IS NULL
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${limit}
    )
    UPDATE public.inquiries q
    SET status = 'in_progress'
    FROM candidate c
    WHERE q.id = c.id
    RETURNING q.*;
  `;

    try {
        const res = await supabase.rpc('sql', {
            q: sql
        });

        if (res?.error) {
            console.warn('rpc(sql) error - falling back to select/update per-row', res.error);
            return null;
        }

        if (Array.isArray(res?.data)) return res.data;
        if (res) return res;
        return null;
    } catch (e) {
        console.warn('rpc(sql) call failed, falling back', String(e));
        return null;
    }
}

async function fallbackClaimOne() {
    // Fallback: best-effort single-row claim (less atomic)
    const { data: rows, error: selErr } = await supabase
        .from('inquiries')
        .select('*')
        .is('ai_category', null)
        .order('created_at', { ascending: true })
        .limit(1);

    if (selErr) {
        console.error('Select error in fallbackClaimOne', selErr);
        return null;
    }

    if (!rows || rows.length === 0) return null;

    const candidate = rows[0];

    // Try to update; if another process updated first, updated will be null/error
    const { data: updated, error: updErr } = await supabase
        .from('inquiries')
        .update({ status: 'in_progress' })
        .eq('id', candidate.id)
        .select('*')
        .maybeSingle();

    if (updErr) {
        console.warn('Fallback claim update error', updErr);
        return null;
    }

    return updated || null;
}

async function categorizeWithAI(subject: string, message: string, userId: string | null): Promise<CategorizationResponse | null> {
    const headers = {
        'Content-Type': 'application/json'
    };

    const body = JSON.stringify({
        subject,
        message,
        user_id: userId
    });

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const resp = await fetch(`${AI_SERVICE_URL}/categorize`, {
            method: 'POST',
            headers,
            body,
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!resp.ok) {
            console.error(`AI service returned ${resp.status}: ${await resp.text()}`);
            return null;
        }

        const result: CategorizationResponse = await resp.json();
        return result;

    } catch (err) {
        console.error('AI categorization error:', String(err));
        return null;
    }
}

async function updateInquiryCategory(id: string, category: string) {
    const { error } = await supabase
        .from('inquiries')
        .update({
            ai_category: category,
            status: 'open' // Zurück auf 'open' nach erfolgreicher Kategorisierung
        })
        .eq('id', id);

    if (error) {
        console.error('Failed to update inquiry category', id, error);
        return false;
    }

    return true;
}

async function markAsFailed(id: string) {
    // Bei Fehler: Status zurück auf 'open' und ai_category bleibt NULL
    const { error } = await supabase
        .from('inquiries')
        .update({ status: 'open' })
        .eq('id', id);

    if (error) {
        console.error('Failed to reset inquiry status', id, error);
    }
}

function validateRequest(req: Request): boolean {
    // Optional: Füge hier Authentifizierung hinzu
    // z.B. API-Key check oder Supabase Auth
    return true;
}

Deno.serve(async (req) => {
    try {
        const url = new URL(req.url);

        if (url.pathname === '/health') {
            return new Response(JSON.stringify({ status: 'ok' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!validateRequest(req)) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !AI_SERVICE_URL) {
            return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Determine how many to process this run
        const qParam = url.searchParams.get('limit');
        const limit = Math.min(MAX_LIMIT, Math.max(1, Number(qParam || DEFAULT_LIMIT)));

        // Try atomic claim
        let claimed = await atomicClaimRows(limit);
        if (!claimed) {
            // fallback: claim up to `limit` rows one-by-one
            claimed = [];
            for (let i = 0; i < limit; i++) {
                const row = await fallbackClaimOne();
                if (!row) break;
                claimed.push(row);
            }
        }

        if (!claimed || claimed.length === 0) {
            return new Response(JSON.stringify({
                processed: 0,
                results: []
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const results = [];

        for (const row of claimed) {
            // double-check ai_category still null (safety)
            if (row.ai_category !== null && row.ai_category !== undefined) {
                results.push({
                    id: row.id,
                    skipped: true,
                    reason: 'ai_category already set'
                });
                continue;
            }

            // Kategorisierung mit AI
            const categorization = await categorizeWithAI(
                row.subject,
                row.message,
                row.user_id
            );

            if (categorization && categorization.category) {
                // Erfolgreiche Kategorisierung
                const updated = await updateInquiryCategory(row.id, categorization.category);
                results.push({
                    id: row.id,
                    categorized: true,
                    category: categorization.category,
                    confidence: categorization.confidence,
                    dbUpdated: updated
                });
            } else {
                // Kategorisierung fehlgeschlagen
                await markAsFailed(row.id);
                results.push({
                    id: row.id,
                    categorized: false,
                    error: 'AI categorization failed'
                });
            }
        }

        return new Response(JSON.stringify({
            processed: results.length,
            results
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error('Unhandled error in process-inquiries function', err);
        return new Response(JSON.stringify({ error: 'internal' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});
