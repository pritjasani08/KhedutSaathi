const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

async function run() {
    const userId = 'd89cea52-e03b-4f74-91bf-efe7eaac3156';
    const token = jwt.sign(
      { id: userId, email: 'test@example.com', user_type: 'farmer' },
      process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
      { expiresIn: '7d' }
    );
    
    console.log("Token generated.");
    
    try {
        const res = await axios.get('http://localhost:5000/api/timeline', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("Response Data:", JSON.stringify(res.data, null, 2));
    } catch(err) {
        console.error("API Error:", err.response ? err.response.data : err.message);
    }
}
run();
