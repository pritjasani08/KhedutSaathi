require('dotenv').config({ path: '../.env' });
const timelineController = require('./controllers/timelineController');

async function run() {
    const req = {
        user: {
            id: 'd89cea52-e03b-4f74-91bf-efe7eaac3156',
            sub: 'd89cea52-e03b-4f74-91bf-efe7eaac3156',
            email: 'test@example.com',
            user_type: 'farmer'
        }
    };
    const res = {
        status: function(s) { console.log("Status:", s); return this; },
        json: function(data) { console.log("JSON:", JSON.stringify(data, null, 2)); return this; }
    };
    
    await timelineController.getTimeline(req, res);
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
