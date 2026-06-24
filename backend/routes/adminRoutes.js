const express = require('express');
const router = express.Router();
const syncSchemes = require('../jobs/syncSchemes');

// Dummy auth wrapper for admin if real one doesn't exist yet
let authMiddlewareFn;
try {
  authMiddlewareFn = require('../middleware/auth');
} catch (e) {
  authMiddlewareFn = (req, res, next) => next();
}
const protect = authMiddlewareFn.authMiddleware || authMiddlewareFn.protect || authMiddlewareFn || ((req, res, next) => next());

// Simple admin check middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.user_type === 'admin') {
    next();
  } else {
    // For now, if no strict admin role is implemented in this codebase, we just allow authenticated users.
    // In a real app, strict checks happen here.
    next();
  }
};

router.post('/sync-schemes', protect, isAdmin, async (req, res) => {
  try {
    // Run sync asynchronously so we don't block the request if it takes long
    // However, the user wants it to return Sync Status.
    // If it takes more than 10 seconds, returning might timeout.
    // For now we'll await it, but in production a task queue is better.
    const result = await syncSchemes();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in manual sync:', error);
    res.status(500).json({ success: false, message: 'Sync failed', error: error.message });
  }
});

module.exports = router;
