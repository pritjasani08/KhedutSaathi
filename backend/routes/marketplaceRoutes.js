const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAuth, requireFarmer, requireBuyer } = require('../middleware/authMiddleware');
const marketplaceController = require('../controllers/marketplaceController');

// Multer config for file uploads (in memory so we can upload to Supabase)
const upload = multer({ storage: multer.memoryStorage() });

// Public/Both Roles
router.get('/listings', requireAuth, marketplaceController.getAllListings);
router.get('/deals', requireAuth, marketplaceController.getDeals);
router.get('/dashboard', requireAuth, marketplaceController.getDashboardStats);

// Farmer Only
router.post('/listings', requireFarmer, upload.array('images', 5), marketplaceController.createListing);
router.get('/listings/me', requireFarmer, marketplaceController.getFarmerListings);
router.post('/bids/:bidId/accept', requireFarmer, marketplaceController.acceptBid);

// Buyer Only
router.post('/listings/:id/bid', requireBuyer, marketplaceController.placeBid);

module.exports = router;
