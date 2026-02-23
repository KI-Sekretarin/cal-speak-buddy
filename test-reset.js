const url = 'https://bqwfcixtbnodxuoixxkk.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxd2ZjaXh0Ym5vZHh1b2l4eGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzMzODgsImV4cCI6MjA3NDQ0OTM4OH0._VAHEgxoMlLCIjxuXsiUpcplXxdbnvIqJYkyjlXHBkQ';
const email = 'leolobmaierstadlbauer@gmail.com';

async function testAuth() {
    console.log('Testing password reset request...');
    const res1 = await fetch(`${url}/auth/v1/recover`, {
        method: 'POST',
        headers: { 'apikey': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    console.log('Reset password status:', res1.status);
    try {
        const data1 = await res1.json();
        console.log('Reset password response:', data1);
    } catch (e) {
        console.log('No JSON response for reset');
    }

    console.log('\nTesting Magic Link request...');
    const res2 = await fetch(`${url}/auth/v1/magiclink`, {
        method: 'POST',
        headers: { 'apikey': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    console.log('Magic link status:', res2.status);
    try {
        const data2 = await res2.json();
        console.log('Magic link response:', data2);
    } catch (e) {
        console.log('No JSON response for magic link');
    }
}

testAuth();
