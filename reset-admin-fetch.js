const url = 'https://bqwfcixtbnodxuoixxkk.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxd2ZjaXh0Ym5vZHh1b2l4eGtrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg3MzM4OCwiZXhwIjoyMDc0NDQ5Mzg4fQ.jPV7nm-VeP7ctrd_B5QgCmqc3h8jJqAPqYAGfxYg5BA';
const email = 'leolobmaierstadlbauer@gmail.com';

async function reset() {
    console.log(`Getting users...`);
    const listRes = await fetch(`${url}/auth/v1/admin/users`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });

    if (!listRes.ok) {
        console.error('Failed to list users', listRes.status, await listRes.text());
        return;
    }

    const data = await listRes.json();
    const user = data.users.find(u => u.email === email);
    if (!user) {
        console.error('User not found in user list');
        return;
    }

    console.log(`Found user ${user.id}. Updating password...`);
    const newPassword = 'TempPassword123!';
    const updateRes = await fetch(`${url}/auth/v1/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword, user_metadata: { ...user.user_metadata, force_password_change: true } })
    });

    if (!updateRes.ok) {
        console.error('Failed to update password', updateRes.status, await updateRes.text());
        return;
    }

    const updatedUser = await updateRes.json();
    console.log('\n=============================================');
    console.log(`SUCCESS! Password has been reset.`);
    console.log(`Email: ${updatedUser.email}`);
    console.log(`New Password: ${newPassword}`);
    console.log('=============================================\n');
}

reset().catch(console.error);
