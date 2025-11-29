const express = require('express');
const comments = require('../controllers/comment.controller');

const router = express.Router();

router.route("/")
    .get(comments.getAllComments)
    .post(comments.createComment)
    .delete(comments.deleteAllComments);

router.route("/novel/:novelId")
    .get(comments.getCommentsByNovelId)
    .delete(comments.deleteCommentsByNovelId);

router.route("/chapter/:chapterId")
    .get(comments.getCommentsByChapterId)
    .delete(comments.deleteCommentsByChapterId);

router.route("/user/:userId")
    .get(comments.getCommentsByUserId)
    .delete(comments.deleteCommentsByUserId);

router.route("/:id")
    .get(comments.getCommentById)
    .put(comments.updateComment)
    .delete(comments.deleteComment);

router.route("/:id/like")
    .post(comments.likeComment);

router.route("/:id/unlike")
    .post(comments.unlikeComment);

router.route("/:id/replies")
    .get(comments.getReplies);

module.exports = router;
