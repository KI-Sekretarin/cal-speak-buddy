const url = 'https://bqwfcixtbnodxuoixxkk.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxd2ZjaXh0Ym5vZHh1b2l4eGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzMzODgsImV4cCI6MjA3NDQ0OTM4OH0._VAHEgxoMlLCIjxuXsiUpcplXxdbnvIqJYkyjlXHBkQ';
const email = 'kisekretarin@gmail.com';

async function testLogin() {
    console.log(`Testing login for ${email} with lowercase password...`);
    let loginRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'apikey': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'cisco123#htl' })
    });

    if (loginRes.status !== 200) {
        console.log('Lowercase failed, trying uppercase...');
        loginRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: { 'apikey': key, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'Cisco123#htl' })
        });
    }

    console.log('Final Login status:', loginRes.status);
    const data = await loginRes.json();
    if (loginRes.ok) {
        console.log('Login successful! User ID:', data.user.id);
    } else {
        console.log('Login failed:', data);
    }
}

testLogin();
