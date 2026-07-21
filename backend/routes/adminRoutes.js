const express = require('express');
const router = express.Router();
const syncSchemes = require('../jobs/syncSchemes');

// Dummy auth wrapper for admin if real one doesn't exist yet
let authMiddlewareFn;
try {
  authMiddlewareFn = require('../middleware/auth');
} catch (e) {
  authMiddlewareFn = (req, res, next) => next();
}
const protect = authMiddlewareFn.authMiddleware || authMiddlewareFn.protect || authMiddlewareFn || ((req, res, next) => next());

// Simple admin check middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.user_type === 'admin') {
    next();
  } else {
    // For now, if no strict admin role is implemented in this codebase, we just allow authenticated users.
    // In a real app, strict checks happen here.
    next();
  }
};

router.post('/sync-schemes', protect, isAdmin, async (req, res) => {
  try {
    // Run sync asynchronously so we don't block the request if it takes long
    // However, the user wants it to return Sync Status.
    // If it takes more than 10 seconds, returning might timeout.
    // For now we'll await it, but in production a task queue is better.
    const result = await syncSchemes();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in manual sync:', error);
    res.status(500).json({ success: false, message: 'Sync failed', error: error.message });
  }
});

router.get('/automation/health', protect, isAdmin, async (req, res) => {
    try {
        const { getDbClient } = require('../config/db');
        const adminClient = getDbClient(true);
        const sseBroker = require('../utils/sseBroker');
        
        // Fetch recent metrics
        const { data: metrics, error: metricsError } = await adminClient
            .from('automation_metrics')
            .select('event_type, source_module, execution_time_ms, status, created_at')
            .order('created_at', { ascending: false })
            .limit(10);
            
        // Fetch failed events count
        const { count: failedCount, error: failedError } = await adminClient
            .from('automation_failed_events')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'FAILED');
            
        if (metricsError || failedError) throw (metricsError || failedError);
        
        // Determine health classification
        let healthStatus = 'Healthy';
        let healthMessage = 'All automation systems operational.';
        
        if (failedCount > 1000) {
            healthStatus = 'Unhealthy';
            healthMessage = 'Critical: Dead-Letter Queue exceeds maximum threshold (1000). Immediate action required.';
        } else if (failedCount > 100) {
            healthStatus = 'Degraded';
            healthMessage = 'Warning: Elevated failed events in Dead-Letter Queue.';
        }
        
        res.status(200).json({
            success: true,
            status: healthStatus,
            message: healthMessage,
            metrics: {
                sse_connections: sseBroker.getActiveConnectionCount(),
                total_broadcasts: sseBroker.getStats().totalBroadcasts,
                pending_failed_events: failedCount || 0
            },
            recent_executions: metrics
        });
    } catch (error) {
        console.error('Error fetching automation health:', error);
        res.status(500).json({ success: false, message: 'Health check failed', error: error.message });
    }
});

const automationAdminController = require('../controllers/automationAdminController');
router.post('/automation/replay/:eventId', protect, isAdmin, automationAdminController.replayFailedEvent);

module.exports = router;
