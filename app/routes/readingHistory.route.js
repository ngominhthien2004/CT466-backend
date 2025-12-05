const express = require('express');
const readingHistory = require('../controllers/readingHistory.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Get user's reading history
router.route("/:userId")
    .get(authenticate, readingHistory.getUserHistory);

// Add to reading history
router.route("/:userId/add")
    .post(authenticate, readingHistory.addToHistory);

// Remove from reading history
router.route("/:userId/remove/:novelId")
    .delete(authenticate, readingHistory.removeFromHistory);

// Clear all reading history
router.route("/:userId/clear")
    .delete(authenticate, readingHistory.clearHistory);

module.exports = router;
