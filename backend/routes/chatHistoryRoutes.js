const express = require('express');
const router = express.Router();
const chatHistoryController = require('../controllers/chatHistoryController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, chatHistoryController.getSessions);
router.post('/', requireAuth, chatHistoryController.saveSession);
router.delete('/:id', requireAuth, chatHistoryController.deleteSession);

module.exports = router;
