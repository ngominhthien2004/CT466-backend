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
            icon: payload.icon || '',
            description: payload.description || '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await this.Genre.insertOne(genre);
        return await this.findById(result.insertedId);
    }

    // Cập nhật genre
    async update(id, payload) {
        const update = {
            ...payload,
            updatedAt: new Date(),
        };
        const result = await this.Genre.findOneAndUpdate(
            { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
            { $set: update },
            { returnDocument: 'after' }
        );
        return result.value;
    }

    // Xóa genre
    async delete(id) {
        const result = await this.Genre.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }

    // Xóa tất cả genres
    async deleteAll() {
        const result = await this.Genre.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = GenreService;
