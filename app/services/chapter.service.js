const { ObjectId } = require('mongodb');

class ChapterService {
    constructor(client) {
        this.Chapter = client.db().collection('chapters');
    }

    // Extract chapter data from request
    extractChapterData(payload) {
        const chapter = {
            novelId: payload.novelId,
            chapterNumber: payload.chapterNumber,
            title: payload.title,
            content: payload.content,
            views: payload.views || 0,
            publishedDate: payload.publishedDate || new Date(),
        };

        // Remove undefined fields
        Object.keys(chapter).forEach(
            (key) => chapter[key] === undefined && delete chapter[key]
        );

        return chapter;
    }

    // Get all chapters
    async findAll(filter = {}) {
        const cursor = await this.Chapter.find(filter);
        return await cursor.toArray();
    }

    // Get chapters by novel ID
    async findByNovelId(novelId) {
        return await this.findAll({ 
            novelId: ObjectId.isValid(novelId) ? new ObjectId(novelId) : null 
        });
    }

    // Get chapter by ID
    async findById(id) {
        return await this.Chapter.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    // Create chapter
    async create(payload) {
        const chapter = this.extractChapterData(payload);
        
        // Convert novelId to ObjectId if it's a valid string
        if (chapter.novelId && ObjectId.isValid(chapter.novelId)) {
            chapter.novelId = new ObjectId(chapter.novelId);
        }

        const result = await this.Chapter.insertOne({
            ...chapter,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return await this.findById(result.insertedId);
    }

    // Update chapter
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractChapterData(payload);
        
        // Convert novelId to ObjectId if it's a valid string
        if (update.novelId && ObjectId.isValid(update.novelId)) {
            update.novelId = new ObjectId(update.novelId);
        }

        const result = await this.Chapter.findOneAndUpdate(
            filter,
            { $set: { ...update, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        return result;
    }

    // Delete chapter
    async delete(id) {
        const result = await this.Chapter.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    // Delete all chapters
    async deleteAll() {
        const result = await this.Chapter.deleteMany({});
        return result.deletedCount;
    }

    // Delete all chapters of a novel
    async deleteByNovelId(novelId) {
        const result = await this.Chapter.deleteMany({
            novelId: ObjectId.isValid(novelId) ? new ObjectId(novelId) : null,
        });
        return result.deletedCount;
    }
}

module.exports = ChapterService;
