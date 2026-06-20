const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/overview', requireAuth, dashboardController.getOverview);

module.exports = router;
