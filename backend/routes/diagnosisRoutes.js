const express = require('express');
const router = express.Router();
const multer = require('multer');
const os = require('os');
const { analyzeCrop, getHistory, saveHistory } = require('../controllers/diagnosisController');
const { requireAuth } = require('../middleware/authMiddleware');

const upload = multer({ dest: os.tmpdir() });

router.post('/analyze', upload.single('image'), analyzeCrop);
router.get('/history', requireAuth, getHistory);
router.post('/history', requireAuth, saveHistory);

module.exports = router;
