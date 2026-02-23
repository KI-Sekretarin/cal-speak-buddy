const url = 'https://bqwfcixtbnodxuoixxkk.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxd2ZjaXh0Ym5vZHh1b2l4eGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzMzODgsImV4cCI6MjA3NDQ0OTM4OH0._VAHEgxoMlLCIjxuXsiUpcplXxdbnvIqJYkyjlXHBkQ';
const email = 'leolobmaierstadlbauer@gmail.com';
const password = 'TempPassword123!';

async function testLogin() {
    console.log(`Testing login for ${email}...`);
    const loginRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'apikey': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    console.log('Login status:', loginRes.status);
    const data = await loginRes.json();
    console.log('Login response:', data);
}

testLogin();
