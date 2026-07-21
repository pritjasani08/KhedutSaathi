const EVENTS = require('./events');

/**
 * Returns contextual timeline tasks based on the event type and metadata.
 * These act as candidates that can be sent to the AI for refinement or saved directly as a fallback.
 */
function getTimelineTemplates(eventType, metadata = {}) {
    switch (eventType) {
        case EVENTS.CROP_PLAN_GENERATED:
            return [
                { task_type: 'land_prep', title: `Prepare land for ${metadata.crop || 'your crop'}`, description: 'Clear the field and prepare the soil for sowing.', due_date: new Date(Date.now() + 2 * 86400000).toISOString() },
                { task_type: 'sowing', title: 'Purchase Seeds', description: `Purchase high-quality ${metadata.crop || 'seeds'} for the upcoming season.`, due_date: new Date(Date.now() + 5 * 86400000).toISOString() }
            ];
            
        case EVENTS.DISEASE_DETECTED:
            return [
                { task_type: 'treatment', title: `Apply treatment for ${metadata.diseaseName || 'disease'}`, description: 'Apply recommended fungicide/pesticide immediately to stop the spread.', due_date: new Date(Date.now() + 1 * 86400000).toISOString(), priority: 'High' },
                { task_type: 'monitoring', title: 'Reinspect crop', description: 'Check the infected area to see if the treatment was effective.', due_date: new Date(Date.now() + 5 * 86400000).toISOString() }
            ];
            
        case EVENTS.YIELD_PREDICTED:
            return [
                { task_type: 'planning', title: 'Review yield prediction', description: 'Analyze the recent yield prediction report to optimize inputs.', due_date: new Date(Date.now() + 1 * 86400000).toISOString() }
            ];

        case EVENTS.PROFILE_COMPLETED:
            return [
                { task_type: 'planning', title: 'Create your first crop plan', description: 'Use the AI Crop Planner to get tailored recommendations for your farm.', due_date: new Date(Date.now() + 1 * 86400000).toISOString(), priority: 'High', trigger: 'PROFILE_COMPLETED_CROP_PLAN' },
                { task_type: 'general', title: 'Explore the Marketplace', description: 'Check out current crop prices and connect with buyers.', due_date: new Date(Date.now() + 3 * 86400000).toISOString(), trigger: 'PROFILE_COMPLETED_MARKETPLACE' }
            ];

        case EVENTS.MARKETPLACE_LISTING_CREATED:
            return [
                { task_type: 'general', title: `Review bids for ${metadata.cropName || 'listing'}`, description: 'Monitor incoming offers from buyers and negotiate prices.', due_date: new Date(Date.now() + 2 * 86400000).toISOString(), priority: 'High', trigger: `MARKETPLACE_LISTING_BIDS_${metadata.listingId || Date.now()}` },
                { task_type: 'general', title: 'Prepare produce samples', description: 'Have samples of your produce ready for potential buyers to inspect.', due_date: new Date(Date.now() + 1 * 86400000).toISOString(), trigger: `MARKETPLACE_LISTING_SAMPLES_${metadata.listingId || Date.now()}` }
            ];

        case EVENTS.MARKETPLACE_DEAL_ACCEPTED:
            return [
                { task_type: 'general', title: 'Arrange transport', description: 'Coordinate with the buyer or logistics provider to transport the sold produce.', due_date: new Date(Date.now() + 2 * 86400000).toISOString(), priority: 'High', trigger: `MARKETPLACE_DEAL_TRANSPORT_${metadata.dealId || Date.now()}` },
                { task_type: 'general', title: 'Prepare produce for delivery', description: 'Clean, weigh, and package your produce for final delivery.', due_date: new Date(Date.now() + 1 * 86400000).toISOString(), priority: 'High', trigger: `MARKETPLACE_DEAL_DELIVERY_${metadata.dealId || Date.now()}` },
                { task_type: 'general', title: 'Confirm payment receipt', description: 'Ensure the agreed payment has been deposited into your account before final handover.', due_date: new Date(Date.now() + 3 * 86400000).toISOString(), priority: 'High', trigger: `MARKETPLACE_DEAL_PAYMENT_${metadata.dealId || Date.now()}` }
            ];

        case EVENTS.WEATHER_ALERT:
        case EVENTS.RAIN_FORECAST:
            return [
                { task_type: 'irrigation', title: 'Delay irrigation', description: 'Heavy rainfall is expected. Pause irrigation to prevent waterlogging.', due_date: new Date(Date.now() + 1 * 86400000).toISOString(), priority: 'High' },
                { task_type: 'protection', title: 'Protect harvested crop', description: 'Ensure any harvested crop is covered or moved indoors.', due_date: new Date(Date.now() + 1 * 86400000).toISOString(), priority: 'High' }
            ];
            
        case EVENTS.EXTREME_HEAT_ALERT:
            return [
                { task_type: 'irrigation', title: 'Increase irrigation', description: 'Extreme heat expected. Ensure crops have adequate water.', due_date: new Date(Date.now() + 1 * 86400000).toISOString(), priority: 'High' }
            ];
            
        case EVENTS.SCHEME_EXPIRING:
            return [
                { task_type: 'application', title: `Apply for ${metadata.schemeTitle || 'scheme'}`, description: 'The deadline for this scheme is approaching. Submit your application soon.', due_date: new Date(Date.now() + 3 * 86400000).toISOString(), priority: 'Medium' }
            ];

        case EVENTS.IRRIGATION_DUE:
            return [
                { task_type: 'irrigation', title: 'Irrigation Due', description: `It is time to irrigate your ${metadata.cropName || 'crop'} based on its current lifecycle stage.`, due_date: new Date(Date.now() + 1 * 86400000).toISOString() }
            ];

        case EVENTS.FERTILIZER_DUE:
            return [
                { task_type: 'fertilizer', title: 'Fertilizer Application', description: `Apply the recommended fertilizer for your ${metadata.cropName || 'crop'}.`, due_date: new Date(Date.now() + 2 * 86400000).toISOString() }
            ];
            
        case EVENTS.HARVEST_DUE:
            return [
                { task_type: 'harvest', title: 'Prepare for Harvest', description: `Your ${metadata.cropName || 'crop'} is nearing maturity. Prepare equipment for harvesting.`, due_date: new Date(Date.now() + 7 * 86400000).toISOString() }
            ];
            
        default:
            return []; // No timeline templates for generic events
    }
}

module.exports = {
    getTimelineTemplates
};
