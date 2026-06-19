const express = require('express');
const router = express.Router();
const schemesController = require('../controllers/schemesController');

router.post('/eligible', schemesController.checkEligibility);

module.exports = router;
