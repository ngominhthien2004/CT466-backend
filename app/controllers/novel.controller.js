const Novel = require('../models/novel.model');

// Get all novels
exports.getAllNovels = async (req, res) => {
    try {
        const novels = await Novel.find();
        res.json(novels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single novel by ID
exports.getNovelById = async (req, res) => {
    try {
        const novel = await Novel.findById(req.params.id);
        if (!novel) return res.status(404).json({ message: 'Novel not found' });
        res.json(novel);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new novel
exports.createNovel = async (req, res) => {
    const novel = new Novel(req.body);
    try {
        const newNovel = await novel.save();
        res.status(201).json(newNovel);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a novel
exports.updateNovel = async (req, res) => {
    try {
        const updatedNovel = await Novel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedNovel) return res.status(404).json({ message: 'Novel not found' });
        res.json(updatedNovel);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a novel
exports.deleteNovel = async (req, res) => {
    try {
        const deletedNovel = await Novel.findByIdAndDelete(req.params.id);
        if (!deletedNovel) return res.status(404).json({ message: 'Novel not found' });
        res.json({ message: 'Novel deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};