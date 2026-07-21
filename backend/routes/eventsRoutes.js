const express = require('express');
const router = express.Router();
const eventBroker = require('../utils/eventBroker');
const sseBroker = require('../utils/sseBroker');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * GET /api/events/stream
 * Establish an SSE connection for real-time automation updates.
 */
router.get('/stream', authMiddleware.requireAuth, (req, res) => {
    const userId = req.user.id;

    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial connection success message
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE connection established' })}\n\n`);

    // Register with broker
    sseBroker.registerClient(userId, res, req);
});

// Wire the eventBroker to push updates to SSE via sseBroker
eventBroker.subscribe('SSE_TIMELINE_UPDATE', ({ userId }) => {
    sseBroker.broadcastToUser(userId, 'TIMELINE_UPDATE', { message: 'New timeline tasks available.' });
});

eventBroker.subscribe('SSE_NOTIFICATION_UPDATE', ({ userId }) => {
    sseBroker.broadcastToUser(userId, 'NOTIFICATION_UPDATE', { message: 'New notifications available.' });
});

module.exports = router;
