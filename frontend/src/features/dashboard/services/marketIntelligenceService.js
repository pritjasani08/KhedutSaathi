import { fetchMarketPrices } from '../../../services/marketPriceService';
import { normalizeCommodity } from '../utils/commodityMapper';
import { transformMarketRecords } from '../utils/marketTransformer';

/**
 * Executes a hierarchical fallback strategy to retrieve the best available market intelligence.
 * Fallback Strategy: District -> State -> Commodity Only -> Empty State
 * 
 * @param {Object} profile - User profile containing primary_crop, state, district
 * @returns {Promise<Object>} { status: 'success'|'empty', sourceLevel, data }
 */
export const getMarketIntelligence = async (profile) => {
  if (!profile || !profile.primary_crop) {
    console.info("Market Intelligence: No primary crop found in profile.");
    return { status: 'empty', sourceLevel: null, data: null };
  }

  const rawCrop = profile.primary_crop;
  const commodity = normalizeCommodity(rawCrop);
  const state = profile.state || '';
  const district = profile.district || '';

  // Attempt 1: District + Commodity
  if (state && district) {
    try {
      const result = await fetchMarketPrices({ state, district, commodity, limit: 30 });
      if (result?.success && result.data && result.data.length > 0) {
        console.info("Market Intelligence Loaded", { commodity, state, district, fallbackLevel: "District", recordsFound: result.data.length });
        const transformed = transformMarketRecords(result.data, "District", commodity);
        if (transformed) return { status: 'success', sourceLevel: 'District', data: transformed };
      }
    } catch (err) {
      console.error("Market Intelligence Error [Attempt 1 - District]:", err);
    }
  }

  // Attempt 2: State + Commodity
  if (state) {
    try {
      const result = await fetchMarketPrices({ state, commodity, limit: 50 });
      if (result?.success && result.data && result.data.length > 0) {
        console.info("Market Intelligence Loaded", { commodity, state, fallbackLevel: "State", recordsFound: result.data.length });
        const transformed = transformMarketRecords(result.data, "State", commodity);
        if (transformed) return { status: 'success', sourceLevel: 'State', data: transformed };
      }
    } catch (err) {
      console.error("Market Intelligence Error [Attempt 2 - State]:", err);
    }
  }

  // Attempt 3: Commodity Only (National)
  try {
    const result = await fetchMarketPrices({ commodity, limit: 50 });
    if (result?.success && result.data && result.data.length > 0) {
      console.info("Market Intelligence Loaded", { commodity, fallbackLevel: "National", recordsFound: result.data.length });
      const transformed = transformMarketRecords(result.data, "National", commodity);
      if (transformed) return { status: 'success', sourceLevel: 'National', data: transformed };
    }
  } catch (err) {
    console.error("Market Intelligence Error [Attempt 3 - National]:", err);
  }

  // Attempt 4: Empty State
  console.info("Market Intelligence: No records found across all fallback levels.", { commodity });
  return { status: 'empty', sourceLevel: null, data: null };
};
