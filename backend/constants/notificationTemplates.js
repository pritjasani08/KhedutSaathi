const EVENTS = require('./events');

/**
 * Returns contextual notification structures based on the event type and metadata.
 */
function getNotificationTemplates(eventType, metadata = {}) {
    switch (eventType) {
        case EVENTS.MARKETPLACE_LISTING_CREATED:
            return [{ type: 'INFO', title: 'Listing Created', message: `Your listing for ${metadata.cropName || 'crop'} has been created.`, isRead: false }];
            
        case EVENTS.MARKETPLACE_BID_PLACED:
            return [{ type: 'ALERT', title: 'New Bid Received', message: `You received a new bid of ₹${metadata.bidPrice} on your listing.`, isRead: false }];
            
        case EVENTS.MARKETPLACE_ORDER_CREATED:
            return [{ type: 'SUCCESS', title: 'Deal Closed', message: `You accepted a bid of ₹${metadata.finalPrice}. The deal is now closed.`, isRead: false }];
            
        case EVENTS.CROP_PLAN_GENERATED:
            return [{ type: 'SUCCESS', title: 'Crop Plan Ready', message: `Your crop schedule for ${metadata.crop || 'your crop'} has been generated.`, isRead: false }];
            
        case EVENTS.DISEASE_DETECTED:
            return [{ type: 'ALERT', title: 'Disease Detected', message: `Immediate treatment recommended for ${metadata.diseaseName || 'the disease'}.`, isRead: false }];
            
        case EVENTS.WEATHER_ALERT:
            return [{ type: 'ALERT', title: 'Weather Alert', message: `Extreme weather expected: ${metadata.alertDetails || 'Please check the weather dashboard.'}`, isRead: false }];
            
        case EVENTS.RAIN_FORECAST:
            return [{ type: 'INFO', title: 'Rain Forecast', message: 'Heavy rainfall expected tomorrow.', isRead: false }];
            
        case EVENTS.EXTREME_HEAT_ALERT:
            return [{ type: 'ALERT', title: 'Heatwave Alert', message: 'Extreme heat expected tomorrow. Ensure sufficient irrigation.', isRead: false }];
            
        case EVENTS.SCHEME_MATCHED:
            return [{ type: 'SUCCESS', title: 'New Scheme Match', message: `You are eligible for a subsidy: ${metadata.schemeTitle || 'Government Scheme'}.`, isRead: false }];
            
        case EVENTS.SCHEME_EXPIRING:
            return [{ type: 'WARNING', title: 'Scheme Expiring', message: `The deadline for ${metadata.schemeTitle || 'a scheme'} is approaching.`, isRead: false }];
            
        case EVENTS.IRRIGATION_DUE:
            return [{ type: 'INFO', title: 'Irrigation Due', message: 'It is time to irrigate your crop.', isRead: false }];
            
        case EVENTS.FERTILIZER_DUE:
            return [{ type: 'INFO', title: 'Fertilizer Due', message: 'Fertilizer application is due tomorrow.', isRead: false }];
            
        default:
            return []; // No notification templates for generic events
    }
}

module.exports = {
    getNotificationTemplates
};
