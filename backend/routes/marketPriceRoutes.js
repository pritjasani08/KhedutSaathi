const express = require('express');
const router = express.Router();
const marketPriceController = require('../controllers/marketPriceController');

// Health check
router.get('/health', marketPriceController.checkHealth);

// Dynamic dropdown endpoints
router.get('/states', marketPriceController.getStates);
router.get('/districts', marketPriceController.getDistricts);
router.get('/markets', marketPriceController.getMarkets);
router.get('/commodities', marketPriceController.getCommodities);

// Main list
router.get('/', marketPriceController.getMarketPrices);

// By state
router.get('/:state', marketPriceController.getMarketPricesByState);

module.exports = router;
