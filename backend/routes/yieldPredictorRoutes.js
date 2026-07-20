const express = require('express');
const router = express.Router();
const { getYieldPrediction } = require('../controllers/yieldPredictorController');

// POST /api/yield-predictor/predict
router.post('/predict', getYieldPrediction);

module.exports = router;
