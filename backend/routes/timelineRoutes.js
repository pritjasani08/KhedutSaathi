const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/', timelineController.getTimeline);
router.post('/generate', timelineController.generateTimeline);
router.post('/convert', timelineController.convertNotificationToTask);
router.put('/:id/complete', timelineController.completeTask);
router.put('/:id/postpone', timelineController.postponeTask);
router.put('/:id/dismiss', timelineController.dismissTask);

module.exports = router;
