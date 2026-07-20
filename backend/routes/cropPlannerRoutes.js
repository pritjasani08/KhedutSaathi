const express = require('express');
const router = express.Router();
const { getCropPlan } = require('../controllers/cropPlannerController');

// POST /api/crop-planner/plan
router.post('/plan', getCropPlan);

module.exports = router;
