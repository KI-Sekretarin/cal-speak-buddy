import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // Built-in in Node 18+, but good to be explicit or use globalThis.fetch

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
    auth: {
        persistSession: false,
    },
});

async function atomicClaimRows(limit: number = 1) {
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
        // Note: This requires a 'sql' RPC function in Supabase to execute raw SQL.
        // If that doesn't exist, we might need a fallback or the user needs to create it.
        // For now, we'll assume the user has it or we use a fallback.
        const { data, error } = await supabase.rpc('sql', { q: sql });

        if (error) {
            // Fallback if RPC fails (e.g. function not found)
            // console.warn('RPC atomic claim failed, trying fallback...', error.message);
            return null;
        }
        return data;
    } catch (e) {
        console.error('Atomic claim error:', e);
        return null;
    }
}

async function fallbackClaimOne() {
    const { data: rows, error } = await supabase
        .from('inquiries')
        .select('*')
        .is('ai_category', null)
        .neq('status', 'in_progress') // Try to avoid those already picked up
        .order('created_at', { ascending: true })
        .limit(1);

    if (error || !rows || rows.length === 0) return null;

    const candidate = rows[0];
    const { data: updated, error: updateError } = await supabase
        .from('inquiries')
        .update({ status: 'in_progress' })
        .eq('id', candidate.id)
        .select()
        .single();

    if (updateError) return null;
    return updated;
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

async function fetchEmployees(companyId: string, role: string) {
    // Fetch employees for this company with matching role
    // Also fetch their current open ticket count to estimate load
    const { data: employees, error } = await supabase
        .from('employee_profiles')
        .select('id, full_name, skills, max_capacity')
        .eq('employer_id', companyId)
        .eq('role', role);

    if (error || !employees) return [];

    // For each employee, count "in_progress" or "open" tickets assigned to them
    const employeesWithLoad = await Promise.all(employees.map(async (emp) => {
        const { count } = await supabase
            .from('inquiries')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', emp.id)
            .neq('status', 'closed');

        return {
            ...emp,
            current_load: count || 0
        };
    }));

    return employeesWithLoad;
}

async function analyzeInquiry(subject: string, message: string, profile: any) {
    // 1. Basic Company Info
    const companyName = profile?.company_name || 'our company';
    const industry = profile?.industry || 'general';
    const description = profile?.company_description || '';
    const tone = profile?.preferred_tone || 'professional';
    const language = profile?.preferred_language || 'de';

    // 2. Dynamic Categories
    let categories = ['appointment', 'general', 'urgent', 'spam', 'support', 'sales', 'billing', 'feedback'];
    if (profile?.inquiry_categories && Array.isArray(profile.inquiry_categories) && profile.inquiry_categories.length > 0) {
        categories = [...profile.inquiry_categories, 'spam'];
    }
    const categoriesList = categories.map(c => `'${c}'`).join(', ');

    // 3. Contact & Location
    const contactInfo = [
        profile?.email ? `Email: ${profile.email}` : '',
        profile?.phone ? `Phone: ${profile.phone}` : '',
        profile?.mobile ? `Mobile: ${profile.mobile}` : '',
        profile?.website ? `Website: ${profile.website}` : '',
        profile?.street ? `Address: ${profile.street} ${profile.street_number || ''}, ${profile.postal_code || ''} ${profile.city || ''}` : '',
        profile?.country ? `Country: ${profile.country}` : ''
    ].filter(Boolean).join('\n');

    // 4. Operational Details
    const businessHours = profile?.business_hours ? JSON.stringify(profile.business_hours) : '';
    const deliveryAreas = Array.isArray(profile?.delivery_areas) ? profile.delivery_areas.join(', ') : '';
    const paymentMethods = Array.isArray(profile?.payment_methods) ? profile.payment_methods.join(', ') : '';

    // 5. Company Identity & Values
    const values = Array.isArray(profile?.company_values) ? profile.company_values.join(', ') : '';
    const usps = Array.isArray(profile?.unique_selling_points) ? profile.unique_selling_points.join(', ') : '';

    const certifications = Array.isArray(profile?.certifications) ? profile.certifications.join(', ') : '';

    // NEW: Products & Pricing
    const productsList = Array.isArray(profile?.products_and_services)
        ? profile.products_and_services.map((p: any) => `- ${p.name}: ${p.price} ${p.currency} (${p.description || ''})`).join('\n')
        : '';

    // 6. Knowledge Base
    const faqs = Array.isArray(profile?.common_faqs) ? JSON.stringify(profile.common_faqs) : '';
    const importantNotes = profile?.important_notes || '';
    const instructions = profile?.ai_instructions || '';

    // 7. Templates (Strict handling)
    const introTemplate = profile?.response_template_intro && profile.response_template_intro.trim().length > 0
        ? profile.response_template_intro
        : (language === 'de' ? 'Sehr geehrte Damen und Herren,' : 'Dear Sir or Madam,');

    const signatureTemplate = profile?.response_template_signature && profile.response_template_signature.trim().length > 0
        ? profile.response_template_signature
        : (language === 'de' ? `Mit freundlichen Grüßen,\n${companyName}` : `Best regards,\n${companyName}`);


    // --- PRE-FETCH EMPLOYEES FOR CONTEXT ---
    // We don't know the category yet, so we have to ask the AI to categorize AND assign in one go,
    // Or we fetch ALL employees. Fetching all is safer for prompt context.
    let employeeContext = "";
    let employees: any[] = [];

    if (profile?.id) {
        // Fetch ALL employees for this company
        const { data: allEmps, error } = await supabase
            .from('employee_profiles')
            .select('id, full_name, role, skills, max_capacity')
            .eq('employer_id', profile.id);

        if (allEmps && allEmps.length > 0) {
            // Get load for all
            employees = await Promise.all(allEmps.map(async (emp) => {
                const { count } = await supabase
                    .from('inquiries')
                    .select('*', { count: 'exact', head: true })
                    .eq('assigned_to', emp.id)
                    .neq('status', 'closed');
                return { ...emp, current_load: count || 0 };
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

3. **Content Only**:
   - Output ONLY the body paragraphs.
   - **ABSOLUTELY NO GREETING** (e.g. "Hello", "Dear...", "Servus", "Sehr geehrte...").
   - **ABSOLUTELY NO CLOSING** (e.g. "Best regards", "Sincerely", "Mit freundlichen Grüßen", "LG").
   - **ABSOLUTELY NO SIGNATURE** (e.g. "Your Company", "GC Wels").
   - Start directly with the first sentence of the message.

4. **Tone**: ${tone}

=== TASK ===
1. Categorize.
2. Select Employee (if applicable).
3. Write Email Body.

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

    try {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false,
                format: "json",
                options: {
                    num_ctx: OLLAMA_CTX
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json() as any;
        const result = JSON.parse(data.response);

        let category = result.category?.toLowerCase();
        if (!categories.includes(category)) {
            category = 'general';
        }

        // Return only the body text. The frontend/email service will add the greeting/closing.
        const aiBody = result.body_text || result.response || '';

        const fullResponse = `${introTemplate}\n\n${aiBody}\n\n${signatureTemplate}`;

        return {
            category: category,
            assigned_to: result.assigned_employee_id || null,
            response: fullResponse
        };
    } catch (error) {
        console.error('Ollama analysis failed:', error);
        return null;
    }
}

async function generateChatResponse(message: string, profile: any, history: string) {
    // 1. Basic Company Info
    const companyName = profile?.company_name || 'our company';
    const description = profile?.company_description || '';
    const tone = profile?.preferred_tone || 'professional';
    const language = profile?.preferred_language || 'de';

    // 2. Contact & Location
    const contactInfo = [
        profile?.email ? `Email: ${profile.email}` : '',
        profile?.phone ? `Phone: ${profile.phone}` : '',
        profile?.website ? `Website: ${profile.website}` : '',
        profile?.street ? `Address: ${profile.street} ${profile.street_number || ''}, ${profile.postal_code || ''} ${profile.city || ''}` : ''
    ].filter(Boolean).join('\n');

    // 3. Knowledge Base

    // NEW: Products & Pricing
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

    try {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false,
                format: "json",
                options: {
                    num_ctx: OLLAMA_CTX
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json() as any;
        return JSON.parse(data.response);
    } catch (error) {
        console.error('Ollama chat generation failed:', error);
        return null;
    }
}



async function ensureChatInquiry(sessionId: string, userId: string, firstMessage: string) {
    // Check if inquiry exists
    const { data: existing } = await supabase
        .from('inquiries')
        .select('id')
        .eq('chat_session_id', sessionId)
        .single();

    if (existing) return;

    // Create new inquiry
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
    console.log(`  Email: ${ticketData.email}, Subject: ${ticketData.subject}`);

    // 1. Update the chat_session with visitor info
    await supabase
        .from('chat_sessions')
        .update({
            visitor_email: ticketData.email,
            visitor_name: ticketData.name || null
        })
        .eq('id', sessionId);

    // 2. Check if a ticket already exists for this session
    const { data: existing } = await supabase
        .from('inquiries')
        .select('id')
        .eq('chat_session_id', sessionId)
        .single();

    if (existing) {
        console.log(`Ticket already exists for session ${sessionId}, skipping.`);
        return existing.id;
    }

    // 3. Create the inquiry (ticket)
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

    console.log(`Ticket created: ${inquiry.id}`);
    return inquiry.id;
}

async function processChatMessages() {
    // 1. Find unprocessed user messages
    const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*, chat_sessions(user_id)')
        .eq('sender', 'user')
        .eq('is_processed', false)
        .limit(5);

    if (error || !messages || messages.length === 0) return;

    for (const msg of messages) {
        console.log(`Processing chat message ${msg.id}: ${msg.content}`);

        // Mark as processed immediately
        await supabase.from('chat_messages').update({ is_processed: true }).eq('id', msg.id);

        const userId = msg.chat_sessions?.user_id;
        if (!userId) continue;

        const profile = await fetchProfile(userId);

        // Get conversation history (last 10 messages for better ticket context)
        const { data: history } = await supabase
            .from('chat_messages')
            .select('sender, content')
            .eq('session_id', msg.session_id)
            .lt('created_at', msg.created_at)
            .order('created_at', { ascending: false })
            .limit(10);

        const historyText = history ? history.reverse().map((h: any) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n') : '';

        // Generate response
        const result = await generateChatResponse(msg.content, profile, historyText);

        if (result && result.response) {
            // Check if AI wants to create a ticket
            if (result.action === 'create_ticket' && result.ticket_data) {
                console.log(`AI triggered ticket creation for session ${msg.session_id}`);
                const ticketId = await createTicketFromChat(
                    msg.session_id,
                    userId,
                    result.ticket_data
                );

                if (ticketId) {
                    // Send confirmation message with metadata for beautiful card rendering
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
                    // Ticket creation failed, send regular response
                    await supabase.from('chat_messages').insert({
                        session_id: msg.session_id,
                        sender: 'bot',
                        content: 'Es tut mir leid, beim Erstellen des Tickets ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'
                    });
                }
            } else {
                // Regular response (or collect_email / collect_details — just show the text)
                await supabase.from('chat_messages').insert({
                    session_id: msg.session_id,
                    sender: 'bot',
                    content: result.response
                });

                // Check for escalation
                if (result.escalate) {
                    console.log(`Escalating chat session ${msg.session_id} to ticket.`);
                    await ensureChatInquiry(msg.session_id, userId, msg.content);
                }
            }
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
                assigned_to: analysis.assigned_to, // Save the assignment
                status: 'open'
            })
            .eq('id', inquiry.id);

        if (error) console.error('Failed to update inquiry:', error);
    } else {
        console.log('-> Failed to analyze');
        await supabase
            .from('inquiries')
            .update({ status: 'open' })
            .eq('id', inquiry.id);
    }
}

async function main() {
    console.log('Starting Ollama Worker...');
    console.log(`Connecting to Supabase at ${SUPABASE_URL}`);
    console.log(`Using Ollama at ${OLLAMA_URL} with model ${OLLAMA_MODEL}`);

    console.log('Worker started. Polling for new inquiries...');

    while (true) {
        try {
            // console.log('Checking for new inquiries...'); // Optional: uncomment for very verbose logs

            // Try atomic claim first
            let inquiries = await atomicClaimRows(1);

            // If atomic failed or returned nothing (and we want to be sure), try fallback
            if (!inquiries) {
                const single = await fallbackClaimOne();
                if (single) inquiries = [single];
            }

            if (inquiries && inquiries.length > 0) {
                for (const inquiry of inquiries) {
                    await processInquiry(inquiry);
                }
            }

            // Process chat messages
            await processChatMessages();

            if ((!inquiries || inquiries.length === 0)) {
                // No work found, wait a bit
                // console.log('No new inquiries found. Waiting...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        } catch (error) {
            console.error('Main loop error:', error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

main();
