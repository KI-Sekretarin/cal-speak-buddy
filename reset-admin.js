import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqwfcixtbnodxuoixxkk.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxd2ZjaXh0Ym5vZHh1b2l4eGtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg3MzM4OCwiZXhwIjoyMDc0NDQ5Mzg4fQ.jPV7nm-VeP7ctrd_B5QgCmqc3h8jJqAPqYAGfxYg5BA';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function resetPass() {
    const email = 'leolobmaierstadlbauer@gmail.com';

    console.log(`Looking up user by email: ${email}`);
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        console.error('User not found');
        return;
    }

    const newPassword = 'TempPassword123!';
    console.log(`Updating password for user ${user.id}...`);

    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        password: newPassword,
        user_metadata: { ...user.user_metadata, force_password_change: true }
    });

    if (error) {
        console.error('Error updating password:', error);
    } else {
        console.log('\n=============================================');
        console.log(`SUCCESS! Password has been reset.`);
        console.log(`Email: ${user.email}`);
        console.log(`New Password: ${newPassword}`);
        console.log('=============================================\n');
    }
}

resetPass();
