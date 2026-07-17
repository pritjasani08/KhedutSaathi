/**
 * Deterministic engine for generating selling recommendations based on real market data.
 * Designed to be modular so it can be replaced by ML models in the future.
 */
export const getSellingDecision = (data, insights, overview) => {
  if (!data || data.length === 0) {
    return {
      recommendation: 'Insufficient Data',
      confidence: 'Low',
      impact: 'Cannot determine market impact',
      why: 'No market data available for the selected filters.'
    };
  }

  // Find if we have strong or weak demand based on mathematical insights
  const hasStrongDemand = insights?.some(i => i.type === 'positive');
  const hasWeakDemand = insights?.some(i => i.type === 'negative');

  const avgPrice = overview?.avgPrice || 0;
  
  // Find highest paying market
  const highestMarket = [...data].sort((a, b) => parseFloat(b.modal_price) - parseFloat(a.modal_price))[0];

  if (!highestMarket || !avgPrice) {
     return {
      recommendation: 'Wait',
      confidence: 'Low',
      impact: 'Observe market trends.',
      why: 'Not enough price variance to make a recommendation.'
    };
  }

  const premiumPercent = ((parseFloat(highestMarket.modal_price) - avgPrice) / avgPrice) * 100;

  if (premiumPercent > 3 || hasStrongDemand) {
    return {
      recommendation: 'Sell Today',
      confidence: 'High',
      impact: `Maximize profit by selling at ₹${highestMarket.modal_price}/Qtl at ${highestMarket.market}.`,
      why: `Prices for ${highestMarket.commodity} in ${highestMarket.market} are currently ${premiumPercent > 0 ? premiumPercent.toFixed(1) + '%' : 'significantly'} above the regional average, driven by strong local demand.`
    };
  } else if (hasWeakDemand || premiumPercent < -2) {
     return {
      recommendation: 'Hold',
      confidence: 'High',
      impact: 'Avoid selling during localized price dips.',
      why: `Local market momentum is weak. Prices are trending towards minimum bounds. Better selling opportunities may appear later in the week.`
    };
  } else {
    // Normal stable market
    return {
      recommendation: 'Wait',
      confidence: 'Medium',
      impact: 'Monitor for upcoming peaks.',
      why: `Prices are stable around the average of ₹${avgPrice}/Qtl. There is no immediate urgency to sell unless cash flow is required.`
    };
  }
};
