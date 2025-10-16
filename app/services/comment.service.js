const { ObjectId } = require('mongodb');

class CommentService {
    constructor(client) {
        this.Comment = client.db().collection('comments');
    }

    // Extract comment data from request
    extractCommentData(payload) {
        const comment = {
            novelId: payload.novelId,
            userId: payload.userId,
            userName: payload.userName,
            content: payload.content,
            rating: payload.rating || 0,
            likes: payload.likes || 0,
        };

        // Remove undefined fields
        Object.keys(comment).forEach(
            (key) => comment[key] === undefined && delete comment[key]
        );

        return comment;
    }

    // Get all comments
    async findAll(filter = {}) {
        const cursor = await this.Comment.find(filter);
        return await cursor.toArray();
    }

    // Get comments by novel ID
    async findByNovelId(novelId) {
        return await this.findAll({ 
            novelId: ObjectId.isValid(novelId) ? new ObjectId(novelId) : null 
        });
    }

    // Get comments by user ID
    async findByUserId(userId) {
        return await this.findAll({ userId });
    }

    // Get comment by ID
    async findById(id) {
        return await this.Comment.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    // Create comment
    async create(payload) {
        const comment = this.extractCommentData(payload);
        
        // Convert novelId to ObjectId if it's a valid string
        if (comment.novelId && ObjectId.isValid(comment.novelId)) {
            comment.novelId = new ObjectId(comment.novelId);
        }

        const result = await this.Comment.insertOne({
            ...comment,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return await this.findById(result.insertedId);
    }

    // Update comment
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractCommentData(payload);
        
        // Convert novelId to ObjectId if it's a valid string
        if (update.novelId && ObjectId.isValid(update.novelId)) {
            update.novelId = new ObjectId(update.novelId);
        }

        const result = await this.Comment.findOneAndUpdate(
            filter,
            { $set: { ...update, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        return result;
    }

    // Delete comment
    async delete(id) {
        const result = await this.Comment.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    // Delete all comments
    async deleteAll() {
        const result = await this.Comment.deleteMany({});
        return result.deletedCount;
    }

    // Delete all comments of a novel
    async deleteByNovelId(novelId) {
        const result = await this.Comment.deleteMany({
            novelId: ObjectId.isValid(novelId) ? new ObjectId(novelId) : null,
        });
        return result.deletedCount;
    }

    // Delete all comments of a user
    async deleteByUserId(userId) {
        const result = await this.Comment.deleteMany({ userId });
        return result.deletedCount;
    }
}

module.exports = CommentService;
