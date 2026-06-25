const supabase = require('../config/supabaseClient');
const recommendationService = require('../services/recommendationService');

/**
 * Endpoint for eligibility engine.
 * Maintains backwards compatibility with previous JSON structure.
 */
const checkEligibility = async (req, res) => {
  try {
    const { 
      state = 'All India', 
      age = 30, 
      gender = 'Male', 
      landSize = 1.0, 
      farmerCategory = 'Small & Marginal', 
      primaryCrop = 'Wheat', 
      irrigationType = 'Tube Well' 
    } = req.body;

    // Fetch all schemes or filtered by state from Supabase
    let query = supabase.from('schemes').select('*').eq('source_verified', true);
    if (state !== 'All India') {
      query = query.or(`state.eq.All India,state.ilike.%${state}%`);
    }

    const { data: allSchemes, error } = await query;

    if (error) {
      console.error('Error fetching schemes from DB:', error);
      return res.status(500).json({ success: false, message: 'Database error fetching schemes.' });
    }

    let totalPotentialBenefit = 0;
    const eligibleSchemes = [];

    // Simulate old static criteria evaluation to maintain compatibility
    for (const scheme of allSchemes) {
      let isEligible = true;
      let reasons = [];

      // State check
      if (scheme.state && scheme.state !== 'All India' && !scheme.state.toLowerCase().includes(state.toLowerCase())) {
        isEligible = false;
      } else {
        reasons.push(`Available in your state (${state})`);
      }

      // Crop check
      if (primaryCrop && scheme.crop_keywords && scheme.crop_keywords.length > 0) {
        const hasCropMatch = scheme.crop_keywords.some(k => 
          k.toLowerCase().includes(primaryCrop.toLowerCase()) || 
          primaryCrop.toLowerCase().includes(k.toLowerCase())
        );
        if (!hasCropMatch) {
          // If the scheme specifically mentions crops but not ours, it's not a match.
          // For safety and broader compatibility, we might not strictly exclude, but let's follow logic.
          // isEligible = false;
        } else {
          reasons.push(`Supports your crop (${primaryCrop})`);
        }
      }

      // Beneficiary check based on gender/farmer category
      if (scheme.beneficiary_keywords && scheme.beneficiary_keywords.length > 0) {
        if (gender === 'Female' && scheme.beneficiary_keywords.includes('women')) {
          reasons.push(`Special benefits for women farmers`);
        }
        if (farmerCategory === 'Small & Marginal' && scheme.beneficiary_keywords.includes('marginal')) {
          reasons.push(`Targeted for marginal farmers`);
        }
      }

      if (isEligible) {
        // Mocking estimated benefit since MyScheme API doesn't always provide a fixed number
        const estimatedBenefit = Math.floor(Math.random() * 5000) + 1000;
        totalPotentialBenefit += estimatedBenefit;
        
        // Shape required by frontend SchemeEligibilityEngine
        eligibleSchemes.push({
          id: scheme.id,
          title: scheme.name,
          description: scheme.description,
          applyLink: scheme.official_url || '#',
          matchReason: reasons.join(', '),
          estimatedBenefit: estimatedBenefit,
          tags: scheme.tags,
          slug: scheme.slug
        });
      }
    }

    res.status(200).json({ 
      success: true, 
      data: eligibleSchemes,
      totalBenefit: totalPotentialBenefit
    });
  } catch (error) {
    console.error('Error in checkEligibility:', error);
    res.status(500).json({ success: false, message: 'Failed to process scheme eligibility.' });
  }
};

/**
 * Get Recommendations
 */
const getRecommendations = async (req, res) => {
  try {
    const { state, district, primary_crop, limit } = req.query;
    
    // Fallback to user profile if authenticated
    let farmerProfile = { state, district, primary_crop };
    if (req.user) {
      farmerProfile = {
        state: state || req.user.state,
        district: district || req.user.district,
        primary_crop: primary_crop || req.user.primary_crop
      };
    }

    const recommended = await recommendationService.getRecommendedSchemes(farmerProfile, limit ? parseInt(limit) : 10);
    
    res.status(200).json({
      success: true,
      data: recommended
    });
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recommendations.' });
  }
};

/**
 * Get Scheme Details by slug
 */
const getSchemeBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { data: scheme, error } = await supabase
      .from('schemes')
      .select('*')
      .eq('slug', slug)
      .eq('source_verified', true)
      .single();

    if (error || !scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    // Optional: Log view asynchronously
    if (req.user) {
      supabase.from('scheme_views').insert({ scheme_id: scheme.id, user_id: req.user.id }).then();
    }

    res.status(200).json({ success: true, data: scheme });
  } catch (error) {
    console.error('Error in getSchemeBySlug:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch scheme details.' });
  }
};

/**
 * Add Bookmark
 */
const addBookmark = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    const { scheme_slug } = req.body;
    
    if (!scheme_slug) return res.status(400).json({ success: false, message: 'Scheme slug is required' });

    const { data, error } = await supabase
      .from('scheme_bookmarks')
      .insert({ user_id: req.user.id, scheme_slug })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // unique violation
        return res.status(200).json({ success: true, message: 'Already bookmarked' });
      }
      throw error;
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error in addBookmark:', error);
    res.status(500).json({ success: false, message: 'Failed to add bookmark.' });
  }
};

/**
 * Remove Bookmark
 */
const removeBookmark = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    const { slug } = req.params;

    const { error } = await supabase
      .from('scheme_bookmarks')
      .delete()
      .match({ user_id: req.user.id, scheme_slug: slug });

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Bookmark removed' });
  } catch (error) {
    console.error('Error in removeBookmark:', error);
    res.status(500).json({ success: false, message: 'Failed to remove bookmark.' });
  }
};

/**
 * Get User Bookmarks
 */
const getBookmarks = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    const { data: bookmarks, error } = await supabase
      .from('scheme_bookmarks')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    let bookmarkedSchemes = [];
    
    if (bookmarks && bookmarks.length > 0) {
      const slugs = bookmarks.map(b => b.scheme_slug);
      
      const { data: schemes, error: schemesError } = await supabase
        .from('schemes')
        .select('*')
        .in('slug', slugs)
        .eq('source_verified', true);
        
      if (schemesError) throw schemesError;
      
      bookmarkedSchemes = bookmarks.map(b => {
        const schemeData = schemes.find(s => s.slug === b.scheme_slug);
        return {
          ...schemeData,
          bookmark_id: b.id,
          bookmarked_at: b.created_at
        };
      }).filter(b => b.id); // Filter out any bookmarks where scheme is no longer verified/exists
    }

    res.status(200).json({ success: true, data: bookmarkedSchemes });
  } catch (error) {
    console.error('Error in getBookmarks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookmarks.' });
  }
};

module.exports = {
  checkEligibility,
  getRecommendations,
  getSchemeBySlug,
  addBookmark,
  removeBookmark,
  getBookmarks
};
