const cron = require('node-cron');
const supabase = require('../config/supabaseClient');
const logger = require('../utils/logger');
const { generateProactiveNotificationsForUser } = require('../services/notificationService');
const profileResolver = require('../services/profileResolver');

class NotificationScheduler {
    constructor() {
        this.isRunning = false;
    }

    start() {
        // Run every 6 hours
        cron.schedule('0 */6 * * *', async () => {
            await this.runIteration();
        });
        
        logger.info('Notification Scheduler initialized (runs every 6 hours)');
    }

    async runIteration() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        logger.info('Starting proactive notification iteration...');
        
        try {
            const users = await profileResolver.getAllFarmerProfiles();
            if (!users || users.length === 0) return;
            
            // Batch processing: process 5 users concurrently to prevent overloading Python/Groq
            const batchSize = 5;
            for (let i = 0; i < users.length; i += batchSize) {
                const batch = users.slice(i, i + batchSize);
                
                const promises = batch.map(async (user) => {
                    // Strict Identity Flow: Pass users.id to AI Services, not farmer_profiles.id
                    const newNotifications = await generateProactiveNotificationsForUser(user.user_id, user);
                    
                    if (newNotifications && newNotifications.length > 0) {
                        const { error: insertError, data: insertedData } = await supabase
                            .from('notifications')
                            .insert(newNotifications)
                            .select();
                            
                        if (insertError) {
                            logger.error(`Failed to insert notifications for ${user.id}: ${insertError.message}`);
                        } else {
                            logger.info(`Inserted ${newNotifications.length} notifications for ${user.id}`);
                        }
                    }
                });
                
                await Promise.all(promises);
            }
            
        } catch (err) {
            logger.error(`Notification scheduler error: ${err.message}`);
        } finally {
            this.isRunning = false;
            logger.info('Proactive notification iteration complete.');
        }
    }
}

module.exports = new NotificationScheduler();
