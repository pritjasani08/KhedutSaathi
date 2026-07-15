const axios = require('axios');
const api = axios.create({ baseURL: 'http://localhost:5000/api' });
console.log('baseURL: http://localhost:5000/api, url: /ai/planner =>', api.getUri({url: '/ai/planner'}));
const api2 = axios.create({ baseURL: 'http://localhost:5000/api/' });
console.log('baseURL: http://localhost:5000/api/, url: /ai/planner =>', api2.getUri({url: '/ai/planner'}));
