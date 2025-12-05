const express = require('express');
const chapters = require('../controllers/chapter.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.route("/")
    .get(chapters.getAllChapters)
    .post(authenticate, chapters.createChapter)
    .delete(authenticate, authorize('admin'), chapters.deleteAllChapters);

router.route("/novel/:novelId")
    .get(chapters.getChaptersByNovelId)
    .delete(chapters.deleteChaptersByNovelId);

router.route("/:id")
    .get(chapters.getChapterById)
    .put(authenticate, chapters.updateChapter)
    .delete(authenticate, chapters.deleteChapter);

module.exports = router;
