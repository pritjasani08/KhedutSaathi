const axios = require('axios');

async function testPlanner() {
    console.log("=== Testing AI Planner Endpoint ===");
    try {
        const payload = {
            state: "Gujarat",
            district: "Junagadh",
            soilType: "Black Soil",
            waterAvailability: "Medium",
            season: "Kharif",
            cropDuration: 4,
            farmArea: 5,
            irrigation: "Rainfed",
            previousCrop: "Cotton"
        };
        
        // We will call the node endpoint without a token, so we need to either mock auth or use a test token.
        // Wait, the endpoint uses requireAuth middleware. I'll just write a quick mock request directly to the controller for testing, or use the real controller.
        const { generatePlannerSynthesis } = require('../controllers/aiPlannerController');
        
        const req = {
            body: payload,
            headers: { 'x-request-id': 'test-planner-123' }
        };
        const res = {
            status: function(code) { this.statusCode = code; return this; },
            json: function(data) { console.log("Status:", this.statusCode, "\nResponse:", JSON.stringify(data, null, 2)); return data; }
        };
        
        console.log("Sending payload:", payload);
        await generatePlannerSynthesis(req, res);
        
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testPlanner();
