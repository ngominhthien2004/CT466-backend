const express = require('express');
const novels = require('../controllers/novel.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.route("/")
    .get(novels.getAllNovels)
    .post(authenticate, novels.createNovel)
    .delete(authenticate, authorize('admin'), novels.deleteAllNovels);

// Route cụ thể phải đặt TRƯỚC route động /:id
router.route("/favorite")
    .get(novels.findAllFavoriteNovels);

router.route("/favorites/:userId")
    .get(novels.getFavoritesByUserId);

router.route("/:id/favorite")
    .post(authenticate, novels.toggleFavorite);

router.route("/:id")
    .get(novels.getNovelById)
    .put(authenticate, novels.updateNovel)
    .delete(authenticate, novels.deleteNovel);

module.exports = router;
