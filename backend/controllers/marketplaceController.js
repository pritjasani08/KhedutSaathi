const supabase = require('../config/supabaseClient');
const { v4: uuidv4 } = require('uuid');

// Create a new listing (Farmer only)
const createListing = async (req, res) => {
  try {
    const { cropName, quantity, expectedPrice, location, description } = req.body;
    const farmerId = req.user.id;

    if (!cropName || !quantity || !expectedPrice || !location) {
      return res.status(400).json({ message: 'Crop name, quantity, price, and location are required.' });
    }

    // Insert listing
    const { data: listing, error: listingError } = await supabase
      .from('crop_listings')
      .insert([{
        farmer_id: farmerId,
        crop_name: cropName,
        quantity_quintals: quantity,
        expected_price: expectedPrice,
        location,
        description
      }])
      .select()
      .single();

    if (listingError) throw listingError;

    // Handle Image Uploads if any
    if (req.files && req.files.length > 0) {
      const imageInserts = [];
      for (const file of req.files) {
        // Upload to Supabase Storage
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${listing.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('crop-images')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });
          
        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error('Failed to upload image to Supabase Storage: ' + uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from('crop-images')
          .getPublicUrl(filePath);

        imageInserts.push({
          listing_id: listing.id,
          image_url: publicUrlData.publicUrl
        });
      }

      if (imageInserts.length > 0) {
        await supabase.from('crop_images').insert(imageInserts);
      }
    }

    res.status(201).json({ message: 'Listing created successfully!', listing });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ message: 'Failed to create listing' });
  }
};

// Get all OPEN listings (Public/Both Roles)
const getAllListings = async (req, res) => {
  try {
    const { data: listings, error } = await supabase
      .from('crop_listings')
      .select(`
        *,
        users (first_name, last_name),
        crop_images (image_url),
        bids (bid_price)
      `)
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format response to include highest bid
    const formattedListings = listings.map(listing => {
      const highestBid = listing.bids.length > 0 
        ? Math.max(...listing.bids.map(b => b.bid_price)) 
        : 0;
      
      return {
        ...listing,
        highest_bid: highestBid,
        farmer_name: `${listing.users.first_name} ${listing.users.last_name}`,
        users: undefined // hide inner user object
      };
    });

    res.status(200).json(formattedListings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Failed to fetch listings' });
  }
};

// Get specific farmer's listings (Farmer only)
const getFarmerListings = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { data: listings, error } = await supabase
      .from('crop_listings')
      .select(`
        *,
        crop_images (image_url),
        bids (
          id, bid_price, created_at,
          users (first_name, last_name, mobile)
        )
      `)
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(listings);
  } catch (error) {
    console.error('Error fetching farmer listings:', error);
    res.status(500).json({ message: 'Failed to fetch your listings' });
  }
};

// Place a Bid (Buyer only)
const placeBid = async (req, res) => {
  try {
    const { bidPrice } = req.body;
    const listingId = req.params.id;
    const buyerId = req.user.id;

    if (!bidPrice) {
      return res.status(400).json({ message: 'Bid price is required.' });
    }

    // Get listing details and current highest bid
    const { data: listing, error: listingError } = await supabase
      .from('crop_listings')
      .select('*, bids(bid_price)')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    if (listing.status !== 'OPEN') {
      return res.status(400).json({ message: 'This listing is no longer open for bids.' });
    }

    if (bidPrice < listing.expected_price) {
      return res.status(400).json({ message: `Bid must be at least the expected price (₹${listing.expected_price}).` });
    }

    const currentHighestBid = listing.bids.length > 0 
      ? Math.max(...listing.bids.map(b => b.bid_price)) 
      : 0;

    if (bidPrice <= currentHighestBid) {
      return res.status(400).json({ message: `Bid must be greater than the current highest bid (₹${currentHighestBid}).` });
    }

    // Insert bid
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert([{ listing_id: listingId, buyer_id: buyerId, bid_price: bidPrice }])
      .select()
      .single();

    if (bidError) throw bidError;

    res.status(201).json({ message: 'Bid placed successfully!', bid });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ message: 'Failed to place bid' });
  }
};

// Accept a Bid (Farmer only)
const acceptBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const farmerId = req.user.id;

    // Verify bid exists and listing belongs to farmer
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .select('*, crop_listings(farmer_id, status)')
      .eq('id', bidId)
      .single();

    if (bidError || !bid) {
      return res.status(404).json({ message: 'Bid not found.' });
    }

    if (bid.crop_listings.farmer_id !== farmerId) {
      return res.status(403).json({ message: 'You can only accept bids on your own listings.' });
    }

    if (bid.crop_listings.status !== 'OPEN') {
      return res.status(400).json({ message: 'This listing is already sold.' });
    }

    // Transaction-like approach (Using multiple await calls since Supabase REST API doesn't support complex transactions directly without RPC)
    
    // 1. Create accepted_bids record
    const { data: acceptedDeal, error: dealError } = await supabase
      .from('accepted_bids')
      .insert([{
        listing_id: bid.listing_id,
        farmer_id: farmerId,
        buyer_id: bid.buyer_id,
        final_price: bid.bid_price
      }])
      .select()
      .single();

    if (dealError) throw dealError;

    // 2. Update listing status to SOLD
    const { error: updateError } = await supabase
      .from('crop_listings')
      .update({ status: 'SOLD' })
      .eq('id', bid.listing_id);

    if (updateError) throw updateError;

    res.status(200).json({ message: 'Bid accepted successfully! Deal closed.', deal: acceptedDeal });
  } catch (error) {
    console.error('Error accepting bid:', error);
    res.status(500).json({ message: 'Failed to accept bid' });
  }
};

// Get Deals (Transaction History)
const getDeals = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type; // 'farmer' or 'buyer'

    const filterColumn = userType === 'farmer' ? 'farmer_id' : 'buyer_id';

    const { data: deals, error } = await supabase
      .from('accepted_bids')
      .select(`
        *,
        crop_listings (crop_name, quantity_quintals, location),
        farmer:users!accepted_bids_farmer_id_fkey (first_name, last_name, mobile),
        buyer:users!accepted_bids_buyer_id_fkey (first_name, last_name, mobile)
      `)
      .eq(filterColumn, userId)
      .order('accepted_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ message: 'Failed to fetch deals' });
  }
};

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type;
    let stats = {};

    if (userType === 'farmer') {
      const { data: listings } = await supabase.from('crop_listings').select('id, status').eq('farmer_id', userId);
      const { data: deals } = await supabase.from('accepted_bids').select('id').eq('farmer_id', userId);
      
      const totalListings = listings ? listings.length : 0;
      const activeListings = listings ? listings.filter(l => l.status === 'OPEN').length : 0;
      const soldListings = listings ? listings.filter(l => l.status === 'SOLD').length : 0;
      
      stats = { totalListings, activeListings, soldListings, totalDeals: deals ? deals.length : 0 };
    } else {
      const { data: bids } = await supabase
        .from('bids')
        .select('*, crop_listings(id, crop_name, status, expected_price)')
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false });

      const { data: deals } = await supabase.from('accepted_bids').select('id').eq('buyer_id', userId);
      
      stats = { 
        totalBidsPlaced: bids ? bids.length : 0, 
        acceptedPurchases: deals ? deals.length : 0,
        myBids: bids || []
      };
    }

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
};

module.exports = {
  createListing,
  getAllListings,
  getFarmerListings,
  placeBid,
  acceptBid,
  getDeals,
  getDashboardStats
};
