const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// GET /api/notifications (Fetch active notifications for user)
router.get('/', requireAuth, notificationController.getNotifications);

// PUT /api/notifications/:id/read (Mark a notification as read)
router.put('/:id/read', requireAuth, notificationController.markAsRead);

// PUT /api/notifications/:id/dismiss (Dismiss a notification)
router.put('/:id/dismiss', requireAuth, notificationController.dismissNotification);

module.exports = router;
