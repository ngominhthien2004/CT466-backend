const NovelService = require('../services/novel.service');
const MongoDB = require('../utils/mongodb.util');
const ApiError = require('../api-error');
const { ObjectId } = require('mongodb');

// Get all novels
exports.getAllNovels = async (req, res, next) => {
    try {
        const novelService = new NovelService(MongoDB.client);
        const novels = await novelService.findAll();
        res.json(novels);
    } catch (err) {
        return next(err);
    }
};

// Get a single novel by ID
exports.getNovelById = async (req, res, next) => {
    try {
        // Log and validate id format first
        const id = req.params.id;
        console.log('[novel.controller] getNovelById called with id=', id);
        if (!ObjectId.isValid(id)) {
            return next(new ApiError(400, 'Invalid novel id'));
        }

        const novelService = new NovelService(MongoDB.client);
        const novel = await novelService.findById(id);
        if (!novel) {
            return next(new ApiError(404, 'Novel not found'));
        }
        res.json(novel);
    } catch (error) {
        return next(new ApiError(500, 'An error occurred while retrieving the novel with id ' + req.params.id, error));
    }
};

// Create a new novel
exports.createNovel = async (req, res, next) => {
    if (!req.body?.title) {
        return next(new ApiError(400, 'Title can not be empty'));
    }
    
    try {
        const novelService = new NovelService(MongoDB.client);
        const newNovel = await novelService.create(req.body);
        res.status(201).json(newNovel);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while creating the novel', error)
        );
    }
};

// Update a novel
exports.updateNovel = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return next(new ApiError(400, 'Invalid novel id'));
        }

        const novelService = new NovelService(MongoDB.client);
        const updatedNovel = await novelService.update(id, req.body);
        if (!updatedNovel) {
            return next(new ApiError(404, 'Novel not found'));
        }
        res.json(updatedNovel);
    } catch (error) {
        return next(new ApiError(500, 'An error occurred while updating the novel with id ' + req.params.id, error));
    }
};

// Delete a novel
exports.deleteNovel = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return next(new ApiError(400, 'Invalid novel id'));
        }

        const novelService = new NovelService(MongoDB.client);
        const deletedNovel = await novelService.delete(id);
        if (!deletedNovel) {
            return next(new ApiError(404, 'Novel not found'));
        }
        res.json({ message: 'Novel deleted' });
    } catch (error) {
        return next(new ApiError(500, 'An error occurred while deleting the novel with id ' + req.params.id, error));
    }
};

//Delete all novels
exports.deleteAllNovels = async (req, res, next) => {
    try {
        const novelService = new NovelService(MongoDB.client);
        const deletedCount = await novelService.deleteAll();
        res.json({ message: `${deletedCount} novels deleted` });
    } catch (error) {
        return next(new ApiError(500, 'An error occurred while deleting all novels', error));
    }
};

//Find all favorite novels
exports.findAllFavoriteNovels = async (req, res, next) => {
    try {
        const novelService = new NovelService(MongoDB.client);
        const novels = await novelService.findFavorite();
        res.json(novels);
    } catch (error) {
        return next(new ApiError(500, 'An error occurred while retrieving favorite novels', error));
    }
};