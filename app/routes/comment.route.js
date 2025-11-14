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

module.exports = router;
