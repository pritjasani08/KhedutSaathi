const fs = require('fs');
const path = require('path');
const code = `
const { getNeighbors } = require('../utils/districtNeighbors');

const getPersonalizedFeed = async (profile, filters = {}) => {
  let allRecords = await fetchAllRecentData();
  
  // Apply query filters first if present
  if (filters.state) {
    allRecords = allRecords.filter(r => r.state && r.state.trim().toLowerCase() === filters.state.trim().toLowerCase());
  }
  if (filters.district) {
    allRecords = allRecords.filter(r => r.district && r.district.trim().toLowerCase() === filters.district.trim().toLowerCase());
  }
  if (filters.market) {
    allRecords = allRecords.filter(r => r.market && r.market.trim().toLowerCase() === filters.market.trim().toLowerCase());
  }
  if (filters.commodity) {
    allRecords = allRecords.filter(r => r.commodity && r.commodity.trim().toLowerCase() === filters.commodity.trim().toLowerCase());
  }

  const fState = profile.state ? profile.state.trim().toLowerCase() : '';
  const fDistrict = profile.district ? profile.district.trim().toLowerCase() : '';
  const fPrimaryCrop = profile.primary_crop ? profile.primary_crop.trim().toLowerCase() : '';
  const fSecondaryCrop = profile.secondary_crop ? profile.secondary_crop.trim().toLowerCase() : '';

  const neighbors = getNeighbors(fDistrict);
  
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgoDate = new Date();
  sevenDaysAgoDate.setDate(sevenDaysAgoDate.getDate() - 7);

  const scoredRecords = [];
  
  let recommendedCount = 0;
  let stateMarketsCount = 0;
  let nationalMarketsCount = 0;

  for (const r of allRecords) {
    let score = 0;
    let label = '';
    
    const rState = r.state ? r.state.trim().toLowerCase() : '';
    const rDistrict = r.district ? r.district.trim().toLowerCase() : '';
    const rCrop = r.commodity ? r.commodity.trim().toLowerCase() : '';
    
    // Geographical scoring
    if (rState === fState && fState) {
        if (rDistrict === fDistrict && fDistrict) {
            score += 100;
            label = 'Same District';
        } else if (neighbors.includes(rDistrict)) {
            score += 80;
            label = 'Nearby District';
        } else {
            score += 60;
            label = 'Same State';
        }
    } else if (fState && rState !== fState) {
        score -= 50;
    }

    // Crop scoring
    let isRecommended = false;
    if (rCrop === fPrimaryCrop && fPrimaryCrop) {
        score += 40;
        isRecommended = true;
    } else if (rCrop === fSecondaryCrop && fSecondaryCrop) {
        score += 20;
    }

    // Date scoring
    let isToday = false;
    if (r.arrival_date) {
        // format usually DD/MM/YYYY
        const parts = r.arrival_date.split('/');
        if (parts.length === 3) {
            const arrDate = new Date(\`\${parts[2]}-\${parts[1]}-\${parts[0]}\`);
            if (\`\${parts[2]}-\${parts[1]}-\${parts[0]}\` === today) {
                score += 10;
                isToday = true;
            } else if (arrDate < sevenDaysAgoDate) {
                score -= 25;
            }
        }
    }

    // Override label if recommended and higher precedence than location
    if (isRecommended && (!label || label === 'Same State')) {
        label = 'Recommended';
    }

    // Update summary counts based on raw dataset
    if (rState === fState && fState) {
        stateMarketsCount++;
    } else {
        nationalMarketsCount++;
    }
    
    if (score > 0) {
        recommendedCount++;
    }
    
    scoredRecords.push({
        ...r,
        relevance_score: score, // internal only
        matchLabel: label || 'National'
    });
  }

  // Sort
  scoredRecords.sort((a, b) => {
     if (a.relevance_score !== b.relevance_score) {
         return b.relevance_score - a.relevance_score;
     }
     
     // secondary sort by date
     const dateA = a.arrival_date ? a.arrival_date.split('/').reverse().join('') : '';
     const dateB = b.arrival_date ? b.arrival_date.split('/').reverse().join('') : '';
     if (dateA !== dateB) return dateB.localeCompare(dateA);
     
     // tertiary by price
     return (parseFloat(b.modal_price) || 0) - (parseFloat(a.modal_price) || 0);
  });
  
  // Clean internal score
  const finalRecords = scoredRecords.map(r => {
      const copy = { ...r };
      delete copy.relevance_score;
      return copy;
  });

  return {
    farmer: {
        state: profile.state,
        district: profile.district,
        primaryCrop: profile.primary_crop
    },
    summary: {
        recommendedMarkets: recommendedCount,
        stateMarkets: stateMarketsCount,
        nationalMarkets: nationalMarketsCount,
        totalMarkets: allRecords.length,
        lastUpdated: new Date().toISOString()
    },
    markets: finalRecords
  };
};
`;

const p = path.join(__dirname, 'services', 'marketPriceService.js');
let content = fs.readFileSync(p, 'utf8');
content = content.replace('module.exports = {', code + '\nmodule.exports = {');
content = content.replace('module.exports = {', 'module.exports = {\n  getPersonalizedFeed,');
fs.writeFileSync(p, content);
console.log('Appended getPersonalizedFeed');
