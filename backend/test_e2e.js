const axios = require('axios');

async function run() {
    try {
        console.log("--- START E2E TRACE ---");
        
        // 1. Login
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test_automation@khedutsaathi.com',
            password: 'password'
        });
        
        const token = loginRes.data.token;
        console.log("Login successful. Received real JWT.");
        
        // 2. Fetch Timeline
        const timelineRes = await axios.get('http://localhost:5000/api/timeline', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        
        console.log("Timeline request successful. Rows returned:", timelineRes.data.data ? timelineRes.data.data.length : 0);
    } catch (e) {
        console.error("E2E Trace Error:", e.response ? e.response.data : e.message);
    }
}
run();
