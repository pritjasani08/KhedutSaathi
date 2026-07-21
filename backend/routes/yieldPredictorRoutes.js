const express = require('express');
const router = express.Router();
const { getYieldPrediction } = require('../controllers/yieldPredictorController');
const { optionalAuth } = require('../middleware/authMiddleware');

// POST /api/yield-predictor/predict
router.post('/predict', optionalAuth, getYieldPrediction);

module.exports = router;
