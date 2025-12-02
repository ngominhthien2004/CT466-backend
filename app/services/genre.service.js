const { ObjectId } = require('mongodb');

class GenreService {
    constructor(client) {
        this.Genre = client.db().collection('genres');
    }

    // Lấy tất cả genres
    async findAll(filter = {}) {
        const cursor = await this.Genre.find(filter);
        return await cursor.toArray();
    }

    // Lấy genre theo id
    async findById(id) {
        return await this.Genre.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    // Lấy genre theo slug
    async findBySlug(slug) {
        return await this.Genre.findOne({ slug });
    }

    // Tạo genre mới
    async create(payload) {
        const genre = {
            name: payload.name,
            slug: payload.slug,
            description: payload.description || '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await this.Genre.insertOne(genre);
        return await this.findById(result.insertedId);
    }

    // Cập nhật genre
    async update(id, payload) {
        const update = {};
        
        // Only add fields that are explicitly provided
        if (payload.name !== undefined) update.name = payload.name;
        if (payload.slug !== undefined) update.slug = payload.slug;
        if (payload.description !== undefined) update.description = payload.description;
        
        update.updatedAt = new Date();
        
        const result = await this.Genre.findOneAndUpdate(
            { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
            { $set: update },
            { returnDocument: 'after' }
        );
        
        // If genre name was updated, update all novels that use this genre
        if (payload.name !== undefined && result.value) {
            const oldGenre = await this.findById(id);
            if (oldGenre && oldGenre.name !== payload.name) {
                const NovelService = require('./novel.service');
                const MongoDB = require('../utils/mongodb.util');
                const novelService = new NovelService(MongoDB.client);
                
                // Update all novels that have the old genre name
                await novelService.Novel.updateMany(
                    { genres: oldGenre.name },
                    { $set: { "genres.$": payload.name } }
                );
            }
        }
        
        return result.value || result;
    }

    // Xóa genre
    async delete(id) {
        const result = await this.Genre.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value || result;
    }

    // Xóa tất cả genres
    async deleteAll() {
        const result = await this.Genre.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = GenreService;
