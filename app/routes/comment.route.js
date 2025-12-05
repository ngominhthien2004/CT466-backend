const express = require('express');
const comments = require('../controllers/comment.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.route("/")
    .get(comments.getAllComments)
    .post(authenticate, comments.createComment)
    .delete(authenticate, authorize('admin'), comments.deleteAllComments);

router.route("/novel/:novelId")
    .get(comments.getCommentsByNovelId)
    .delete(comments.deleteCommentsByNovelId);

router.route("/chapter/:chapterId")
    .get(comments.getCommentsByChapterId)
    .delete(comments.deleteCommentsByChapterId);

router.route("/user/:userId")
    .get(comments.getCommentsByUserId)
    .delete(comments.deleteCommentsByUserId);

// Report routes - MUST be before /:id routes
router.route("/reported")
    .get(authenticate, authorize('admin'), comments.getReportedComments);

router.route("/:id")
    .get(comments.getCommentById)
    .put(authenticate, comments.updateComment)
    .delete(authenticate, comments.deleteComment);

router.route("/:id/like")
    .post(authenticate, comments.likeComment);

router.route("/:id/unlike")
    .post(authenticate, comments.unlikeComment);

router.route("/:id/replies")
    .get(comments.getReplies);

router.route("/:id/report")
    .post(authenticate, comments.reportComment);

router.route("/:id/unreport")
    .post(authenticate, authorize('admin'), comments.unreportComment);

module.exports = router;
