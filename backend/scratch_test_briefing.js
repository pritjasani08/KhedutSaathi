const aiBriefingController = require('./controllers/aiBriefingController');
const crypto = require('crypto');
const fs = require('fs');

async function runTest(testName) {
    console.log(`\n=== RUNNING TEST: ${testName} ===`);
    const req = {
        headers: { 'x-request-id': `test-${Date.now()}` },
        user: { id: 'd3bb8bc9-6cf3-4f17-8f38-be1173e2caf5' } // Actual User ID
    };
    
    const axios = require('axios');
    const originalPost = axios.post;
    axios.post = async function(url, data, config) {
        if (url.includes('generate')) {
            data.farmer_id = 'test-farmer-' + crypto.randomUUID();
        }
        return originalPost.call(this, url, data, config);
    };
    
    let responseStatus, responseJson;
    const res = {
        setHeader: () => {},
        status: function(code) { this.statusCode = code; responseStatus = code; return this; },
        json: function(data) { responseJson = data; }
    };
    
    await aiBriefingController.generateBriefing(req, res);
    
    console.log("HTTP Status:", responseStatus);
    console.log("Is Fallback?", responseJson.status === 'error' || responseJson.error != null);
    if (responseJson.error) {
        console.log("Fallback Error Object:", responseJson.error);
    }
    console.log("Decisions count:", responseJson.decisions ? responseJson.decisions.length : 0);
    if (responseJson.topDecision) {
        console.log("Top Decision Title:", responseJson.topDecision.title);
    }
    
    axios.post = originalPost;
}

async function runAll() {
    const groqPath = '../backend/ai_engine/groq_service.py';
    const groqCode = fs.readFileSync(groqPath, 'utf8');
    
    console.log("\n\n--- 1. Everything online ---");
    await runTest("Normal Flow");
    
    console.log("\n\n--- 2. Groq unavailable ---");
    const brokenGroq = groqCode.replace('response = await self.client.chat.completions.create(', 'raise Exception("Mocked Groq Unavailable Error")\n            response = await self.client.chat.completions.create(');
    fs.writeFileSync(groqPath, brokenGroq);
    await new Promise(r => setTimeout(r, 2000)); // wait for reload
    await runTest("Groq Failure Fallback");
    
    console.log("\n\n--- 3. AI produces invalid phrase ---");
    const invalidPhraseGroq = groqCode.replace('return OutputFormatter.format_groq_response(raw_response)', 'raw_response += " this may help you"\n            return OutputFormatter.format_groq_response(raw_response)');
    fs.writeFileSync(groqPath, invalidPhraseGroq);
    await new Promise(r => setTimeout(r, 2000)); // wait for reload
    await runTest("Validator Failure Fallback");
    
    // Restore
    fs.writeFileSync(groqPath, groqCode);
    console.log("\n\nTests Complete. Restored Python code.");
}

runAll();
