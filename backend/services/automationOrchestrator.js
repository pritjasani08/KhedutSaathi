const eventBroker = require('../utils/eventBroker');
const EVENTS = require('../constants/events');
const { buildEventPayload } = require('../constants/events');
const automationLogger = require('../utils/automationLogger');
const automationMetrics = require('../utils/automationMetrics');
const timelineService = require('./timelineService');
const notificationService = require('./notificationService');
const crypto = require('crypto');
const { getDbClient } = require('../config/db');

class AutomationOrchestrator {
    constructor() {
        this.inFlightEvents = new Set();
        this.isShuttingDown = false;
        this.setupListeners();
    }

    /**
     * Idempotency check using DB (Two-Phase Processing).
     */
    async isDuplicate(signature, eventType, userId, correlationId) {
        const adminClient = getDbClient(true);
        try {
            // Check if exists
            const { data, error: fetchError } = await adminClient
                .from('automation_processed_events')
                .select('signature, status')
                .eq('signature', signature)
                .single();
                
            if (data && data.signature) {
                // If it's PROCESSING, SUCCESS, or REPLAYING, it's a duplicate.
                // If it's FAILED or CANCELLED, we technically *could* process it again, but usually 
                // failed events should be routed through the DLQ replay endpoint instead to prevent race conditions.
                return true;
            }
            
            // Phase 1: Insert as PROCESSING
            await adminClient
                .from('automation_processed_events')
                .insert([{ 
                    signature, 
                    event_type: eventType, 
                    user_id: userId,
                    correlation_id: correlationId,
                    status: 'PROCESSING'
                }]);
                
            return false;
        } catch (error) {
            // On failure to check, fail open and process anyway to prevent blocking
            automationLogger.warn('Idempotency DB check failed, proceeding to process', { signature, correlationId, error: error.message });
            return false;
        }
    }

    async updateIdempotencyStatus(signature, status) {
        const adminClient = getDbClient(true);
        try {
            await adminClient
                .from('automation_processed_events')
                .update({ status })
                .eq('signature', signature);
        } catch (error) {
            automationLogger.error('Failed to update idempotency status', { signature, status, error: error.message });
        }
    }

    setupListeners() {
        // Timeline and Notification generating events
        const automationTriggers = [
            EVENTS.AUTH_REGISTERED,
            EVENTS.AUTH_LOGIN,
            EVENTS.PROFILE_UPDATED,
            EVENTS.PROFILE_COMPLETED,
            EVENTS.CROP_PLAN_GENERATED,
            EVENTS.CROP_PLAN_UPDATED,
            EVENTS.DISEASE_DETECTED,
            EVENTS.DISEASE_RESOLVED,
            EVENTS.YIELD_PREDICTED,
            EVENTS.MARKETPLACE_LISTING_CREATED,
            EVENTS.MARKETPLACE_BID_PLACED,
            EVENTS.MARKETPLACE_DEAL_ACCEPTED,
            EVENTS.MARKETPLACE_ORDER_CREATED,
            EVENTS.MARKETPLACE_ORDER_COMPLETED,
            EVENTS.WEATHER_WARNING_RECEIVED,
            EVENTS.WEATHER_ALERT,
            EVENTS.RAIN_FORECAST,
            EVENTS.EXTREME_HEAT_ALERT,
            EVENTS.SCHEME_MATCHED,
            EVENTS.SCHEME_EXPIRING,
            EVENTS.SCHEME_DEADLINE_APPROACHING,
            EVENTS.IRRIGATION_DUE,
            EVENTS.FERTILIZER_DUE,
            EVENTS.HARVEST_DUE
        ];

        automationTriggers.forEach(eventType => {
            eventBroker.subscribe(eventType, async (payload) => {
                if (this.isShuttingDown) {
                    automationLogger.warn('Dropped event due to graceful shutdown', { eventType, correlationId: payload.correlationId });
                    return;
                }
                const eventPromise = this.handleAutomationTrigger(payload);
                this.inFlightEvents.add(eventPromise);
                try {
                    await eventPromise;
                } finally {
                    this.inFlightEvents.delete(eventPromise);
                }
            });
        });

        automationLogger.info('Orchestrator initialized', { triggers: automationTriggers });
    }

    async handleAutomationTrigger(payload) {
        const startTime = Date.now();
        const { eventType, userId, entityId, source, correlationId } = payload;
        
        if (!userId || !eventType || !correlationId) {
            automationLogger.warn('Dropped event missing required fields (or skipped schema validation)', { payload });
            return;
        }

        // Idempotency signature using a hash of the Event Payload
        const dateStr = new Date().toISOString().split('T')[0]; // Daily window for most deduplication
        const signature = crypto.createHash('sha256')
            .update(`${eventType}:${userId}:${entityId || ''}:${dateStr}`)
            .digest('hex');

        const isDup = await this.isDuplicate(signature, eventType, userId, correlationId);
        if (isDup) {
            automationLogger.info('Skipped duplicate event', { eventType, userId, signature, correlationId });
            return;
        }

        automationLogger.info('Processing automation trigger', { eventType, userId, signature, correlationId });

        try {
            // 1. Generate Timeline Tasks
            await this.triggerTimelineGeneration(userId, payload);
            
            // 2. Generate Proactive Notifications
            await this.triggerNotificationGeneration(userId, payload);
            
            // Phase 2: Mark Success
            await this.updateIdempotencyStatus(signature, 'SUCCESS');
            
            automationLogger.info('Successfully processed automation trigger', { eventType, userId, correlationId });
            automationMetrics.record(payload, Date.now() - startTime, 'SUCCESS');
        } catch (error) {
            automationLogger.error('Failed to process automation trigger', { eventType, userId, correlationId, error: error.message, stack: error.stack });
            automationMetrics.record(payload, Date.now() - startTime, 'FAILED', error.message);
            
            // Phase 2: Mark Failed
            await this.updateIdempotencyStatus(signature, 'FAILED');
            
            // Send to Dead-Letter Queue
            const adminClient = getDbClient(true);
            await adminClient.from('automation_failed_events').insert([{
                event_type: eventType,
                payload: payload,
                error_message: error.message,
                correlation_id: correlationId,
                status: 'FAILED'
            }]);
        }
    }

    async triggerTimelineGeneration(userId, payload) {
        try {
            // We pass the full payload to allow contextual templates
            const newTasks = await timelineService.admin.generateTimelineForUser(userId, payload);
            if (newTasks && newTasks.length > 0) {
                automationLogger.info('Generated timeline tasks', { userId, eventType: payload.eventType, correlationId: payload.correlationId, count: newTasks.length });
                eventBroker.publish('SSE_TIMELINE_UPDATE', buildEventPayload('SSE_TIMELINE_UPDATE', userId, null, 'timeline', { correlationId: payload.correlationId })); // Notify SSE
            }
        } catch (error) {
            automationLogger.error('Timeline generation failed in orchestrator', { userId, eventType: payload.eventType, correlationId: payload.correlationId, error: error.message });
            // Throw so DLQ triggers correctly for Timeline failures
            throw error;
        }
    }

    async triggerNotificationGeneration(userId, payload) {
        try {
            // For now, resolving the profile to pass it to notificationService
            const { resolveFarmerProfile } = require('./profileResolver');
            const { profile } = await resolveFarmerProfile(userId);
            
            const newNotifications = await notificationService.generateProactiveNotificationsForUser(userId, profile, payload);
            
            if (newNotifications && newNotifications.length > 0) {
                const adminClient = getDbClient(true);
                const { error: insertError } = await adminClient
                    .from('notifications')
                    .insert(newNotifications);
                    
                if (insertError) {
                    throw insertError;
                }
                automationLogger.info('Generated and inserted notifications', { userId, eventType: payload.eventType, correlationId: payload.correlationId, count: newNotifications.length });
                eventBroker.publish('SSE_NOTIFICATION_UPDATE', buildEventPayload('SSE_NOTIFICATION_UPDATE', userId, null, 'notification', { correlationId: payload.correlationId })); // Notify SSE
            }
        } catch (error) {
            automationLogger.error('Notification generation failed in orchestrator', { userId, eventType: payload.eventType, correlationId: payload.correlationId, error: error.message });
            throw error;
        }
    }

    /**
     * Graceful shutdown for deployments
     */
    async gracefulShutdown() {
        automationLogger.info('Orchestrator initiating graceful shutdown...');
        this.isShuttingDown = true;
        if (this.inFlightEvents.size > 0) {
            automationLogger.info(`Waiting for ${this.inFlightEvents.size} in-flight events to complete...`);
            await Promise.allSettled(Array.from(this.inFlightEvents));
        }
        automationLogger.info('Orchestrator shutdown complete.');
    }
}

// Singleton
module.exports = new AutomationOrchestrator();
