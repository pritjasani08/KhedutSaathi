const axios = require('axios');
const fs = require('fs');
require('dotenv').config({ path: '../.env' }); // To load env just in case, though the node backend does it

async function testGroq() {
  console.log("=== PHASE 9: REAL GROQ INFERENCE TEST ===");
  try {
    const health = await axios.get('http://localhost:8000/api/ai/health');
    console.log("1. Health Endpoint:");
    console.log(JSON.stringify(health.data, null, 2));

    const payload = {
      requestId: "test-real-groq-id",
      debugMode: true,
      farmer_id: "test-user-123",
      profile: {
        name: "Test Farmer",
        district: "Rajkot",
        state: "Gujarat",
        primary_crop: "Wheat"
      },
      weather: {
        rainProbability: 80,
        temperature: 28,
        condition: "Rainy"
      },
      market: {
        commodity: "Wheat",
        trend: -3.5,
        price: 2400
      },
      disease_history: [
        { disease_name: "Leaf Blight", status: "active" }
      ],
      dataFreshness: {
        weather: "Live",
        market: "1 hour ago"
      }
    };

    console.log("\n2. Sending FarmContext to Python AI Engine...");
    console.time("Total AI Response Time");
    
    const response = await axios.post('http://localhost:8000/api/ai/generate', payload, {
      headers: { 'X-Request-ID': payload.requestId }
    });

    console.timeEnd("Total AI Response Time");

    console.log("\n3. Exact JSON returned by Python Engine (validated from Groq):");
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log("\n4. Performance Metrics (from Python):");
    console.log(JSON.stringify(response.data.metrics, null, 2));

  } catch (err) {
    console.error("Test failed:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
    }
  }
}

testGroq();
