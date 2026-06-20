const mandiService = require('../services/mandiService');
const { translateArray, translateObjects } = require('../utils/translator');

async function getStates(req, res, next) {
  try {
    const states = await mandiService.getStates();
    const lang = req.query.lang || 'en';
    const translatedStates = await translateArray(states, lang);
    res.json({ success: true, data: translatedStates });
  } catch (error) {
    next(error);
  }
}

async function getDistricts(req, res, next) {
  try {
    const { state } = req.query; // Changed from req.params to req.query to support standard frontend params
    const districts = await mandiService.getDistricts(state);
    const lang = req.query.lang || 'en';
    const translatedDistricts = await translateArray(districts, lang);
    res.json({ success: true, data: translatedDistricts });
  } catch (error) {
    next(error);
  }
}

async function getMandis(req, res, next) {
  try {
    const { district } = req.query; // Changed from req.params to req.query
    const mandis = await mandiService.getMandis(district);
    const lang = req.query.lang || 'en';
    const translatedMandis = await translateArray(mandis, lang);
    res.json({ success: true, data: translatedMandis });
  } catch (error) {
    next(error);
  }
}

async function getCrops(req, res, next) {
  try {
    const crops = await mandiService.getCrops();
    const lang = req.query.lang || 'en';
    const translatedCrops = await translateArray(crops, lang);
    res.json({ success: true, data: translatedCrops });
  } catch (error) {
    next(error);
  }
}

async function getPrices(req, res, next) {
  try {
    const { state, district, mandi, crop, lang = 'en' } = req.query;
    const prices = await mandiService.getPrices({ state, district, mandi, crop });
    
    // Translate the commodity, state, district, and market fields
    const keysToTranslate = ['commodity', 'state', 'district', 'market'];
    const translatedPrices = await translateObjects(prices, lang, keysToTranslate);
    
    res.json({ success: true, data: translatedPrices });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStates,
  getDistricts,
  getMandis,
  getCrops,
  getPrices,
};
