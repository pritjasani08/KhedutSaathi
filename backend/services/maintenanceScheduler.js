const cron = require('node-cron');
const { getDbClient } = require('../config/db');
const automationLogger = require('../utils/automationLogger');

/**
 * Maintenance Scheduler
 * Responsibilities:
 * - Retention cleanup (processed events > 30 days)
 * - Metrics cleanup (metrics > 90 days)
 * - Expired signature cleanup (PROCESSING locks that got stuck)
 * - Health housekeeping logging
 */
class MaintenanceScheduler {
    constructor() {
        this.schedulerJob = null;
    }

    start() {
        if (this.schedulerJob) {
            automationLogger.warn('Maintenance Scheduler already running.');
            return;
        }

        // Run daily at 02:00 AM
        this.schedulerJob = cron.schedule('0 2 * * *', async () => {
            automationLogger.info('Starting daily maintenance jobs...');
            await this.runCleanupTasks();
        });

        automationLogger.info('Maintenance Scheduler initialized.');
    }

    stop() {
        if (this.schedulerJob) {
            this.schedulerJob.stop();
            this.schedulerJob = null;
            automationLogger.info('Maintenance Scheduler stopped.');
        }
    }

    async runCleanupTasks() {
        const adminClient = getDbClient(true);
        
        try {
            // 1. Processed Events Cleanup (Keep idempotency history manageable)
            // Anything older than 30 days is safely removed
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            await adminClient
                .from('automation_processed_events')
                .delete()
                .lt('created_at', thirtyDaysAgo.toISOString());
                
            // 2. Metrics Cleanup (Keep performance history for 90 days)
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            
            await adminClient
                .from('automation_metrics')
                .delete()
                .lt('created_at', ninetyDaysAgo.toISOString());
                
            // 3. Expired Signatures Cleanup
            // Any event stuck in 'PROCESSING' for more than 24 hours (or past expires_at)
            await adminClient
                .from('automation_processed_events')
                .delete()
                .eq('status', 'PROCESSING')
                .lt('expires_at', new Date().toISOString());
                
            automationLogger.info('Maintenance cleanup tasks completed successfully.');
        } catch (error) {
            automationLogger.error('Maintenance cleanup failed', { error: error.message });
        }
    }
}

module.exports = new MaintenanceScheduler();
