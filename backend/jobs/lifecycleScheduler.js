const cron = require('node-cron');
const eventBus = require('../utils/eventBus');
const { IRRIGATION_DUE, FERTILIZER_DUE, HARVEST_DUE, buildEventPayload } = require('../constants/events');
const { getDbClient } = require('../config/db');
const logger = require('../utils/logger');

const checkLifecycle = async () => {
    const adminClient = getDbClient(true);
    
    // Simulate finding crops that were planted a certain number of days ago
    const { data: profiles, error } = await adminClient
        .from('farmer_profiles')
        .select('user_id, primary_crop')
        .not('primary_crop', 'is', null);

    if (error) {
        logger.error('Error fetching profiles for lifecycleScheduler:', error);
        return;
    }

    for (const profile of profiles) {
        // Simulate a 5% chance of each lifecycle event
        const rand = Math.random();
        let eventType = null;
        
        if (rand < 0.05) eventType = IRRIGATION_DUE;
        else if (rand < 0.10) eventType = FERTILIZER_DUE;
        else if (rand < 0.15) eventType = HARVEST_DUE;

        if (eventType) {
            eventBus.emit(eventType, buildEventPayload(eventType, profile.user_id, null, 'lifecycleScheduler', { 
                cropName: profile.primary_crop
            }));
        }
    }
};

const lifecycleScheduler = () => {
    // Run daily at 7:00 AM
    cron.schedule('0 7 * * *', async () => {
        logger.info('Starting Lifecycle Automation Job...');
        try {
            await checkLifecycle();
            logger.info('Lifecycle Automation Job completed.');
        } catch (error) {
            logger.error('Error in Lifecycle Automation Job:', error);
        }
    });
};

module.exports = lifecycleScheduler;
