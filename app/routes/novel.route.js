const express = require('express');
const novels = require('../controllers/novel.controller');

const router = express.Router();

router.route("/")
    .get(novels.getAllNovels)
    .post(novels.createNovel)
    .delete(novels.deleteAllNovels);

router.route("/:id")
    .get(novels.getNovelById)
    .put(novels.updateNovel)
    .delete(novels.deleteNovel);

module.exports = router;
