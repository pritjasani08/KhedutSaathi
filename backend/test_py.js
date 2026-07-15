const axios = require('axios');
const payload = {
    requestId: "123",
    farmer_id: "123",
    profile: {},
    candidates: [{
        id: "123",
        type: "WEATHER",
        title: "Heavy Rain",
        priority: "HIGH",
        trigger: "WEATHER_HEAVY_RAIN",
        rawFacts: {},
        expiresAt: "2026-07-15T00:00:00Z"
    }]
};

fetch('http://localhost:8000/api/ai/notifications/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
})
.then(res => res.text().then(text => console.log("STATUS:", res.status, "BODY:", text)))
.catch(err => console.log("FETCH ERROR:", err));
