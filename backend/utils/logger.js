/**
 * Lightweight structured JSON logger.
 * Writes to stdout/stderr in a format easily parsable by log aggregators.
 */

const log = (level, message, metadata = {}) => {
  const safeMetadata = { ...metadata };
  
  // If metadata is an Error object or has a 'message' property (e.g., Supabase error),
  // preserve it without overriding the top-level message.
  if (safeMetadata.message && typeof safeMetadata.message === 'string') {
    safeMetadata.error_message = safeMetadata.message;
    delete safeMetadata.message;
  }
  
  // Don't override the log level
  if (safeMetadata.level) {
    delete safeMetadata.level;
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...safeMetadata
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
