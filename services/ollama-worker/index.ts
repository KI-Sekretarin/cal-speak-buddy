import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:14b';
const OLLAMA_CTX = parseInt(process.env.OLLAMA_CTX || '16384', 10);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
});

// --- Retry Helper ---
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T | null> {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            console.error(`Attempt ${i + 1}/${retries} failed:`, err);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 2000));
            }
        }
    }
    return null;
}

const STUCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 Minuten
const FAILED_RETRY_AFTER_MS = 10 * 60 * 1000; // 10 Minuten
const BATCH_SIZE = 5;

async function recoverStuckInquiries() {
    const cutoff = new Date(Date.now() - STUCK_TIMEOUT_MS).toISOString();
    const { data: stuck, error } = await supabase
        .from('inquiries')
        .select('id')
        .is('ai_category', null)
        .eq('status', 'in_progress')
        .lt('updated_at', cutoff);

    if (error || !stuck || stuck.length === 0) return;

    console.log(`Recovering ${stuck.length} stuck inquiries...`);
    const ids = stuck.map((s: any) => s.id);
    await supabase
        .from('inquiries')
        .update({ status: 'open' })
        .in('id', ids);
}

async function retryFailedInquiries() {
    const cutoff = new Date(Date.now() - FAILED_RETRY_AFTER_MS).toISOString();
    const { data: failed, error } = await supabase
        .from('inquiries')
        .select('id')
        .is('ai_category', null)
        .eq('status', 'failed')
        .lt('updated_at', cutoff);

    if (error || !failed || failed.length === 0) return;

    console.log(`Retrying ${failed.length} previously failed inquiries...`);
    const ids = failed.map((s: any) => s.id);
    await supabase
        .from('inquiries')
        .update({ status: 'open' })
        .in('id', ids);
}

async function claimInquiries(): Promise<any[]> {
    const { data: rows, error } = await supabase
        .from('inquiries')
        .select('*')
        .is('ai_category', null)
        .eq('status', 'open')
        .order('created_at', { ascending: true })
        .limit(BATCH_SIZE);

    if (error || !rows || rows.length === 0) return [];

    const ids = rows.map((r: any) => r.id);
    const { error: updateError } = await supabase
        .from('inquiries')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .in('id', ids);

    if (updateError) {
        console.error('Failed to claim inquiries:', updateError);
        return [];
    }

    return rows;
}

async function fetchProfile(userId: string) {
    const { data, error } = await supabase
        .from('ai_company_context')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
}


async function analyzeInquiry(subject: string, message: string, profile: any) {
    const companyName = profile?.company_name || 'our company';
    const industry = profile?.industry || 'general';
    const description = profile?.company_description || '';
    const tone = profile?.preferred_tone || 'professional';
    const language = profile?.preferred_language || 'de';

    let categories = ['appointment', 'general', 'urgent', 'spam', 'support', 'sales', 'billing', 'feedback'];
    if (profile?.inquiry_categories && Array.isArray(profile.inquiry_categories) && profile.inquiry_categories.length > 0) {
        categories = [...profile.inquiry_categories, 'spam'];
    }
    const categoriesList = categories.map(c => `'${c}'`).join(', ');

    const contactInfo = [
        profile?.email ? `Email: ${profile.email}` : '',
        profile?.phone ? `Phone: ${profile.phone}` : '',
        profile?.mobile ? `Mobile: ${profile.mobile}` : '',
        profile?.website ? `Website: ${profile.website}` : '',
        profile?.street ? `Address: ${profile.street} ${profile.street_number || ''}, ${profile.postal_code || ''} ${profile.city || ''}` : '',
        profile?.country ? `Country: ${profile.country}` : ''
    ].filter(Boolean).join('\n');

    const businessHours = profile?.business_hours ? JSON.stringify(profile.business_hours) : '';
    const values = Array.isArray(profile?.company_values) ? profile.company_values.join(', ') : '';
    const productsList = Array.isArray(profile?.products_and_services)
        ? profile.products_and_services.map((p: any) => `- ${p.name}: ${p.price} ${p.currency} (${p.description || ''})`).join('\n')
        : '';
    const faqs = Array.isArray(profile?.common_faqs) ? JSON.stringify(profile.common_faqs) : '';
    const importantNotes = profile?.important_notes || '';
    const instructions = profile?.ai_instructions || '';

    const introTemplate = profile?.response_template_intro?.trim()
        ? profile.response_template_intro
        : (language === 'de' ? 'Sehr geehrte Damen und Herren,' : 'Dear Sir or Madam,');
    const signatureTemplate = profile?.response_template_signature?.trim()
        ? profile.response_template_signature
        : (language === 'de' ? `Mit freundlichen Grüßen,\n${companyName}` : `Best regards,\n${companyName}`);

    // N+1 Fix: Batch-Query für alle Mitarbeiter + Workload
    let employeeContext = "";
    let employees: any[] = [];

    if (profile?.id) {
        const { data: allEmps } = await supabase
            .from('employee_profiles')
            .select('id, full_name, role, skills, max_capacity')
            .eq('employer_id', profile.id);

        if (allEmps && allEmps.length > 0) {
            const ids = allEmps.map((e: any) => e.id);
            const { data: loadRows } = await supabase
                .from('inquiries')
                .select('assigned_to')
                .neq('status', 'closed')
                .in('assigned_to', ids);

            const loadMap: Record<string, number> = {};
            for (const row of loadRows || []) {
                if (row.assigned_to) {
                    loadMap[row.assigned_to] = (loadMap[row.assigned_to] || 0) + 1;
                }
            }

            employees = allEmps.map((emp: any) => ({
                ...emp,
                current_load: loadMap[emp.id] || 0,
            }));

            employeeContext = JSON.stringify(employees.map(e => ({
                id: e.id,
                name: e.full_name,
                role: e.role,
                skills: e.skills,
                load: `${e.current_load}/${e.max_capacity}`
            })));
        }
    }

    const prompt = `
You are a professional AI secretary for "${companyName}" (${industry}).
Your goal is to categorize the inquiry, write the email BODY, AND assign it to the best employee.

=== CONTEXT (The ONLY truth) ===
Description: ${description}

Products & Prices:
${productsList}

Values: ${values}
Business Hours: ${businessHours}
Contact: ${contactInfo}
FAQs: ${faqs}
Notes: ${importantNotes}
Instructions: ${instructions}

=== EMPLOYEES (Candidates) ===
${employeeContext}

=== CRITICAL RULES ===
1. **SPAM DETECTION (High Priority)**:
   - If the message is a Newsletter, Receipt, Automated Notification, Sales Pitch, or purely informational (no question asked) -> CATEGORIZE AS 'spam'.
   - If it's "spam", return "body_text": "SPAM_DETECTED".

2. **Categorization & Assignment**:
   - Categorize into: ${categoriesList}.
   - IF category matches an Employee's Role:
     - Check 'skills': Does the employee have relevant skills for the inquiry?
     - Check 'load': Is the employee overloaded (current_load >= max_capacity)? Prefer those with lower load.
     - Pick the best 'id' and put it in "assigned_employee_id".
     - If no one suitable, set "assigned_employee_id": null.

3. **Reply Content – STRICT RULES**:
   - You are writing a REPLY EMAIL from "${companyName}" to the customer.
   - Acknowledge the customer's concern or request genuinely and explain what action will be taken.
   - Do NOT copy, repeat, or paraphrase the customer's message back to them.
   - Write the reply in ${language === 'de' ? 'German (Deutsch)' : 'English'}.
   - Output ONLY the body paragraphs – nothing else.
   - **ABSOLUTELY NO GREETING** (no "Hello", "Dear...", "Servus", "Sehr geehrte...", "Golffreund", or any salutation).
   - **ABSOLUTELY NO CLOSING** (no "Best regards", "Danke", "Gutes Spiel", "MfG", or any farewell phrase).
   - **ABSOLUTELY NO SIGNATURE** (no company name, no team name, no contact info).
   - Start directly with the first sentence of the actual reply.

4. **Tone**: ${tone}

=== YOUR TASK ===
You are the AI secretary of "${companyName}". A customer has sent the inquiry below.
Write a professional REPLY on behalf of ${companyName} that:
  - Genuinely acknowledges the customer's concern or request
  - States clearly what ${companyName} will do (investigate, fix, arrange, etc.)
  - Does NOT repeat or paraphrase the customer's words back to them
  - Uses a ${tone} tone, written in ${language === 'de' ? 'German (Deutsch)' : 'English'}

Steps:
1. Categorize the inquiry.
2. Assign to the best-suited employee (check role, skills, and workload).
3. Write the reply body_text – NO greeting, NO closing, NO signature.

=== INQUIRY ===
Subject: ${subject}
Message: ${message}

Return valid JSON ONLY:
{
  "category": "category_name",
  "assigned_employee_id": "uuid_or_null",
  "body_text": "..."
}
`;

    // Retry-Logik für Ollama-Calls
    const result = await withRetry(async () => {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt,
                stream: false,
                format: "json",
                options: { num_ctx: OLLAMA_CTX }
            }),
        });

        if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);

        const data = await response.json() as any;
        return JSON.parse(data.response);
    });

    if (!result) return null;

    let category = result.category?.toLowerCase();
    if (!categories.includes(category)) category = 'general';

    const aiBody = result.body_text || result.response || '';
    const fullResponse = `${introTemplate}\n\n${aiBody}\n\n${signatureTemplate}`;

    return {
        category,
        assigned_to: result.assigned_employee_id || null,
        response: fullResponse
    };
}

async function generateChatResponse(message: string, profile: any, history: string) {
    const companyName = profile?.company_name || 'our company';
    const description = profile?.company_description || '';
    const tone = profile?.preferred_tone || 'professional';
    const language = profile?.preferred_language || 'de';

    const contactInfo = [
        profile?.email ? `Email: ${profile.email}` : '',
        profile?.phone ? `Phone: ${profile.phone}` : '',
        profile?.website ? `Website: ${profile.website}` : '',
        profile?.street ? `Address: ${profile.street} ${profile.street_number || ''}, ${profile.postal_code || ''} ${profile.city || ''}` : ''
    ].filter(Boolean).join('\n');

    const productsList = Array.isArray(profile?.products_and_services)
        ? profile.products_and_services.map((p: any) => `- ${p.name}: ${p.price} ${p.currency}`).join('\n')
        : '';
    const businessHours = profile?.business_hours ? JSON.stringify(profile.business_hours) : '';
    const faqs = Array.isArray(profile?.common_faqs) ? JSON.stringify(profile.common_faqs) : '';
    const importantNotes = profile?.important_notes || '';
    const instructions = profile?.ai_instructions || '';

    const prompt = `
You are a helpful AI assistant for "${companyName}".
Your goal is to answer the customer's question based on the company context.
You can also help customers create support tickets.

=== CONTEXT ===
Description: ${description}

Products & Prices:
${productsList}
Business Hours: ${businessHours}
Contact: ${contactInfo}
FAQs: ${faqs}
Notes: ${importantNotes}
Instructions: ${instructions}

=== HISTORY ===
${history}

=== CURRENT MESSAGE ===
User: ${message}

=== INSTRUCTIONS ===
- Answer in ${language === 'de' ? 'GERMAN' : 'ENGLISH'}.
- Tone: ${tone}.
- Use the context provided.
- If you don't know, say you will check internally or ask for contact details.
- Keep it concise (chat style).
- Do NOT include "Assistant:" prefix.

- **TICKET CREATION**: If the user wants to create a ticket, report a problem, or submit a request:
  1. If user has NOT yet provided an email address in the conversation, ask for their email. Set "action": "collect_email".
  2. If user HAS provided an email (look in history!) but has NOT described their issue/subject, ask them to describe it. Set "action": "collect_details".
  3. If user has provided BOTH email AND a description/subject, create the ticket. Set "action": "create_ticket" and fill "ticket_data".
  - Look at the ENTIRE conversation history to find already-provided email and details. Do NOT re-ask for information already given!
  - An email looks like: something@something.something
  - For the ticket subject, create a short summary (max 10 words) from the user's description.

- **ESCALATION**: Set "escalate": true if:
  - You cannot answer the question.
  - The user asks to speak to a human.
  - The user is angry or complaining.
  - The user requests an appointment or booking.
  - You are saying "I will check internally".

Return valid JSON ONLY:
{
  "response": "Your text response here",
  "escalate": true/false,
  "action": "none" | "collect_email" | "collect_details" | "create_ticket",
  "ticket_data": {
    "email": "user@example.com",
    "name": "Name if provided or empty string",
    "subject": "Short ticket subject",
    "message": "Full description of the issue"
  }
}

IMPORTANT: "action" defaults to "none" for normal responses. Only use "create_ticket" when you have ALL the data (email + description). "ticket_data" is only required when action is "create_ticket".
`;

    // Retry-Logik für Ollama-Calls
    return await withRetry(async () => {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt,
                stream: false,
                format: "json",
                options: { num_ctx: OLLAMA_CTX }
            }),
        });

        if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);

        const data = await response.json() as any;
        return JSON.parse(data.response);
    });
}

async function ensureChatInquiry(sessionId: string, userId: string, firstMessage: string) {
    const { data: existing } = await supabase
        .from('inquiries')
        .select('id')
        .eq('chat_session_id', sessionId)
        .single();

    if (existing) return;

    console.log(`Creating new inquiry for chat session ${sessionId}`);
    await supabase.from('inquiries').insert({
        user_id: userId,
        subject: 'Neue Chat-Anfrage',
        message: firstMessage,
        source: 'chat',
        chat_session_id: sessionId,
        status: 'open'
    });
}

async function createTicketFromChat(
    sessionId: string,
    userId: string,
    ticketData: { email: string; name: string; subject: string; message: string }
) {
    console.log(`Creating ticket from chat for session ${sessionId}`);

    await supabase
        .from('chat_sessions')
        .update({ visitor_email: ticketData.email, visitor_name: ticketData.name || null })
        .eq('id', sessionId);

    const { data: existing } = await supabase
        .from('inquiries')
        .select('id')
        .eq('chat_session_id', sessionId)
        .single();

    if (existing) return existing.id;

    const { data: inquiry, error } = await supabase
        .from('inquiries')
        .insert({
            user_id: userId,
            name: ticketData.name || 'Chat-Besucher',
            email: ticketData.email,
            subject: ticketData.subject,
            message: ticketData.message,
            source: 'chat',
            chat_session_id: sessionId,
            status: 'open'
        })
        .select('id')
        .single();

    if (error) {
        console.error('Failed to create ticket from chat:', error);
        return null;
    }

    return inquiry.id;
}

async function processChatMessages() {
    const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*, chat_sessions(user_id)')
        .eq('sender', 'user')
        .eq('is_processed', false)
        .limit(5);

    if (error || !messages || messages.length === 0) return;

    for (const msg of messages) {
        console.log(`Processing chat message ${msg.id}: ${msg.content}`);

        const userId = msg.chat_sessions?.user_id;
        if (!userId) {
            // Mark as processed so we don't retry invalid messages
            await supabase.from('chat_messages').update({ is_processed: true }).eq('id', msg.id);
            continue;
        }

        const profile = await fetchProfile(userId);

        const { data: history } = await supabase
            .from('chat_messages')
            .select('sender, content')
            .eq('session_id', msg.session_id)
            .lt('created_at', msg.created_at)
            .order('created_at', { ascending: false })
            .limit(10);

        const historyText = history
            ? history.reverse().map((h: any) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')
            : '';

        const result = await generateChatResponse(msg.content, profile, historyText);

        if (result && result.response) {
            if (result.action === 'create_ticket' && result.ticket_data) {
                console.log(`AI triggered ticket creation for session ${msg.session_id}`);
                const ticketId = await createTicketFromChat(msg.session_id, userId, result.ticket_data);

                if (ticketId) {
                    await supabase.from('chat_messages').insert({
                        session_id: msg.session_id,
                        sender: 'bot',
                        content: result.response,
                        metadata: {
                            action: 'ticket_created',
                            ticket_id: ticketId,
                            ticket_subject: result.ticket_data.subject,
                            ticket_email: result.ticket_data.email,
                            ticket_status: 'open'
                        }
                    });
                } else {
                    await supabase.from('chat_messages').insert({
                        session_id: msg.session_id,
                        sender: 'bot',
                        content: 'Es tut mir leid, beim Erstellen des Tickets ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'
                    });
                }
            } else {
                await supabase.from('chat_messages').insert({
                    session_id: msg.session_id,
                    sender: 'bot',
                    content: result.response
                });

                if (result.escalate) {
                    console.log(`Escalating chat session ${msg.session_id} to ticket.`);
                    await ensureChatInquiry(msg.session_id, userId, msg.content);
                }
            }

            // Race Condition Fix: is_processed erst NACH erfolgreicher AI-Response setzen
            await supabase.from('chat_messages').update({ is_processed: true }).eq('id', msg.id);
        } else {
            // AI failed after retries — mark as processed to avoid infinite retry loop
            console.warn(`AI failed for message ${msg.id}, marking as processed.`);
            await supabase.from('chat_messages').update({ is_processed: true }).eq('id', msg.id);
        }
    }
}

async function processInquiry(inquiry: any) {
    console.log(`Processing inquiry ${inquiry.id}: ${inquiry.subject}`);

    let profile = null;
    if (inquiry.user_id) {
        profile = await fetchProfile(inquiry.user_id);
    }

    const analysis = await analyzeInquiry(inquiry.subject, inquiry.message, profile);

    if (analysis && analysis.category) {
        console.log(`-> Categorized as: ${analysis.category}`);

        if (analysis.category === 'spam') {
            console.log('-> Spam detected. Deleting inquiry...');
            const { error: deleteError } = await supabase
                .from('inquiries')
                .delete()
                .eq('id', inquiry.id);

            if (deleteError) {
                console.error('Failed to delete spam inquiry:', deleteError);
            } else {
                console.log('-> Spam inquiry deleted successfully.');
            }
            return;
        }

        console.log(`-> Generated response length: ${analysis.response?.length}`);

        const { error } = await supabase
            .from('inquiries')
            .update({
                ai_category: analysis.category,
                ai_response: analysis.response,
                assigned_to: analysis.assigned_to,
                status: 'processed',
                updated_at: new Date().toISOString()
            })
            .eq('id', inquiry.id);

        if (error) {
            console.error('Failed to update inquiry:', error);
            // Zurück auf open setzen, damit es erneut versucht wird
            await supabase
                .from('inquiries')
                .update({ status: 'open' })
                .eq('id', inquiry.id);
        } else {
            console.log(`-> Inquiry ${inquiry.id} successfully processed.`);
        }
    } else {
        console.log('-> Failed to analyze after retries. Setting status to failed.');
        await supabase
            .from('inquiries')
            .update({ status: 'failed', updated_at: new Date().toISOString() })
            .eq('id', inquiry.id);
    }
}

async function main() {
    console.log('Starting Ollama Worker...');
    console.log(`Connecting to Supabase at ${SUPABASE_URL}`);
    console.log(`Using Ollama at ${OLLAMA_URL} with model ${OLLAMA_MODEL}`);
    console.log('Worker started. Polling for new inquiries...');

    let cycleCount = 0;

    while (true) {
        try {
            // Alle 12 Zyklen (~1 Min): stuck & failed Inquiries recovern
            if (cycleCount % 12 === 0) {
                await recoverStuckInquiries();
                await retryFailedInquiries();
            }
            cycleCount++;

            const inquiries = await claimInquiries();

            if (inquiries.length > 0) {
                console.log(`Claimed ${inquiries.length} inquiries to process.`);
                for (const inquiry of inquiries) {
                    await processInquiry(inquiry);
                }
            }

            await processChatMessages();

            if (inquiries.length === 0) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        } catch (error) {
            console.error('Main loop error:', error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

main();
