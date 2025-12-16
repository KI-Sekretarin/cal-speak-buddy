// process-inquiries/index.ts - MIT SIMULATION MODE
import { createClient } from "npm:@supabase/supabase-js@2.31.0";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const AI_SERVICE_URL = Deno.env.get('AI_SERVICE_URL') || '';
const SIMULATION_MODE = Deno.env.get('SIMULATION_MODE') === 'true' || !AI_SERVICE_URL;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
});

interface CategorizationResponse {
    category: string;
    confidence: number;
    reasoning?: string;
}

// SIMULATION: Einfache Keyword-basierte Kategorisierung
function simulateAICategorization(subject: string, message: string): CategorizationResponse {
    const text = `${subject} ${message}`.toLowerCase();

    // Technical keywords
    if (text.match(/fehler|bug|absturz|friert|funktioniert nicht|error|crash|problem/)) {
        return { category: 'technical', confidence: 0.8, reasoning: 'Simulation: Technical keywords detected' };
    }

    // Billing keywords
    if (text.match(/rechnung|zahlung|preis|kosten|bezahlen|invoice|payment|bill/)) {
        return { category: 'billing', confidence: 0.8, reasoning: 'Simulation: Billing keywords detected' };
    }

    // Feedback keywords
    if (text.match(/vorschlag|feedback|verbesserung|toll|super|gut|schlecht|suggestion/)) {
        return { category: 'feedback', confidence: 0.8, reasoning: 'Simulation: Feedback keywords detected' };
    }

    // Default: general
    return { category: 'general', confidence: 0.5, reasoning: 'Simulation: No specific keywords, defaulting to general' };
}

async function categorizeWithAI(subject: string, message: string, userId: string | null): Promise<CategorizationResponse | null> {
    // SIMULATION MODE: Verwende lokale Keyword-Erkennung
    if (SIMULATION_MODE) {
        console.log('🔄 SIMULATION MODE: Using keyword-based categorization');
        return simulateAICategorization(subject, message);
    }

    // PRODUCTION MODE: Rufe AI-Service auf
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const resp = await fetch(`${AI_SERVICE_URL}/categorize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, message, user_id: userId }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!resp.ok) {
            console.error(`AI service returned ${resp.status}`);
            // Fallback to simulation
            console.log('⚠️ Falling back to simulation mode');
            return simulateAICategorization(subject, message);
        }

        return await resp.json();
    } catch (err) {
        console.error('AI categorization error:', String(err));
        // Fallback to simulation
        console.log('⚠️ Falling back to simulation mode');
        return simulateAICategorization(subject, message);
    }
}

async function updateInquiryCategory(id: string, category: string) {
    const { error } = await supabase
        .from('inquiries')
        .update({
            ai_category: category,
            status: 'open'
        })
        .eq('id', id);

    if (error) {
        console.error('Failed to update inquiry category', id, error);
        return false;
    }

    return true;
}

Deno.serve(async (req) => {
    try {
        const url = new URL(req.url);

        if (url.pathname === '/health') {
            return new Response(JSON.stringify({
                status: 'ok',
                simulation_mode: SIMULATION_MODE
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Hole alle Inquiries mit ai_category = NULL
        const { data: inquiries, error: fetchError } = await supabase
            .from('inquiries')
            .select('*')
            .is('ai_category', null)
            .order('created_at', { ascending: true })
            .limit(5);

        if (fetchError) {
            console.error('Error fetching inquiries:', fetchError);
            return new Response(JSON.stringify({ error: 'Database error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!inquiries || inquiries.length === 0) {
            return new Response(JSON.stringify({
                processed: 0,
                results: [],
                message: 'No inquiries to process'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const results = [];

        for (const inquiry of inquiries) {
            console.log(`Processing inquiry ${inquiry.id}: ${inquiry.subject}`);

            const categorization = await categorizeWithAI(
                inquiry.subject,
                inquiry.message,
                inquiry.user_id
            );

            if (categorization && categorization.category) {
                const updated = await updateInquiryCategory(inquiry.id, categorization.category);
                results.push({
                    id: inquiry.id,
                    subject: inquiry.subject,
                    category: categorization.category,
                    confidence: categorization.confidence,
                    reasoning: categorization.reasoning,
                    dbUpdated: updated
                });
                console.log(`✅ Categorized as: ${categorization.category}`);
            } else {
                results.push({
                    id: inquiry.id,
                    error: 'Categorization failed'
                });
                console.log(`❌ Categorization failed`);
            }
        }

        return new Response(JSON.stringify({
            processed: results.length,
            simulation_mode: SIMULATION_MODE,
            results
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error('Unhandled error:', err);
        return new Response(JSON.stringify({ error: 'internal' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});
