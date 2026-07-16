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
        
        logger.info('Starting proactive timeline generation iteration...');
        
        try {
            const users = await profileResolver.getAllFarmerProfiles();
            if (!users || users.length === 0) return;
            
            // Clean up expired tasks
            await timelineService.admin.expireOldTasks();

            // Batch processing
            const batchSize = 5;
            for (let i = 0; i < users.length; i += batchSize) {
                const batch = users.slice(i, i + batchSize);
                
                const promises = batch.map(async (user) => {
                    // Strict Identity Flow: Pass users.id to AI Services, not farmer_profiles.id
                    const newTasks = await timelineService.admin.generateTimelineForUser(user.user_id, user);
                    if (newTasks && newTasks.length > 0) {
                        logger.info(`Generated ${newTasks.length} timeline tasks for ${user.user_id}`);
                    }
                });
                
                await Promise.all(promises);
            }
            
        } catch (err) {
            logger.error(`Timeline scheduler error: ${err.message}`);
        } finally {
            this.isRunning = false;
            logger.info('Proactive timeline iteration complete.');
        }
    }
}

module.exports = new TimelineScheduler();
