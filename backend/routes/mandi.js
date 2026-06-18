const express = require('express');
const router = express.Router();
const mandiController = require('../controllers/mandiController');

router.get('/states', mandiController.getStates);
router.get('/districts/:state', mandiController.getDistricts);
router.get('/mandis/:district', mandiController.getMandis);
router.get('/crops', mandiController.getCrops);
router.get('/prices', mandiController.getPrices);

module.exports = router;
