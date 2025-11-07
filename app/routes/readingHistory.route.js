const express = require('express');
const readingHistory = require('../controllers/readingHistory.controller');

const router = express.Router();

// Get user's reading history
router.route("/:userId")
    .get(readingHistory.getUserHistory);

// Add to reading history
router.route("/:userId/add")
    .post(readingHistory.addToHistory);

// Remove from reading history
router.route("/:userId/remove/:novelId")
    .delete(readingHistory.removeFromHistory);

// Clear all reading history
router.route("/:userId/clear")
    .delete(readingHistory.clearHistory);

module.exports = router;
