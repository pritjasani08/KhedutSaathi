const axios = require('axios');
const crypto = require('crypto');

const MYSCHEME_API_URL = 'https://api.myscheme.gov.in/search/v6/schemes';
const TIMEOUT_MS = 10000; // 10 seconds
const MAX_RETRIES = 3;

/**
 * Delay helper for exponential backoff
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper to log structured messages
 */
const logInfo = (message, meta = {}) => {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'INFO', message, ...meta }));
};

const logError = (message, meta = {}) => {
  console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'ERROR', message, ...meta }));
};

/**
 * Base fetch function with retry and exponential backoff
 */
const fetchWithRetry = async (url, params = {}, retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logInfo(`Fetching from MyScheme API`, { url, params, attempt });
      const response = await axios.get(url, {
        params,
        timeout: TIMEOUT_MS,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'KhedutSaathi-Backend/1.0'
        }
      });
      return response.data;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const errorMessage = error.response ? `HTTP ${error.response.status}` : error.message;
      
      if (isLastAttempt) {
        logError(`MyScheme API request failed after ${retries} attempts`, { url, error: errorMessage });
        throw new Error(`MyScheme API Error: ${errorMessage}`);
      }
      
      const backoffMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      logInfo(`Request failed. Retrying in ${Math.round(backoffMs)}ms...`, { attempt, error: errorMessage });
      await delay(backoffMs);
    }
  }
};

/**
 * Service abstracting MyScheme API calls
 */
const mySchemeService = {
  /**
   * Search schemes by keyword and pagination
   * @param {string} keyword 
   * @param {number} from 
   * @param {number} size 
   */
  async searchSchemes(keyword, from = 0, size = 10) {
    // Expected endpoint: https://api.myscheme.gov.in/search/v6/schemes?lang=en&q=[]&keyword=farmer&from=0&size=10
    const params = {
      lang: 'en',
      q: '[]',
      keyword,
      from,
      size
    };
    return await fetchWithRetry(MYSCHEME_API_URL, params);
  }
};

module.exports = mySchemeService;
