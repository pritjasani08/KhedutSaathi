const axios = require('axios');

const api = axios.create({
  baseURL: '/api',
});

console.log("baseURL: '/api', url: '/ai/planner' ->", api.getUri({ url: '/ai/planner' }));
console.log("baseURL: '/api', url: 'ai/planner' ->", api.getUri({ url: 'ai/planner' }));
