const aiPlannerController = require('./controllers/aiPlannerController');
const logger = require('./utils/logger');
const axios = require('axios');

// Override logger to capture errors
const logs = [];
logger.error = (message, meta) => logs.push({ level: 'ERROR', message, meta });

const req = {
    headers: { 'x-request-id': 'test-123' },
    body: {
        state: 'Gujarat',
        district: 'Junagadh',
        soilType: 'Black Soil',
        farmArea: '5',
        season: 'Kharif',
        waterAvailability: 'High',
        irrigation: 'Rainfed',
        previousCrop: 'Cotton',
        cropDuration: 4
    }
};

const res = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) {
        this.data = data;
        console.log("Response:", this.statusCode, this.data);
    }
};

// We want to monkeypatch axios to see exactly what throws and why
const originalPost = axios.post;
axios.post = async function(...args) {
    console.log("Axios POST called with URL:", args[0]);
    try {
        return await originalPost.apply(this, args);
    } catch (e) {
        console.log("AXIOS THREW!");
        console.log("Error Name:", e.name);
        console.log("Error Message:", e.message);
        console.log("Stack:", e.stack);
        throw e;
    }
};

aiPlannerController.generatePlannerSynthesis(req, res);
