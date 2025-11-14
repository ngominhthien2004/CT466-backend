const CommentService = require('../services/comment.service');
const MongoDB = require('../utils/mongodb.util');
const ApiError = require('../api-error');

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
        const commentService = new CommentService(MongoDB.client);
        const newComment = await commentService.create(req.body);
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
