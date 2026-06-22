const express = require('express');
const router = express.Router();
const multer = require('multer');
const { transcribeAudio } = require('../controllers/aiController');

// Multer config for temporary audio file storage
const upload = multer({ dest: 'uploads/audio/' });

// POST /api/ai/transcribe
router.post('/transcribe', upload.single('audio'), transcribeAudio);

module.exports = router;
