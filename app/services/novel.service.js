const { ObjectId } = require('mongodb');

class NovelService {
    constructor(client) {
        this.Novel = client.db().collection('novels');
    }

    // Extract novel data from request
    extractNovelData(payload) {
        const novel = {
            title: payload.title,
            author: payload.author,
            description: payload.description,
            genres: payload.genres || [],
            coverImage: payload.coverImage,
            status: payload.status || 'ongoing',
            views: payload.views || 0,
            likes: payload.likes || 0,
            favorite: payload.favorite || false,
        };

        // Remove undefined fields
        Object.keys(novel).forEach(
            (key) => novel[key] === undefined && delete novel[key]
        );

        console.log('Extracted novel data:', novel);
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
        const novel = this.extractNovelData(payload);
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
        const update = this.extractNovelData(payload);
        const result = await this.Novel.findOneAndUpdate(
            filter,
            { $set: { ...update, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        return result;
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
