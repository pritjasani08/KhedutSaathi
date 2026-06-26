const supabase = require('../config/supabaseClient');
const { calculateCompletion } = require('./profileController'); // Needs export or reimplementation

const getOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type;

    let responseData = {
      userType,
      profile: null,
      completionPercentage: 0,
      stats: {},
      listings: [],
      orders: [],
      bids: []
    };

    // Parallel fetch from database for performance
    const promises = [];

    // 1. Profile (if farmer)
    if (userType === 'farmer') {
      const profilePromise = supabase
        .from('farmer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
        .then(({ data }) => {
          if (data) {
            responseData.profile = data;
            // calculate completion percentage locally here to avoid cross-controller deps
            const fields = ['full_name', 'state', 'district', 'village', 'preferred_language', 'farm_size', 'soil_type', 'primary_crop', 'secondary_crop', 'irrigation_type', 'age', 'gender', 'farmer_category'];
            let filled = 0;
            fields.forEach(field => {
              if (data[field] !== null && data[field] !== undefined && data[field] !== '') filled++;
            });
            responseData.completionPercentage = Math.round((filled / fields.length) * 100);
          }
        });
      promises.push(profilePromise);
    }

    // 2. Stats
    if (userType === 'farmer') {
      const statsPromise = Promise.all([
        supabase.from('crop_listings').select('id, status', { count: 'exact' }).eq('farmer_id', userId),
        supabase.from('accepted_bids').select('id', { count: 'exact' }).eq('farmer_id', userId)
      ]).then(([listingsRes, dealsRes]) => {
        const listings = listingsRes.data || [];
        responseData.stats = {
          totalListings: listings.length,
          activeListings: listings.filter(l => l.status === 'OPEN').length,
          soldListings: listings.filter(l => l.status === 'SOLD').length,
          totalDeals: dealsRes.data?.length || 0
        };
      });
      promises.push(statsPromise);
    } else {
      const statsPromise = Promise.all([
        supabase.from('bids').select('id', { count: 'exact' }).eq('buyer_id', userId),
        supabase.from('accepted_bids').select('id', { count: 'exact' }).eq('buyer_id', userId)
      ]).then(([bidsRes, acceptedRes]) => {
        responseData.stats = {
          ...responseData.stats,
          totalBidsPlaced: bidsRes.data?.length || 0,
          acceptedPurchases: acceptedRes.data?.length || 0
        };
      });
      promises.push(statsPromise);
    }

    // 3. Listings / Bids
    if (userType === 'farmer') {
      const listingsPromise = supabase
        .from('crop_listings')
        .select(`
          *,
          bids (
            id, bid_price, created_at,
            users:buyer_id (first_name, last_name)
          )
        `)
        .eq('farmer_id', userId)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) responseData.listings = data;
        });
      promises.push(listingsPromise);
      
      const ordersPromise = supabase
        .from('seller_orders')
        .select(`*, seller_products (name, image_url, image_urls)`)
        .eq('farmer_id', userId)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) responseData.orders = data;
        });
      promises.push(ordersPromise);
    } else {
      const bidsPromise = supabase
        .from('bids')
        .select(`*, crop_listings (crop_name, expected_price, status)`)
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) responseData.stats.myBids = data; // Keep compatibility with existing format
        });
      promises.push(bidsPromise);
    }

    // Execute all database queries in parallel
    await Promise.all(promises);

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error('Dashboard aggregation error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard overview' });
  }
};

module.exports = {
  getOverview
};
