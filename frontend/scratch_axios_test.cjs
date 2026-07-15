const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log("URL:", api.getUri({ url: '/ai/planner' }));
console.log("URL without leading slash:", api.getUri({ url: 'ai/planner' }));
