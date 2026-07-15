const axios = require('axios');

async function checkApi() {
    try {
        const login = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'workforcharge007@gmail.com',
            password: '1234'
        });
        const token = login.data.token;
        
        const notifRes = await axios.get('http://localhost:5000/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log("API RETURNED:", notifRes.data);
    } catch(err) {
        console.error("ERROR:", err.response ? err.response.data : err.message);
    }
}
checkApi();
