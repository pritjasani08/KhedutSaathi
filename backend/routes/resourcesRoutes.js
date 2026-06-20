const express = require('express');
const router = express.Router();
const resourcesController = require('../controllers/resourcesController');

router.get('/agri-news', resourcesController.getNews);
router.get('/schemes', resourcesController.getSchemes);
router.get('/weather', resourcesController.getWeather);

module.exports = router;
