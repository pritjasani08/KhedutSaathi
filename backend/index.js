if (!process.env.DATA_GOV_API_KEY) {
  console.error("DATA_GOV_API_KEY is missing");
}
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mandiRoutes = require('./routes/mandi');
const marketPriceRoutes = require('./routes/marketPriceRoutes');
const authRoutes = require('./routes/auth');
const irrigationRoutes = require('./routes/irrigationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all requests or restrict to your frontend domain (Vite dev server)
app.use(cors({
  origin: '*', // For development flexibility
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/api/mandi', mandiRoutes);
app.use('/api/market-prices', marketPriceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/irrigation', irrigationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Default API route info
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to KhedutSaathi Agriculture API Backend' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  
  const response = {
    message: process.env.NODE_ENV === 'development' 
      ? (err.message || 'An unexpected error occurred on the server')
      : 'An unexpected error occurred on the server'
  };

  if (process.env.NODE_ENV === 'development') {
    response.error = err.stack || err;
  }

  res.status(err.status || 500).json(response);
});

app.listen(PORT, () => {
  console.log(`KhedutSaathi Backend Server running on http://localhost:${PORT}`);
});
