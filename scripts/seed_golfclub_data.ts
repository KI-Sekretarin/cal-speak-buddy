import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bqwfcixtbnodxuoixxkk.supabase.co';
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxd2ZjaXh0Ym5vZHh1b2l4eGtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg3MzM4OCwiZXhwIjoyMDc0NDQ5Mzg4fQ.jPV7nm-VeP7ctrd_B5QgCmqc3h8jJqAPqYAGfxYg5BA';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const GOLFCLUB_ID = 'd3a07a27-4e57-4d57-8cad-00274fe8d55b'; // user_id of the company profile

async function seedData() {
    console.log(`Starting data generation for Golfclub Wels (${GOLFCLUB_ID})...`);

    // 1. Employee Profiles (Need auth users first)
    const employeesData = [
        { full_name: 'Max Mustermann', email: 'max.mustermann@golfclub-wels.at', role: 'Trainer' },
        { full_name: 'Lisa Schmidt', email: 'lisa.schmidt@golfclub-wels.at', role: 'Sekretariat' },
        { full_name: 'Tom Becker', email: 'tom.becker@golfclub-wels.at', role: 'Platzwart' }
    ];

    console.log("Seeding employees and creating auth users...");
    for (const emp of employeesData) {
        // Create auth user
        const { data: userData, error: authError } = await supabase.auth.admin.createUser({
            email: emp.email,
            password: 'TempPassword123!',
            email_confirm: true,
            user_metadata: { full_name: emp.full_name }
        });

        if (authError && authError.message !== 'User already registered') {
            console.error(`Error creating auth user ${emp.email}:`, authError.message);
            continue;
        }

        const userId = userData.user?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === emp.email)?.id;

        if (!userId) {
            console.error(`Could not get ID for user ${emp.email}`);
            continue;
        }

        // Insert into employee_profiles
        const { error: empError } = await supabase.from('employee_profiles').upsert({
            id: userId,
            full_name: emp.full_name,
            role: emp.role,
            employer_id: GOLFCLUB_ID
        });
        if (empError) console.error(`Error inserting employee profile for ${emp.full_name}:`, empError.message);
    }

    // 2. Company Products
    const products = [
        { name: 'Premium Golfbälle (12er Pack)', price: 45.00, user_id: GOLFCLUB_ID, type: 'product' },
        { name: 'Platzreife-Kurs', price: 299.00, user_id: GOLFCLUB_ID, type: 'service' },
        { name: 'Golfschläger-Set Anfänger', price: 350.00, user_id: GOLFCLUB_ID, type: 'product' },
        { name: 'Jahresmitgliedschaft 2026', price: 1200.00, user_id: GOLFCLUB_ID, type: 'service' },
        { name: 'Golf-Buggy Miete (18 Loch)', price: 35.00, user_id: GOLFCLUB_ID, type: 'service' }
    ];
    console.log("Seeding products...");
    const { error: prodError } = await supabase.from('company_products').insert(products);
    if (prodError) console.error("Error inserting products:", prodError.message);

    // 3. Inquiries / Tickets
    // Enum inquiry_category: 'general', 'technical', 'billing', 'feedback', 'other'
    // Enum inquiry_status: 'open', 'in_progress', 'closed'
    const inquiries = [
        { name: 'Peter Müller', email: 'peter.mueller@example.com', subject: 'Frage zur Platzreife', status: 'open', user_id: GOLFCLUB_ID, category: 'general' },
        { name: 'Sabine Wagner', email: 'sabine@example.com', subject: 'Turnieranmeldung Sommer-Cup', status: 'in_progress', user_id: GOLFCLUB_ID, category: 'other' },
        { name: 'Klaus Dieter', email: 'klaus.dieter@test.de', subject: 'Rechnung für Jahresmitgliedschaft fehlt', status: 'open', user_id: GOLFCLUB_ID, category: 'billing' },
        { name: 'Felix Hofmann', email: 'felix@example.at', subject: 'Buggy für Samstag reservieren', status: 'closed', user_id: GOLFCLUB_ID, category: 'general' },
        { name: 'Anna Bauer', email: 'anna.bauer@example.com', subject: 'Feedback zum Platz: Bunker an Loch 7', status: 'open', user_id: GOLFCLUB_ID, category: 'feedback' }
    ];
    console.log("Seeding inquiries...");
    for (const inq of inquiries) {
        const { error: inqError } = await supabase.from('inquiries').insert({
            name: inq.name,
            email: inq.email,
            subject: inq.subject,
            message: `Anfrage bezüglich ${inq.subject}`,
            status: inq.status,
            user_id: inq.user_id,
            category: inq.category,
            source: 'web'
        });
        if (inqError) console.error(`Error inserting inquiry ${inq.subject}:`, inqError.message);
    }

    // 4. Meetings
    const meetings = [
        { title: 'Trainerstunde mit Max Mustermann', start_time: new Date(Date.now() + 86400000).toISOString(), created_by: GOLFCLUB_ID, attendees: ['markus@example.com'] },
        { title: 'Platzbegehung für neues Turnier', start_time: new Date(Date.now() + 86400000 * 2).toISOString(), created_by: GOLFCLUB_ID, attendees: ['komitee@golfclub-wels.at'] },
        { title: 'Vorstandssitzung', start_time: new Date(Date.now() + 86400000 * 5).toISOString(), created_by: GOLFCLUB_ID, attendees: ['vorstand@golfclub-wels.at'] },
        { title: 'Schnupperkurs Gruppe 1', start_time: new Date(Date.now() + 86400000 * 7).toISOString(), created_by: GOLFCLUB_ID, attendees: ['anfang@example.com'] }
    ];
    console.log("Seeding meetings...");
    for (const mtg of meetings) {
        const { error: mtgError } = await supabase.from('meetings').insert({
            title: mtg.title,
            description: mtg.title,
            start_time: mtg.start_time,
            end_time: new Date(new Date(mtg.start_time).getTime() + 3600000).toISOString(),
            created_by: mtg.created_by,
            attendees: mtg.attendees,
            status: 'scheduled'
        });
        if (mtgError) console.error(`Error inserting meeting ${mtg.title}:`, mtgError.message);
    }

    // 5. Chat Sessions & Messages
    console.log("Seeding chat sessions and messages...");
    const chats = [
        { name: 'Hans', email: 'hans@test.com', user: 'Guten Tag, wie sind eure Öffnungszeiten am Sonntag?', bot: 'Servus Golffreund! Am Sonntag haben wir von 09:00 bis 17:00 Uhr geöffnet. Gutes Spiel, ihr GC Wels!' },
        { name: 'Greta', email: 'greta@test.com', user: 'Hallo, was kostet ein 12er Pack Premium Bälle?', bot: 'Servus Golffreund! Ein 12er Pack unserer Premium Golfbälle kostet 45,00€. Kommen Sie gerne im Pro-Shop vorbei. Gutes Spiel, ihr GC Wels.' },
        { name: 'Karl', email: 'karl@test.com', user: 'Mein gemieteter Buggy ist kaputt gegangen, was nun?', bot: 'Oh, das tut mir leid! Ich erstelle sofort ein Support-Ticket für Sie, damit sich ein Platzwart darum kümmert.' }
    ];

    for (const chat of chats) {
        const { data: session, error: sessErr } = await supabase.from('chat_sessions').insert({
            user_id: GOLFCLUB_ID,
            visitor_name: chat.name,
            visitor_email: chat.email,
            visitor_token: `token_${Math.random().toString(36).substr(2, 9)}`,
            status: 'active'
        }).select('id').single();

        if (sessErr) {
            console.error(`Error creating chat session for ${chat.name}:`, sessErr.message);
            continue;
        }

        const sessionId = session.id;
        const { error: msgErr } = await supabase.from('chat_messages').insert([
            { session_id: sessionId, sender: 'user', content: chat.user },
            { session_id: sessionId, sender: 'bot', content: chat.bot }
        ]);
        if (msgErr) console.error(`Error inserting messages for session ${sessionId}:`, msgErr.message);
    }

    console.log("✅ Data seeding Complete!");
}

seedData();
