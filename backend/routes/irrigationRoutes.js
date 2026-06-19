const express = require('express');
const router = express.Router();
const { getAdvice } = require('../controllers/irrigationController');

router.get('/advice', getAdvice);

module.exports = router;
