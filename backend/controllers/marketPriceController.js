const marketPriceService = require('../services/marketPriceService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getMarketPrices = async (req, res, next) => {
  try {
    const { state, district, market, commodity, sortBy, order, page, limit } = req.query;

    const data = await marketPriceService.fetchMarketPrices({
      state,
      district,
      market,
      commodity,
      sortBy,
      order,
      page,
      limit
    });

    const meta = {
      total: data.total,
      count: data.count,
      totalRecordsFetched: data.totalRecordsFetched,
      totalRecordsAfterFiltering: data.totalRecordsAfterFiltering,
      totalCommodities: data.totalCommodities
    };

    return successResponse(res, 'Market prices retrieved successfully', data.records, meta);
  } catch (error) {
    console.error('[MarketPriceController.getMarketPrices] Error:', error.message);
    let statusCode = 500;
    if (error.message.startsWith('API_KEY_MISSING')) statusCode = 401;
    else if (error.message.startsWith('API_TIMEOUT')) statusCode = 504;
    else if (error.message.startsWith('EXTERNAL_API_ERROR') || error.message.startsWith('INVALID_RESPONSE')) statusCode = 502;
    
    return errorResponse(res, error.message, null, statusCode);
  }
};

const getStates = async (req, res, next) => {
  try {
    const states = await marketPriceService.getStates();
    return successResponse(res, 'States retrieved successfully', states);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
};

const getDistricts = async (req, res, next) => {
  try {
    const { state } = req.query;
    const districts = await marketPriceService.getDistricts(state);
    return successResponse(res, 'Districts retrieved successfully', districts);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
};

const getMarkets = async (req, res, next) => {
  try {
    const { district } = req.query;
    const markets = await marketPriceService.getMarkets(district);
    return successResponse(res, 'Markets retrieved successfully', markets);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
};

const getCommodities = async (req, res, next) => {
  try {
    const commodities = await marketPriceService.getCommodities();
    return successResponse(res, 'Commodities retrieved successfully', commodities);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
};

const getMarketPricesByState = async (req, res, next) => {
  try {
    const stateParam = req.params.state;
    const { district, market, commodity, sortBy, order, page, limit } = req.query;

    const data = await marketPriceService.fetchMarketPrices({
      state: stateParam,
      district,
      market,
      commodity,
      sortBy,
      order,
      page,
      limit
    });

    const meta = {
      total: data.total,
      count: data.count,
      limit: data.limit,
      offset: data.offset,
      page: data.page
    };

    return successResponse(res, `Market prices for state ${stateParam} retrieved successfully`, data.records, meta);
  } catch (error) {
    console.error('[MarketPriceController.getMarketPricesByState] Error:', error.message);
    let statusCode = 500;
    if (error.message.startsWith('API_KEY_MISSING')) statusCode = 401;
    else if (error.message.startsWith('API_TIMEOUT')) statusCode = 504;
    else if (error.message.startsWith('EXTERNAL_API_ERROR') || error.message.startsWith('INVALID_RESPONSE')) statusCode = 502;
    
    return errorResponse(res, error.message, null, statusCode);
  }
};

const checkHealth = (req, res, next) => {
  return successResponse(res, 'Market Prices module is healthy and running', { timestamp: new Date().toISOString() });
};

module.exports = {
  getMarketPrices,
  getStates,
  getDistricts,
  getMarkets,
  getCommodities,
  getMarketPricesByState,
  checkHealth
};
