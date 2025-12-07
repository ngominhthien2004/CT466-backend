const chatbotService = require('../services/chatbot.service');
const ApiError = require('../api-error');
const MongoDB = require('../utils/mongodb.util');

exports.chat = async (req, res, next) => {
    try {
        const { messages } = req.body;

        // Validate request
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return next(new ApiError(400, 'Messages array is required'));
        }

        // Validate message format
        for (const msg of messages) {
            if (!msg.role || !msg.content) {
                return next(new ApiError(400, 'Each message must have role and content'));
            }
            if (!['user', 'assistant'].includes(msg.role)) {
                return next(new ApiError(400, 'Message role must be either "user" or "assistant"'));
            }
        }

        // Get user ID from auth if available
        const userId = req.user ? req.user._id : null;

        // Get real data from MongoDB for context
        const context = await getNovelMTContext();

        // Call chatbot service with context
        const result = await chatbotService.chat(messages, userId, context);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Chatbot controller error:', error);
        next(error);
    }
};

exports.getChatHistory = async (req, res, next) => {
    try {
        // Future implementation: retrieve chat history from DB
        res.json({
            success: true,
            data: {
                messages: [],
                message: 'Chat history not implemented yet'
            }
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to get NovelMT context from database
async function getNovelMTContext() {
    try {
        const db = MongoDB.client.db();
        const Genre = db.collection('genres');
        const Novel = db.collection('novels');

        // Get all genres
        const genres = await Genre.find({}).toArray();
        const genreNames = genres.map(g => g.name).join(', ');

        // Get statistics
        const totalNovels = await Novel.countDocuments({});
        const totalViews = await Novel.aggregate([
            { $group: { _id: null, total: { $sum: '$views' } } }
        ]).toArray();

        // Get top 5 novels by views
        const topNovels = await Novel.find({})
            .sort({ views: -1 })
            .limit(5)
            .project({ title: 1, author: 1, genres: 1, views: 1 })
            .toArray();

        return {
            genres: genreNames,
            totalNovels,
            totalViews: totalViews[0]?.total || 0,
            topNovels: topNovels.map(n => `"${n.title}" (${n.author}) - ${n.genres?.join(', ')}`).join('; ')
        };
    } catch (error) {
        console.error('Error getting NovelMT context:', error);
        return null;
    }
}
