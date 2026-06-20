const express = require('express');
const router = express.Router();
const multer = require('multer');
const os = require('os');
const { analyzeCrop } = require('../controllers/diagnosisController');

const upload = multer({ dest: os.tmpdir() });

router.post('/analyze', upload.single('image'), analyzeCrop);

module.exports = router;
