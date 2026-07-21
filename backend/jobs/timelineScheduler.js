const cron = require('node-cron');
const { getDbClient } = require('../config/db');
const logger = require('../utils/logger');
const timelineService = require('../services/timelineService');
const profileResolver = require('../services/profileResolver');

class TimelineScheduler {
    constructor() {
        this.isRunning = false;
    }

    start() {
        // Run every 12 hours (e.g. daily generation for new tasks)
        cron.schedule('0 */12 * * *', async () => {
            await this.runIteration();
        });
        
        logger.info('Timeline Scheduler initialized (runs every 12 hours)');
    }

    async runIteration() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        logger.info('Starting proactive timeline maintenance iteration...');
        
        try {
            // Clean up expired tasks
            await timelineService.admin.expireOldTasks();
            logger.info('Expired old timeline tasks.');
            
            // NOTE: We no longer mass-generate timeline tasks here.
            // Generation is now fully event-driven via automationOrchestrator and specialized schedulers.
            
        } catch (err) {
            logger.error(`Timeline scheduler error: ${err.message}`);
        } finally {
            this.isRunning = false;
            logger.info('Proactive timeline maintenance iteration complete.');
        }
    }
}

module.exports = new TimelineScheduler();
