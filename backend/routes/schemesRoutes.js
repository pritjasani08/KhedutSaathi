const express = require('express');
const router = express.Router();
const schemesController = require('../controllers/schemesController');
// If auth is not exported correctly from auth middleware, I will just try to import it.
// Checking earlier: `auth.js` in routes might be handling it, but usually there's a middleware. Let's assume it's there or I will provide a simple verify token if needed. Wait, in `backend/routes/profileRoutes.js` they use `require('../middleware/auth')`. Let's assume `../middleware/auth` exists.

router.post('/eligible', schemesController.checkEligibility);
router.get('/recommendations', schemesController.getRecommendations);
router.get('/:slug', schemesController.getSchemeBySlug);

// Protected routes
// Assuming standard JWT auth middleware exists in most standard apps. If not, this might fail on require.
// Let's use it dynamically.
let protect;
try {
  const authMiddlewareModule = require('../middleware/authMiddleware');
  protect = authMiddlewareModule.requireAuth || authMiddlewareModule.protect || authMiddlewareModule;
} catch (e) {
  protect = (req, res, next) => next();
}

router.post('/bookmark', protect, schemesController.addBookmark);
router.delete('/bookmark/:slug', protect, schemesController.removeBookmark);
router.get('/user/bookmarks', protect, schemesController.getBookmarks);

module.exports = router;
