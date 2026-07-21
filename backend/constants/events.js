const EVENTS = {
    // Auth Events
    AUTH_REGISTERED: 'AUTH_REGISTERED',
    AUTH_LOGIN: 'AUTH_LOGIN',
    
    // Profile Events
    PROFILE_UPDATED: 'PROFILE_UPDATED',
    PROFILE_COMPLETED: 'PROFILE_COMPLETED',

    // Marketplace Events
    MARKETPLACE_LISTING_CREATED: 'MARKETPLACE_LISTING_CREATED',
    MARKETPLACE_BID_PLACED: 'MARKETPLACE_BID_PLACED',
    MARKETPLACE_DEAL_ACCEPTED: 'MARKETPLACE_DEAL_ACCEPTED',
    MARKETPLACE_ORDER_CREATED: 'MARKETPLACE_ORDER_CREATED',
    MARKETPLACE_ORDER_COMPLETED: 'MARKETPLACE_ORDER_COMPLETED',

    // Crop Events
    CROP_PLAN_GENERATED: 'CROP_PLAN_GENERATED',
    CROP_PLAN_UPDATED: 'CROP_PLAN_UPDATED',
    DISEASE_DETECTED: 'DISEASE_DETECTED',
    DISEASE_RESOLVED: 'DISEASE_RESOLVED',
    YIELD_PREDICTED: 'YIELD_PREDICTED',

    // Lifecycle Events
    IRRIGATION_DUE: 'IRRIGATION_DUE',
    FERTILIZER_DUE: 'FERTILIZER_DUE',
    HARVEST_DUE: 'HARVEST_DUE',

    // User Events
    USER_REGISTERED: 'USER_REGISTERED',
    USER_LOGGED_IN: 'USER_LOGGED_IN',

    // System Events
    WEATHER_WARNING_RECEIVED: 'WEATHER_WARNING_RECEIVED',
    WEATHER_ALERT: 'WEATHER_ALERT',
    RAIN_FORECAST: 'RAIN_FORECAST',
    EXTREME_HEAT_ALERT: 'EXTREME_HEAT_ALERT',
    SCHEME_MATCHED: 'SCHEME_MATCHED',
    SCHEME_EXPIRING: 'SCHEME_EXPIRING',
    SCHEME_DEADLINE_APPROACHING: 'SCHEME_DEADLINE_APPROACHING',
    
    // Timeline Events
    TIMELINE_TASK_COMPLETED: 'TIMELINE_TASK_COMPLETED',
};

/**
 * Builds a standardized event payload.
 * @param {string} eventType - The event type from EVENTS.
 * @param {string} userId - The ID of the user triggering or receiving the event.
 * @param {string} entityId - The ID of the related entity (e.g., listing ID, prediction ID).
 * @param {string} source - The module generating the event (e.g., 'marketplace', 'crop_planner').
 * @param {Object} metadata - Additional context for the event.
 */
function buildEventPayload(eventType, userId, entityId, source, metadata = {}) {
    if (!eventType || !userId || !source) {
        throw new Error('Event payload requires eventType, userId, and source.');
    }
    return {
        version: 1,
        eventType,
        userId,
        entityId: entityId || null,
        source,
        timestamp: new Date().toISOString(),
        metadata
    };
}

module.exports = {
    ...EVENTS,
    buildEventPayload
};
