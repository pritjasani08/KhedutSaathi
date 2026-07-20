const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');

// Search Knowledge Base
router.post('/search', knowledgeController.searchKnowledge);

module.exports = router;
