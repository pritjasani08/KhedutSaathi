const express = require('express');
const router = express.Router();
const marketPriceController = require('../controllers/marketPriceController');
const { requireAuth } = require('../middleware/authMiddleware');

// Health check
router.get('/health', marketPriceController.checkHealth);

// Dynamic dropdown endpoints
router.get('/states', marketPriceController.getStates);
router.get('/districts', marketPriceController.getDistricts);
router.get('/markets', marketPriceController.getMarkets);
router.get('/commodities', marketPriceController.getCommodities);

// Personalized feed
router.get('/feed', requireAuth, marketPriceController.getPersonalizedFeed);

// Main list
router.get('/', marketPriceController.getMarketPrices);

// By state
router.get('/:state', marketPriceController.getMarketPricesByState);

module.exports = router;
