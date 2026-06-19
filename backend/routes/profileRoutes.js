const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middleware/authMiddleware');

console.log('[PROFILE] routes imported');

router.get('/', requireAuth, profileController.getProfile);
router.post('/', requireAuth, profileController.upsertProfile);
router.put('/', requireAuth, profileController.upsertProfile);

console.log('[PROFILE] routes registered');

module.exports = router;
