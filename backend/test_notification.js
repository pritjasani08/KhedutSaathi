const notificationScheduler = require('./jobs/notificationScheduler');
const logger = require('./utils/logger');
require('dotenv').config();

async function run() {
    logger.info("Manually triggering Notification Scheduler...");
    await notificationScheduler.runIteration();
    logger.info("Done.");
    process.exit(0);
}

run();
