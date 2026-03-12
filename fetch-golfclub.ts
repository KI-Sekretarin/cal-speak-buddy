import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqwfcixtbnodxuoixxkk.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxd2ZjaXh0Ym5vZHh1b2l4eGtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg3MzM4OCwiZXhwIjoyMDc0NDQ5Mzg4fQ.jPV7nm-VeP7ctrd_B5QgCmqc3h8jJqAPqYAGfxYg5BA';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
    try {
        console.log("Fetching company profiles matching 'golf'...");
        const { data: companies, error: cErr } = await supabase
            .from('company_profiles')
            .select('*')
            .ilike('company_name', '%golf%');

        if (cErr) {
            console.error("Error fetching companies:", cErr);
            process.exit(1);
        }

        console.log("Companies:", JSON.stringify(companies, null, 2));

        if (companies && companies.length > 0) {
            const companyId = companies[0].id;

            console.log(`\nFetching services for company: ${companyId}`);
            const { data: services, error: sErr } = await supabase
                .from('services')
                .select('*')
                .eq('employer_id', companyId);
            if (sErr) console.error(sErr);
            else console.log("Services:", JSON.stringify(services, null, 2));

            console.log(`\nFetching chat sessions for company: ${companyId}`);
            const { data: sessions, error: sessErr } = await supabase
                .from('chat_sessions')
                .select('id, created_at, status')
                .eq('employer_id', companyId)
                .limit(3);
            if (sessErr) console.error(sessErr);
            else console.log("Sessions (limit 3):", JSON.stringify(sessions, null, 2));

            console.log(`\nFetching support tickets for company: ${companyId}`);
            const { data: tickets, error: tErr } = await supabase
                .from('support_tickets')
                .select('id, company_id, priority, status')
                .eq('company_id', companyId)
                .limit(3);
            if (tErr) console.error(tErr);
            else console.log("Tickets (limit 3):", JSON.stringify(tickets, null, 2));

            console.log(`\nFetching employees for company: ${companyId}`);
            const { data: employees, error: eErr } = await supabase
                .from('user_roles')
                .select('*')
                .eq('employer_id', companyId)
                .limit(3);
            if (eErr) console.error(eErr);
            else console.log("Employees (limit 3):", JSON.stringify(employees, null, 2));
        }
    } catch (err) {
        console.error("Crash:", err);
    }
    process.exit(0);
}

run();
