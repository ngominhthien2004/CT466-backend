const express = require('express');
const genres = require('../controllers/genre.controller');

const router = express.Router();

router.route('/')
    .get(genres.getAllGenres)
    .post(genres.createGenre)
    .delete(genres.deleteAllGenres);

router.route('/:id')
    .get(genres.getGenreById)
    .put(genres.updateGenre)
    .delete(genres.deleteGenre);

router.route('/slug/:slug')
    .get(genres.getGenreBySlug);

module.exports = router;
