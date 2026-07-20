const express = require('express');
const router = express.Router();
const { getAdvice } = require('../controllers/irrigationController');
const { getIrrigationPlan } = require('../controllers/irrigationPlannerController');

router.get('/advice', getAdvice);
router.post('/plan', getIrrigationPlan);

module.exports = router;
