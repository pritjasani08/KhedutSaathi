const mandiService = require('../services/mandiService');

async function getStates(req, res, next) {
  try {
    const states = await mandiService.getStates();
    res.json(states);
  } catch (error) {
    next(error);
  }
}

async function getDistricts(req, res, next) {
  try {
    const { state } = req.params;
    const districts = await mandiService.getDistricts(state);
    res.json(districts);
  } catch (error) {
    next(error);
  }
}

async function getMandis(req, res, next) {
  try {
    const { district } = req.params;
    const mandis = await mandiService.getMandis(district);
    res.json(mandis);
  } catch (error) {
    next(error);
  }
}

async function getCrops(req, res, next) {
  try {
    const crops = await mandiService.getCrops();
    res.json(crops);
  } catch (error) {
    next(error);
  }
}

async function getPrices(req, res, next) {
  try {
    const { state, district, mandi, crop } = req.query;
    const prices = await mandiService.getPrices({ state, district, mandi, crop });
    res.json(prices);
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
