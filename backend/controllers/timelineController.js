const timelineService = require('../services/timelineService');
const logger = require('../utils/logger');
const eventBus = require('../utils/eventBus');
const { TIMELINE_TASK_COMPLETED, buildEventPayload } = require('../constants/events');

// GET /api/timeline
exports.getTimeline = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await timelineService.user.getTimeline(userId);
        res.json({ success: true, data });
    } catch (err) {
        if (err.name === 'FarmerProfileNotFoundError') {
            return res.status(404).json({ success: false, message: 'Farmer profile not found' });
        }
        logger.error(`Error fetching timeline: ${err.message}`);
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST /api/timeline/generate
exports.generateTimeline = async (req, res) => {
    try {
        const userId = req.user.id;
        // The service now handles fetching the profile
        const tasks = await timelineService.user.generateTimeline(userId);
        res.json({ success: true, count: tasks.length, data: tasks });
    } catch (err) {
        logger.error(`Error generating timeline: ${err.message}`);
        res.status(500).json({ success: false, error: err.message });
    }
};

// PUT /api/timeline/:id/complete
exports.completeTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        const data = await timelineService.user.updateTaskStatus(userId, id, { 
            status: 'COMPLETED',
            completed_at: new Date().toISOString()
        });

        eventBus.emit(TIMELINE_TASK_COMPLETED, buildEventPayload(TIMELINE_TASK_COMPLETED, userId, id, 'timeline', { taskTitle: data.title }));

        res.json({ success: true, data });
    } catch (err) {
        // Return 403 Forbidden for auth errors, otherwise 500
        if (err.message.includes('Unauthorized')) {
            return res.status(403).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: err.message });
    }
};

// PUT /api/timeline/:id/postpone
exports.postponeTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { postpone_days = 1 } = req.body;
        
        const data = await timelineService.user.postponeTask(userId, id, postpone_days);

        res.json({ success: true, data });
    } catch (err) {
        if (err.message.includes('Unauthorized')) {
            return res.status(403).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: err.message });
    }
};

// PUT /api/timeline/:id/dismiss
exports.dismissTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        const data = await timelineService.user.updateTaskStatus(userId, id, { 
            status: 'DISMISSED',
            dismissed_at: new Date().toISOString()
        });

        res.json({ success: true, data });
    } catch (err) {
        if (err.message.includes('Unauthorized')) {
            return res.status(403).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST /api/timeline/convert
exports.convertNotificationToTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notification_id } = req.body;
        
        if (!notification_id) throw new Error("Missing notification_id");
        
        const data = await timelineService.user.createTaskFromNotification(userId, notification_id);
        res.json({ success: true, data });
    } catch (err) {
        if (err.message.includes('Unauthorized')) {
            return res.status(403).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: err.message });
    }
};
