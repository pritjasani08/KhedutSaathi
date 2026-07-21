const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const LOGS_DIR = path.join(__dirname, '../logs');

if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const AUTOMATION_LOG_FILE = path.join(LOGS_DIR, 'automation.log');

class AutomationLogger {
    _writeLog(level, event, context) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            event,
            ...context
        };
        
        const line = JSON.stringify(entry) + '\n';
        
        fs.appendFile(AUTOMATION_LOG_FILE, line, (err) => {
            if (err) {
                logger.error(`Failed to write to automation log: ${err.message}`);
            }
        });
        
        // Also log to standard console logger for immediate visibility
        if (level === 'ERROR') {
            logger.error(`[AUTOMATION] ${event}: ${context.error || JSON.stringify(context)}`);
        } else {
            logger.info(`[AUTOMATION] ${event}: ${JSON.stringify(context)}`);
        }
    }

    info(event, context = {}) {
        this._writeLog('INFO', event, context);
    }

    warn(event, context = {}) {
        this._writeLog('WARN', event, context);
    }

    error(event, context = {}) {
        this._writeLog('ERROR', event, context);
    }
}

module.exports = new AutomationLogger();
