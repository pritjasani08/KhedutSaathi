const cron = require('node-cron');
const eventBus = require('../utils/eventBus');
const { SCHEME_EXPIRING, buildEventPayload } = require('../constants/events');
const { getDbClient } = require('../config/db');
const logger = require('../utils/logger');

const checkExpiringSchemes = async () => {
    const adminClient = getDbClient(true);
    
    // Simulate finding expiring schemes for users who have them bookmarked
    const { data: bookmarks, error } = await adminClient
        .from('scheme_bookmarks')
        .select('user_id, scheme_slug');

    if (error) {
        logger.error('Error fetching bookmarks for schemeScheduler:', error);
        return;
    }

    for (const b of bookmarks) {
        // Simulate a 5% chance that a bookmarked scheme is expiring soon
        const isExpiring = Math.random() < 0.05;
        if (isExpiring) {
            eventBus.emit(SCHEME_EXPIRING, buildEventPayload(SCHEME_EXPIRING, b.user_id, b.scheme_slug, 'schemeScheduler', { 
                schemeTitle: b.scheme_slug
            }));
        }
    }
};

const schemeScheduler = () => {
    // Run daily at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
        logger.info('Starting Scheme Automation Job...');
        try {
            await checkExpiringSchemes();
            logger.info('Scheme Automation Job completed.');
        } catch (error) {
            logger.error('Error in Scheme Automation Job:', error);
        }
    });
};

module.exports = schemeScheduler;
