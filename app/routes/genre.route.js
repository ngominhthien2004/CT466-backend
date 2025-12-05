const express = require('express');
const genres = require('../controllers/genre.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.route('/')
    .get(genres.getAllGenres)
    .post(authenticate, authorize('admin'), genres.createGenre)
    .delete(authenticate, authorize('admin'), genres.deleteAllGenres);

router.route('/:id')
    .get(genres.getGenreById)
    .put(authenticate, authorize('admin'), genres.updateGenre)
    .delete(authenticate, authorize('admin'), genres.deleteGenre);

router.route('/slug/:slug')
    .get(genres.getGenreBySlug);

module.exports = router;
