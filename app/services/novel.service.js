const { ObjectId } = require('mongodb');

class NovelService {
    constructor(client) {
        this.Novel = client.db().collection('novels');
    }

    // Extract novel data from request (for create - with defaults)
    extractNovelDataForCreate(payload) {
        const novel = {
            title: payload.title,
            author: payload.author,
            description: payload.description || '',
            genres: Array.isArray(payload.genres) ? [...payload.genres] : [],
            coverImage: payload.coverImage || '',
            status: payload.status || 'ongoing',
            views: payload.views || 0,
            likes: payload.likes || 0,
            favorite: payload.favorite || false,
        };

        console.log('Extracted novel data for create:', novel);
        return novel;
    }

    // Extract novel data from request (for update - only provided fields)
    extractNovelDataForUpdate(payload) {
        const novel = {};
        
        // Only add fields that are explicitly provided
        if (payload.title !== undefined) novel.title = payload.title;
        if (payload.author !== undefined) novel.author = payload.author;
        if (payload.description !== undefined) novel.description = payload.description;
        if (payload.genres !== undefined) {
            // Ensure genres is a plain array (handle Proxy or reactive objects)
            novel.genres = Array.isArray(payload.genres) ? [...payload.genres] : [];
        }
        if (payload.coverImage !== undefined) novel.coverImage = payload.coverImage;
        if (payload.status !== undefined) novel.status = payload.status;
        if (payload.views !== undefined) novel.views = payload.views;
        if (payload.likes !== undefined) novel.likes = payload.likes;
        if (payload.favorite !== undefined) novel.favorite = payload.favorite;

        console.log('Extracted novel data for update:', novel);
        return novel;
    }

    // Get all novels
    async findAll(filter = {}) {
        const cursor = await this.Novel.find(filter);
        return await cursor.toArray();
    }

    // Get novel by ID
    async findById(id) {
        return await this.Novel.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    // Create novel
    async create(payload) {
        const novel = this.extractNovelDataForCreate(payload);
        const result = await this.Novel.insertOne({
            ...novel,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return await this.findById(result.insertedId);
    }

    // Update novel
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractNovelDataForUpdate(payload);
        const result = await this.Novel.findOneAndUpdate(
            filter,
            { $set: { ...update, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        // Return the value directly (MongoDB driver returns { value: document })
        return result.value || result;
    }

    // Delete novel
    async delete(id) {
        const result = await this.Novel.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    // Delete all novels
    async deleteAll() {
        const result = await this.Novel.deleteMany({});
        return result.deletedCount;
    }

    // Find favorite novels
    async findFavorite() {
        return await this.findAll({ favorite: true });
    }
}

module.exports = NovelService;
