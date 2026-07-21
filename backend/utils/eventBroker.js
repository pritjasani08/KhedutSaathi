const eventBus = require('./eventBus'); // Current underlying implementation
const logger = require('./logger');
const crypto = require('crypto');

/**
 * EventBroker provides an abstraction over the underlying pub/sub mechanism.
 * Currently uses Node EventEmitter (eventBus), but can be cleanly swapped
 * to Redis Pub/Sub, RabbitMQ, or Kafka without changing business logic.
 */
class EventBroker {
    constructor() {
        this.provider = 'EventEmitter';
    }

    /**
     * Publish an event to the message broker.
     * @param {string} eventType 
     * @param {Object} payload 
     */
    publish(eventType, payload) {
        try {
            if (!payload || typeof payload !== 'object') {
                throw new Error('Event payload must be an object');
            }

            // Version-based schema validation
            const version = payload.version || 1;
            if (version === 1) {
                const requiredFields = ['eventType', 'userId', 'timestamp', 'source'];
                for (const field of requiredFields) {
                    if (payload[field] === undefined) {
                        throw new Error(`Invalid v1 event schema: Missing required field '${field}'`);
                    }
                }
            } else {
                throw new Error(`Unsupported event schema version: ${version}`);
            }

            // Enforce correct event type
            if (payload.eventType !== eventType) {
                throw new Error(`Invalid event schema: eventType in payload ('${payload.eventType}') does not match published type ('${eventType}')`);
            }

            // Inject correlationId if not present
            if (!payload.correlationId) {
                payload.correlationId = crypto.randomUUID();
            }

            // Ensure version is set for future-proofing
            payload.version = version;

            // Future: if (this.provider === 'Redis') redisClient.publish(...)
            eventBus.emit(eventType, payload);
            logger.info(`[EventBroker] Published event: ${eventType} (CorrelationId: ${payload.correlationId})`);
        } catch (error) {
            logger.error(`[EventBroker] Failed to publish event ${eventType}: ${error.message}`);
            throw error; // Reject malformed events early
        }
    }

    /**
     * Subscribe to an event from the message broker.
     * @param {string} eventType 
     * @param {Function} handler 
     */
    subscribe(eventType, handler) {
        try {
            // Future: if (this.provider === 'Redis') redisClient.subscribe(...)
            eventBus.on(eventType, async (payload) => {
                try {
                    await handler(payload);
                } catch (err) {
                    logger.error(`[EventBroker] Error in handler for ${eventType}: ${err.message}`);
                }
            });
            logger.info(`[EventBroker] Subscribed to event: ${eventType}`);
        } catch (error) {
            logger.error(`[EventBroker] Failed to subscribe to event ${eventType}: ${error.message}`);
        }
    }
}

module.exports = new EventBroker();
