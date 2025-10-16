const NovelService = require('../services/novel.service');
const MongoDB = require('../utils/mongodb.util');

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
        const novelService = new NovelService(MongoDB.client);
        const novel = await novelService.findById(req.params.id);
        if (!novel) {
            return res.status(404).json({ message: 'Novel not found' });
        }
        res.json(novel);
    } catch (err) {
        return next(err);
    }
};

// Create a new novel
exports.createNovel = async (req, res, next) => {
    try {
        const novelService = new NovelService(MongoDB.client);
        const newNovel = await novelService.create(req.body);
        res.status(201).json(newNovel);
    } catch (err) {
        return next(err);
    }
};

// Update a novel
exports.updateNovel = async (req, res, next) => {
    try {
        const novelService = new NovelService(MongoDB.client);
        const updatedNovel = await novelService.update(req.params.id, req.body);
        if (!updatedNovel) {
            return res.status(404).json({ message: 'Novel not found' });
        }
        res.json(updatedNovel);
    } catch (err) {
        return next(err);
    }
};

// Delete a novel
exports.deleteNovel = async (req, res, next) => {
    try {
        const novelService = new NovelService(MongoDB.client);
        const deletedNovel = await novelService.delete(req.params.id);
        if (!deletedNovel) {
            return res.status(404).json({ message: 'Novel not found' });
        }
        res.json({ message: 'Novel deleted' });
    } catch (err) {
        return next(err);
    }
};

//Delete all novels
exports.deleteAllNovels = async (req, res, next) => {
    try {
        const novelService = new NovelService(MongoDB.client);
        const deletedCount = await novelService.deleteAll();
        res.json({ message: `${deletedCount} novels deleted` });
    } catch (err) {
        return next(err);
    }
};

//Find all favorite novels
exports.findAllFavoriteNovels = async (req, res, next) => {
    try {
        const novelService = new NovelService(MongoDB.client);
        const novels = await novelService.findFavorite();
        res.json(novels);
    } catch (err) {
        return next(err);
    }
};