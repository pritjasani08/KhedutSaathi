/**
 * Configuration constants for external APIs.
 */
module.exports = {
  AGMARKNET: {
    BASE_URL: 'https://api.data.gov.in/resource',
    RESOURCE_ID: '9ef84268-d588-465a-a308-a864a43d0070',
    FORMAT: 'json',
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    TIMEOUT_MS: 15000,
  },
  CACHE: {
    STD_TTL: 1800, // 30 minutes in seconds
    CHECK_PERIOD: 120, // period in seconds to check for expired keys
  }
};
