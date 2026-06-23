/**
 * Transforms raw API mandi records into the standard Dashboard UI contract.
 *
 * Expected Output Contract:
 * {
 *   currentPrice: number,
 *   previousPrice: number,
 *   bestPrice: number,
 *   bestMarket: string,
 *   trend: number,
 *   sourceLevel: string, // e.g. "District", "State", "Commodity"
 *   commodity: string,
 *   marketCount: number
 * }
 */

export const transformMarketRecords = (records, sourceLevel, commodityName) => {
  if (!records || records.length === 0) {
    return null;
  }

  // Find the record with the absolute highest modal price
  const bestMarketRecord = [...records].sort((a, b) => b.modal_price - a.modal_price)[0];
  
  // Sort chronologically by arrival_date (Format is typically DD/MM/YYYY)
  const sortedRecords = [...records].sort((a, b) => {
    const dateA = new Date(a.arrival_date.split('/').reverse().join('-'));
    const dateB = new Date(b.arrival_date.split('/').reverse().join('-'));
    return dateB - dateA; // Most recent first
  });

  const currentPrice = sortedRecords[0].modal_price;
  const previousPrice = sortedRecords.length > 1 ? sortedRecords[sortedRecords.length - 1].modal_price : currentPrice;
  
  // Calculate trend percentage
  const trend = previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;

  // Calculate unique markets reporting this commodity
  const uniqueMarkets = new Set(records.map(r => r.market)).size;

  return {
    currentPrice,
    previousPrice,
    bestPrice: bestMarketRecord.modal_price,
    bestMarket: bestMarketRecord.market,
    trend: Number(trend.toFixed(1)),
    sourceLevel,
    commodity: commodityName,
    marketCount: uniqueMarkets
  };
};
