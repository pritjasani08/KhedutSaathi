const express = require('express');
const router = express.Router();
const { getCropPlan } = require('../controllers/cropPlannerController');
const { optionalAuth } = require('../middleware/authMiddleware');

// POST /api/crop-planner/plan
router.post('/plan', optionalAuth, getCropPlan);

module.exports = router;
