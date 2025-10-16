const express = require('express');
const chapters = require('../controllers/chapter.controller');

const router = express.Router();

router.route("/")
    .get(chapters.getAllChapters)
    .post(chapters.createChapter)
    .delete(chapters.deleteAllChapters);

router.route("/novel/:novelId")
    .get(chapters.getChaptersByNovelId)
    .delete(chapters.deleteChaptersByNovelId);

router.route("/:id")
    .get(chapters.getChapterById)
    .put(chapters.updateChapter)
    .delete(chapters.deleteChapter);

module.exports = router;
