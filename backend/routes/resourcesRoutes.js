const express = require('express');
const router = express.Router();
const resourcesController = require('../controllers/resourcesController');

router.get('/agri-news', resourcesController.getNews);
router.get('/schemes', resourcesController.getSchemes);

module.exports = router;
