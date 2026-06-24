const supabase = require('../config/supabaseClient');

const recommendationService = {
  /**
   * Get top recommended schemes for a farmer
   * @param {Object} farmerProfile { state, district, primary_crop }
   * @param {number} limit
   */
  async getRecommendedSchemes(farmerProfile, limit = 10) {
    const { state, primary_crop, land_size } = farmerProfile || {};

    try {
      let query = supabase.from('schemes').select('*').eq('source_verified', true);
      
      if (state && state !== 'All India') {
        query = query.or(`state.eq.All India,state.ilike.%${state}%`);
      }

      const { data: schemes, error } = await query.limit(100);

      if (error) {
        console.error('Error fetching schemes for recommendation:', error);
        return [];
      }

      // Memory scoring
      const scoredSchemes = schemes.map(scheme => {
        let score = 0;

        // State match
        if (state && scheme.state.toLowerCase().includes(state.toLowerCase())) {
          score += 30; // Direct state schemes get higher priority
        } else if (scheme.state === 'All India' || scheme.level === 'Central') {
          score += 10;
        }

        // Crop match
        if (primary_crop) {
          const hasCropMatch = scheme.crop_keywords && scheme.crop_keywords.some(k => 
            k.toLowerCase().includes(primary_crop.toLowerCase()) || 
            primary_crop.toLowerCase().includes(k.toLowerCase())
          );
          if (hasCropMatch) {
            score += 25;
          }
        }

        // Land Area (Small/Marginal targeted)
        if (land_size && land_size <= 2.0) {
          if (scheme.beneficiary_keywords && scheme.beneficiary_keywords.includes('marginal')) {
            score += 15;
          }
        }

        // Beneficiary relevance
        if (scheme.beneficiary_keywords && scheme.beneficiary_keywords.includes('farmer')) {
          score += 5;
        }

        // Popularity (simulated by tags count or just random slight variation to break ties)
        score += (scheme.tags ? scheme.tags.length : 0);

        return { ...scheme, score };
      });

      // Sort descending
      scoredSchemes.sort((a, b) => b.score - a.score);

      return scoredSchemes.slice(0, limit);
    } catch (err) {
      console.error('Recommendation engine error:', err);
      return [];
    }
  }
};

module.exports = recommendationService;
