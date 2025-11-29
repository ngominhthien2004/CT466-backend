const GenreService = require('../services/genre.service');
const MongoDB = require('../utils/mongodb.util');
const ApiError = require('../api-error');

// Lấy tất cả genres
exports.getAllGenres = async (req, res, next) => {
    try {
        const genreService = new GenreService(MongoDB.client);
        const genres = await genreService.findAll();
        res.json(genres);
    } catch (error) {
        return next(new ApiError(500, 'An error occurred while retrieving genres', error));
    }
};

// Lấy genre theo id
exports.getGenreById = async (req, res, next) => {
    try {
        const genreService = new GenreService(MongoDB.client);
        const genre = await genreService.findById(req.params.id);
        if (!genre) {
            return next(new ApiError(404, 'Genre not found'));
        }
        res.json(genre);
    } catch (error) {
        return next(new ApiError(500, 'An error occurred while retrieving genre', error));
    }
};

// Lấy genre theo slug
exports.getGenreBySlug = async (req, res, next) => {
    try {
        const genreService = new GenreService(MongoDB.client);
        const genre = await genreService.findBySlug(req.params.slug);
        if (!genre) {
            return next(new ApiError(404, 'Genre not found'));
        }
        res.json(genre);
    } catch (error) {
        return next(new ApiError(500, 'An error occurred while retrieving genre by slug', error));
    }
};

// Tạo genre mới
exports.createGenre = async (req, res, next) => {
    if (!req.body?.name || !req.body?.slug) {
        return next(new ApiError(400, 'Name and slug are required'));
    }
    try {
        const genreService = new GenreService(MongoDB.client);
        const newGenre = await genreService.create(req.body);
        res.status(201).json(newGenre);
    } catch (error) {
        return next(new ApiError(500, 'An error occurred while creating the genre', error));
    }
};

// Cập nhật genre
exports.updateGenre = async (req, res, next) => {
    try {
        const genreService = new GenreService(MongoDB.client);
        const updatedGenre = await genreService.update(req.params.id, req.body);
        if (!updatedGenre) {
            return next(new ApiError(404, 'Genre not found'));
        }
        res.json(updatedGenre);
    } catch (error) {
        return next(new ApiError(500, 'An error occurred while updating genre', error));
    }
};

// Xóa genre
exports.deleteGenre = async (req, res, next) => {
    try {
        const genreService = new GenreService(MongoDB.client);
        const deletedGenre = await genreService.delete(req.params.id);
        if (!deletedGenre) {
            return next(new ApiError(404, 'Genre not found'));
        }
        res.json({ message: 'Genre deleted successfully' });
    } catch (error) {
        return next(new ApiError(500, 'An error occurred while deleting genre', error));
    }
};

// Xóa tất cả genres
exports.deleteAllGenres = async (req, res, next) => {
    try {
        const genreService = new GenreService(MongoDB.client);
        const deletedCount = await genreService.deleteAll();
        res.json({ message: `${deletedCount} genres deleted` });
    } catch (error) {
        return next(new ApiError(500, 'An error occurred while deleting all genres', error));
    }
};
