const ReadingHistoryService = require('../services/readingHistory.service');
const MongoDB = require('../utils/mongodb.util');
const ApiError = require('../api-error');

// Get user's reading history
exports.getUserHistory = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.user?.id;
        
        if (!userId) {
            return next(new ApiError(401, 'User not authenticated'));
        }

        const service = new ReadingHistoryService(MongoDB.client);
        const history = await service.findByUserId(userId);
        
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error getting reading history:', error);
        return next(new ApiError(500, 'An error occurred while retrieving reading history'));
    }
};

// Add to reading history
exports.addToHistory = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.user?.id;
        
        if (!userId) {
            return next(new ApiError(401, 'User not authenticated'));
        }

        const { novelId, chapterId, chapterTitle, novelTitle, novelCover } = req.body;

        if (!novelId || !chapterId) {
            return next(new ApiError(400, 'Novel ID and Chapter ID are required'));
        }

        const service = new ReadingHistoryService(MongoDB.client);
        const historyItem = await service.addOrUpdate(userId, {
            novelId,
            chapterId,
            chapterTitle,
            novelTitle,
            novelCover,
            lastRead: new Date()
        });

        res.json({
            success: true,
            message: 'Added to reading history',
            data: historyItem
        });
    } catch (error) {
        console.error('Error adding to reading history:', error);
        return next(new ApiError(500, 'An error occurred while adding to reading history'));
    }
};

// Remove from reading history
exports.removeFromHistory = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.user?.id;
        const novelId = req.params.novelId;

        if (!userId) {
            return next(new ApiError(401, 'User not authenticated'));
        }

        if (!novelId) {
            return next(new ApiError(400, 'Novel ID is required'));
        }

        const service = new ReadingHistoryService(MongoDB.client);
        await service.removeNovel(userId, novelId);

        res.json({
            success: true,
            message: 'Removed from reading history'
        });
    } catch (error) {
        console.error('Error removing from reading history:', error);
        return next(new ApiError(500, 'An error occurred while removing from reading history'));
    }
};

// Clear all reading history
exports.clearHistory = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.user?.id;

        if (!userId) {
            return next(new ApiError(401, 'User not authenticated'));
        }

        const service = new ReadingHistoryService(MongoDB.client);
        await service.clearAll(userId);

        res.json({
            success: true,
            message: 'Reading history cleared'
        });
    } catch (error) {
        console.error('Error clearing reading history:', error);
        return next(new ApiError(500, 'An error occurred while clearing reading history'));
    }
};
