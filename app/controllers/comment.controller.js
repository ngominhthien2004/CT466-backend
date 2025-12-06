const CommentService = require('../services/comment.service');
const MongoDB = require('../utils/mongodb.util');
const ApiError = require('../api-error');
const { ObjectId } = require('mongodb');

// Helper function to get user data
async function getUserData(userId) {
    try {
        const user = await MongoDB.client.db().collection('users').findOne(
            { _id: ObjectId.isValid(userId) ? new ObjectId(userId) : userId },
            { projection: { username: 1, avatar: 1 } }
        );
        return user;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// Get all comments
exports.getAllComments = async (req, res, next) => {
    try {
        const commentService = new CommentService(MongoDB.client);
        const comments = await commentService.findAll();
        res.json(comments);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while retrieving comments', error)
        );
    }
};

// Get comments by novel ID
exports.getCommentsByNovelId = async (req, res, next) => {
    try {
        const commentService = new CommentService(MongoDB.client);
        const comments = await commentService.findByNovelId(req.params.novelId);
        
        if (comments.length === 0) {
            return res.json({
                message: 'No comments found for this novel',
                data: []
            });
        }
        
        res.json(comments);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while retrieving comments for novel ' + req.params.novelId, error)
        );
    }
};

// Get comments by chapter ID
// Only return comments that have chapterId matching the requested chapter
exports.getCommentsByChapterId = async (req, res, next) => {
    try {
        const commentService = new CommentService(MongoDB.client);
        const comments = await commentService.findByChapterId(req.params.chapterId);
        
        res.json(comments);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while retrieving comments for chapter ' + req.params.chapterId, error)
        );
    }
};

// Get comments by user ID
exports.getCommentsByUserId = async (req, res, next) => {
    try {
        const commentService = new CommentService(MongoDB.client);
        const comments = await commentService.findByUserId(req.params.userId);
        
        if (comments.length === 0) {
            return res.json({
                message: 'No comments found for this user',
                data: []
            });
        }
        
        res.json(comments);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while retrieving comments for user ' + req.params.userId, error)
        );
    }
};

// Get a single comment by ID
exports.getCommentById = async (req, res, next) => {
    try {
        const commentService = new CommentService(MongoDB.client);
        const comment = await commentService.findById(req.params.id);
        if (!comment) {
            return next(new ApiError(404, 'Comment not found'));
        }
        res.json(comment);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while retrieving comment with id ' + req.params.id, error)
        );
    }
};

// Create a new comment
exports.createComment = async (req, res, next) => {
    if (!req.body?.content) {
        return next(new ApiError(400, 'Content can not be empty'));
    }
    if (!req.body?.novelId) {
        return next(new ApiError(400, 'Novel ID can not be empty'));
    }
    if (!req.body?.userId) {
        return next(new ApiError(400, 'User ID can not be empty'));
    }
    
    try {
        // Get latest user data (username and avatar)
        const user = await getUserData(req.body.userId);
        
        console.log('Creating comment - User data:', {
            userId: req.body.userId,
            foundUser: !!user,
            userAvatar: user?.avatar,
            requestAvatar: req.body.userAvatar
        });
        
        if (user) {
            // Override with latest user data
            req.body.userName = user.username;
            req.body.userAvatar = user.avatar || req.body.userAvatar || '';
        }
        
        console.log('Creating comment - Final data:', {
            userName: req.body.userName,
            userAvatar: req.body.userAvatar
        });
        
        const commentService = new CommentService(MongoDB.client);
        const newComment = await commentService.create(req.body);
        
        console.log('Created comment:', {
            commentId: newComment._id,
            userAvatar: newComment.userAvatar
        });
        
        res.status(201).json(newComment);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while creating the comment', error)
        );
    }
};

// Update a comment
exports.updateComment = async (req, res, next) => {
    try {
        const commentService = new CommentService(MongoDB.client);
        const updatedComment = await commentService.update(req.params.id, req.body);
        if (!updatedComment) {
            return next(new ApiError(404, 'Comment not found'));
        }
        res.json(updatedComment);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while updating comment with id ' + req.params.id, error)
        );
    }
};

// Delete a comment
exports.deleteComment = async (req, res, next) => {
    try {
        const commentService = new CommentService(MongoDB.client);
        const deletedComment = await commentService.delete(req.params.id);
        if (!deletedComment) {
            return next(new ApiError(404, 'Comment not found'));
        }
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while deleting comment with id ' + req.params.id, error)
        );
    }
};

// Delete all comments
exports.deleteAllComments = async (req, res, next) => {
    try {
        const commentService = new CommentService(MongoDB.client);
        const deletedCount = await commentService.deleteAll();
        res.json({ message: `${deletedCount} comments deleted` });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while deleting all comments', error)
        );
    }
};

// Delete all comments of a novel
exports.deleteCommentsByNovelId = async (req, res, next) => {
    try {
        const commentService = new CommentService(MongoDB.client);
        const deletedCount = await commentService.deleteByNovelId(req.params.novelId);
        res.json({ message: `${deletedCount} comments deleted for novel ${req.params.novelId}` });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while deleting comments for novel ' + req.params.novelId, error)
        );
    }
};

// Delete all comments of a chapter
exports.deleteCommentsByChapterId = async (req, res, next) => {
    try {
        const commentService = new CommentService(MongoDB.client);
        const deletedCount = await commentService.deleteByChapterId(req.params.chapterId);
        res.json({ message: `${deletedCount} comments deleted for chapter ${req.params.chapterId}` });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while deleting comments for chapter ' + req.params.chapterId, error)
        );
    }
};

// Delete all comments of a user
exports.deleteCommentsByUserId = async (req, res, next) => {
    try {
        const commentService = new CommentService(MongoDB.client);
        const deletedCount = await commentService.deleteByUserId(req.params.userId);
        res.json({ message: `${deletedCount} comments deleted for user ${req.params.userId}` });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while deleting comments for user ' + req.params.userId, error)
        );
    }
};

// Like a comment
exports.likeComment = async (req, res, next) => {
    if (!req.body?.userId) {
        return next(new ApiError(400, 'User ID can not be empty'));
    }
    
    try {
        const commentService = new CommentService(MongoDB.client);
        const result = await commentService.likeComment(req.params.id, req.body.userId);
        res.json(result);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while liking comment with id ' + req.params.id, error)
        );
    }
};

// Unlike a comment
exports.unlikeComment = async (req, res, next) => {
    if (!req.body?.userId) {
        return next(new ApiError(400, 'User ID can not be empty'));
    }
    
    try {
        const commentService = new CommentService(MongoDB.client);
        const result = await commentService.unlikeComment(req.params.id, req.body.userId);
        res.json(result);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while unliking comment with id ' + req.params.id, error)
        );
    }
};

// Get replies for a comment
exports.getReplies = async (req, res, next) => {
    try {
        const commentService = new CommentService(MongoDB.client);
        const replies = await commentService.getReplies(req.params.id);
        res.json(replies);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while retrieving replies for comment ' + req.params.id, error)
        );
    }
};

// Report a comment
exports.reportComment = async (req, res, next) => {
    if (!req.body?.userId) {
        return next(new ApiError(400, 'User ID can not be empty'));
    }

    try {
        const commentService = new CommentService(MongoDB.client);
        const result = await commentService.reportComment(
            req.params.id,
            req.body.userId,
            req.body.reason
        );

        if (!result) {
            return next(new ApiError(404, 'Comment not found'));
        }

        res.json({
            message: 'Comment reported successfully',
            comment: result
        });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while reporting comment', error)
        );
    }
};

// Get reported comments (Admin only)
exports.getReportedComments = async (req, res, next) => {
    try {
        const commentService = new CommentService(MongoDB.client);
        const comments = await commentService.findReported();
        res.json(comments);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while retrieving reported comments', error)
        );
    }
};

// Unreport a comment (Admin only)
exports.unreportComment = async (req, res, next) => {
    try {
        const commentService = new CommentService(MongoDB.client);
        const result = await commentService.unreportComment(req.params.id);

        if (!result) {
            return next(new ApiError(404, 'Comment not found'));
        }

        res.json({
            message: 'Comment unreported successfully',
            comment: result
        });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while unreporting comment', error)
        );
    }
};
