import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqwfcixtbnodxuoixxkk.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxd2ZjaXh0Ym5vZHh1b2l4eGtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg3MzM4OCwiZXhwIjoyMDc0NDQ5Mzg4fQ.jPV7nm-VeP7ctrd_B5QgCmqc3h8jJqAPqYAGfxYg5BA';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const GOLFCLUB_ID = 'd3a07a27-4e57-4d57-8cad-00274fe8d55b';

async function seedData() {
    console.log(`Starting data generation for Golfclub Wels (${GOLFCLUB_ID})...`);

    // 1. Employee Profiles
    const employeesData = [
        { full_name: 'Max Mustermann', email: 'max.mustermann@golfclub-wels.at', role: 'Trainer' },
        { full_name: 'Lisa Schmidt', email: 'lisa.schmidt@golfclub-wels.at', role: 'Sekretariat' },
        { full_name: 'Tom Becker', email: 'tom.becker@golfclub-wels.at', role: 'Platzwart' }
    ];

    console.log("Seeding employees...");
    for (const emp of employeesData) {
        const { data: userData, error: authError } = await supabase.auth.admin.createUser({
            email: emp.email,
            password: 'TempPassword123!',
            email_confirm: true,
            user_metadata: { full_name: emp.full_name }
        });

        let userId;
        if (authError) {
            if (authError.message.includes('already registered')) {
                const { data: listData } = await supabase.auth.admin.listUsers();
                userId = listData.users.find(u => u.email === emp.email)?.id;
            } else {
                console.error(`Error creating auth user ${emp.email}:`, authError.message);
                continue;
            }
        } else {
            userId = userData.user.id;
        }

        if (userId) {
            const { error: empError } = await supabase.from('employee_profiles').upsert({
                id: userId,
                full_name: emp.full_name,
                role: emp.role,
                employer_id: GOLFCLUB_ID
            });
            if (empError) console.error(`Error inserting profile for ${emp.full_name}:`, empError.message);
        }
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
    await supabase.from('company_products').insert(products);

    // 3. Inquiries
    const inquiries = [
        { name: 'Peter Müller', email: 'peter.mueller@example.com', subject: 'Frage zur Platzreife', status: 'open', user_id: GOLFCLUB_ID, category: 'general' },
        { name: 'Sabine Wagner', email: 'sabine@example.com', subject: 'Turnieranmeldung Sommer-Cup', status: 'in_progress', user_id: GOLFCLUB_ID, category: 'other' },
        { name: 'Klaus Dieter', email: 'klaus.dieter@test.de', subject: 'Rechnung für Jahresmitgliedschaft fehlt', status: 'open', user_id: GOLFCLUB_ID, category: 'billing' },
        { name: 'Felix Hofmann', email: 'felix@example.at', subject: 'Buggy für Samstag reservieren', status: 'closed', user_id: GOLFCLUB_ID, category: 'general' },
        { name: 'Anna Bauer', email: 'anna.bauer@example.com', subject: 'Feedback zum Platz: Bunker an Loch 7', status: 'open', user_id: GOLFCLUB_ID, category: 'feedback' }
    ];
    console.log("Seeding inquiries...");
    for (const inq of inquiries) {
        await supabase.from('inquiries').insert({
            ...inq,
            message: `Anfrage bezüglich ${inq.subject}`,
            source: 'web'
        });
    }

    // 4. Meetings
    const meetings = [
        { title: 'Trainerstunde mit Max Mustermann', start_time: new Date(Date.now() + 86400000).toISOString(), created_by: GOLFCLUB_ID, attendees: ['markus@example.com'] },
        { title: 'Platzbegehung für neues Turnier', start_time: new Date(Date.now() + 86400000 * 2).toISOString(), created_by: GOLFCLUB_ID, attendees: ['komitee@golfclub-wels.at'] }
    ];
    console.log("Seeding meetings...");
    for (const mtg of meetings) {
        await supabase.from('meetings').insert({
            ...mtg,
            description: mtg.title,
            end_time: new Date(new Date(mtg.start_time).getTime() + 3600000).toISOString(),
            status: 'scheduled'
        });
    }

    // 5. Chat Sessions
    console.log("Seeding chat sessions...");
    const chats = [
        { name: 'Hans', email: 'hans@test.com', user: 'Öffnungszeiten?', bot: '9:00 - 17:00' }
    ];
    for (const chat of chats) {
        const { data: session } = await supabase.from('chat_sessions').insert({
            user_id: GOLFCLUB_ID,
            visitor_name: chat.name,
            visitor_email: chat.email,
            visitor_token: `tok_${Math.random().toString(36).substr(2, 5)}`,
            status: 'active'
        }).select('id').single();

        if (session) {
            await supabase.from('chat_messages').insert([
                { session_id: session.id, sender: 'user', content: chat.user },
                { session_id: session.id, sender: 'bot', content: chat.bot }
            ]);
        }
    }

    console.log("✅ Data seeding Complete!");
}

seedData();
