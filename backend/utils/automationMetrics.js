const { getDbClient } = require('../config/db');
const logger = require('./logger');

/**
 * Persists automation metrics to the database for long-term health tracking.
 */
class AutomationMetrics {
    constructor() {
        this.metrics = [];
        this.flushInterval = setInterval(() => this.flush(), 60000); // Flush every minute
    }

    /**
     * Record a metric event.
     */
    record(eventPayload, executionTimeMs, status, errorMsg = null) {
        this.metrics.push({
            event_type: eventPayload.eventType,
            source_module: eventPayload.source,
            execution_time_ms: executionTimeMs,
            status,
            error_message: errorMsg,
            created_at: new Date().toISOString()
        });
        
        logger.info(`[Automation Metric] ${eventPayload.eventType} (${status}) in ${executionTimeMs}ms`);
    }

    async flush() {
        if (this.metrics.length === 0) return;
        
        const toInsert = [...this.metrics];
        this.metrics = [];
        
        try {
            const adminClient = getDbClient(true);
            const { error } = await adminClient
                .from('automation_metrics')
                .insert(toInsert);
                
            if (error) {
                // If the table doesn't exist yet, we'll log it.
                logger.warn(`Failed to flush automation metrics to DB (table might not exist): ${error.message}`);
            }
        } catch (error) {
            logger.error(`Error flushing automation metrics: ${error.message}`);
        }
    }
}

module.exports = new AutomationMetrics();
