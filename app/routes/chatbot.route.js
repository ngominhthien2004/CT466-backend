const express = require('express');
const chatbotController = require('../controllers/chatbot.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route   POST /api/chatbot/chat
 * @desc    Send message to AI chatbot
 * @access  Public (optionalAuth - works with or without login)
 */
router.post('/chat', optionalAuth, chatbotController.chat);

/**
 * @route   GET /api/chatbot/history
 * @desc    Get chat history (future feature)
 * @access  Private
 */
router.get('/history', optionalAuth, chatbotController.getChatHistory);

module.exports = router;
