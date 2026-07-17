const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAuth } = require('../middleware/authMiddleware');
const { transcribeAudio } = require('../controllers/aiController');
const { generateBriefing, updateFeedback } = require('../controllers/aiBriefingController');
const { generatePlannerSynthesis } = require('../controllers/aiPlannerController');

// Multer config for temporary audio file storage
const upload = multer({ dest: 'uploads/audio/' });

// POST /api/ai/transcribe
router.post('/transcribe', upload.single('audio'), transcribeAudio);

// POST /api/ai/briefing (AI Decision Engine)
router.post('/briefing', requireAuth, generateBriefing);

// POST /api/ai/feedback (AI Decision Feedback)
router.post('/feedback', requireAuth, updateFeedback);

// POST /api/ai/planner (Crop Planner Engine)
router.post('/planner', requireAuth, generatePlannerSynthesis);

module.exports = router;
