const express = require('express');
const novels = require('../controllers/novel.controller');

const router = express.Router();

router.route("/")
    .get(novels.getAllNovels)
    .post(novels.createNovel)
    .delete(novels.deleteAllNovels);

// Route cụ thể phải đặt TRƯỚC route động /:id
router.route("/favorite")
    .get(novels.findAllFavoriteNovels);

router.route("/favorites/:userId")
    .get(novels.getFavoritesByUserId);

router.route("/:id/favorite")
    .post(novels.toggleFavorite);

router.route("/:id")
    .get(novels.getNovelById)
    .put(novels.updateNovel)
    .delete(novels.deleteNovel);

module.exports = router;
