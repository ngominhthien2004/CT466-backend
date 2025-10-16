const ChapterService = require('../services/chapter.service');
const MongoDB = require('../utils/mongodb.util');
const ApiError = require('../api-error');

// Get all chapters
exports.getAllChapters = async (req, res, next) => {
    try {
        const chapterService = new ChapterService(MongoDB.client);
        const chapters = await chapterService.findAll();
        res.json(chapters);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while retrieving chapters', error)
        );
    }
};

// Get chapters by novel ID
exports.getChaptersByNovelId = async (req, res, next) => {
    try {
        const chapterService = new ChapterService(MongoDB.client);
        const chapters = await chapterService.findByNovelId(req.params.novelId);
        
        if (chapters.length === 0) {
            return res.json({
                message: 'No chapters found for this novel',
                data: []
            });
        }
        
        res.json(chapters);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while retrieving chapters for novel ' + req.params.novelId, error)
        );
    }
};

// Get a single chapter by ID
exports.getChapterById = async (req, res, next) => {
    try {
        const chapterService = new ChapterService(MongoDB.client);
        const chapter = await chapterService.findById(req.params.id);
        if (!chapter) {
            return next(new ApiError(404, 'Chapter not found'));
        }
        res.json(chapter);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while retrieving chapter with id ' + req.params.id, error)
        );
    }
};

// Create a new chapter
exports.createChapter = async (req, res, next) => {
    if (!req.body?.title) {
        return next(new ApiError(400, 'Title can not be empty'));
    }
    if (!req.body?.novelId) {
        return next(new ApiError(400, 'Novel ID can not be empty'));
    }
    
    try {
        const chapterService = new ChapterService(MongoDB.client);
        const newChapter = await chapterService.create(req.body);
        res.status(201).json(newChapter);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while creating the chapter', error)
        );
    }
};

// Update a chapter
exports.updateChapter = async (req, res, next) => {
    try {
        const chapterService = new ChapterService(MongoDB.client);
        const updatedChapter = await chapterService.update(req.params.id, req.body);
        if (!updatedChapter) {
            return next(new ApiError(404, 'Chapter not found'));
        }
        res.json(updatedChapter);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while updating chapter with id ' + req.params.id, error)
        );
    }
};

// Delete a chapter
exports.deleteChapter = async (req, res, next) => {
    try {
        const chapterService = new ChapterService(MongoDB.client);
        const deletedChapter = await chapterService.delete(req.params.id);
        if (!deletedChapter) {
            return next(new ApiError(404, 'Chapter not found'));
        }
        res.json({ message: 'Chapter deleted successfully' });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while deleting chapter with id ' + req.params.id, error)
        );
    }
};

// Delete all chapters
exports.deleteAllChapters = async (req, res, next) => {
    try {
        const chapterService = new ChapterService(MongoDB.client);
        const deletedCount = await chapterService.deleteAll();
        res.json({ message: `${deletedCount} chapters deleted` });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while deleting all chapters', error)
        );
    }
};

// Delete all chapters of a novel
exports.deleteChaptersByNovelId = async (req, res, next) => {
    try {
        const chapterService = new ChapterService(MongoDB.client);
        const deletedCount = await chapterService.deleteByNovelId(req.params.novelId);
        res.json({ message: `${deletedCount} chapters deleted for novel ${req.params.novelId}` });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while deleting chapters for novel ' + req.params.novelId, error)
        );
    }
};
