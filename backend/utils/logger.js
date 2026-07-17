/**
 * Lightweight structured JSON logger.
 * Writes to stdout/stderr in a format easily parsable by log aggregators.
 */

const log = (level, message, metadata = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata
  };
  
  if (level === 'ERROR') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'WARN') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
};

module.exports = {
  info: (message, metadata) => log('INFO', message, metadata),
  warn: (message, metadata) => log('WARN', message, metadata),
  error: (message, metadata) => log('ERROR', message, metadata)
};
