const cron = require('node-cron');
const eventBus = require('../utils/eventBus');
const { WEATHER_ALERT, RAIN_FORECAST, buildEventPayload } = require('../constants/events');
const { getDbClient } = require('../config/db');
const logger = require('../utils/logger');

// Simulated Weather API check
const checkWeatherForUser = async (user) => {
    // In a real app, you would call an external API like OpenWeatherMap
    // based on user.state and user.district
    
    // Simulate finding a heavy rain forecast randomly (10% chance for simulation)
    const hasHeavyRain = Math.random() < 0.1;
    
    if (hasHeavyRain) {
        eventBus.emit(RAIN_FORECAST, buildEventPayload(RAIN_FORECAST, user.id, 'weather', 'weatherScheduler', { 
            condition: 'Heavy Rain',
            location: `${user.district}, ${user.state}`
        }));
    }
};

const weatherScheduler = () => {
    // Run every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        logger.info('Starting Weather Automation Job...');
        try {
            const adminClient = getDbClient(true);
            const { data: profiles, error } = await adminClient
                .from('farmer_profiles')
                .select('user_id, state, district');

            if (error) throw error;

            for (const profile of profiles) {
                if (profile.state && profile.district) {
                    await checkWeatherForUser({ id: profile.user_id, state: profile.state, district: profile.district });
                }
            }
            logger.info('Weather Automation Job completed.');
        } catch (error) {
            logger.error('Error in Weather Automation Job:', error);
        }
    });
};

module.exports = weatherScheduler;
