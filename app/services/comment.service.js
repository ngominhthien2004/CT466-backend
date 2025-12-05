const { ObjectId } = require('mongodb');

class CommentService {
    constructor(client) {
        this.Comment = client.db().collection('comments');
    }

    // Extract comment data from request
    extractCommentData(payload) {
        const comment = {
            novelId: payload.novelId,
            chapterId: payload.chapterId,
            userId: payload.userId,
            userName: payload.userName,
            userAvatar: payload.userAvatar,
            content: payload.content,
            rating: payload.rating || 0,
            parentId: payload.parentId, // For reply functionality
            likedBy: payload.likedBy || [], // Array of userIds who liked
            reports: payload.reports || [], // Array of report objects
            isReported: payload.isReported || false,
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

    // Get comments by chapter ID
    async findByChapterId(chapterId) {
        return await this.findAll({ 
            chapterId: ObjectId.isValid(chapterId) ? new ObjectId(chapterId) : null 
        });
    }

    // Get comments by user ID
    async findByUserId(userId) {
        return await this.findAll({ userId });
    }

    // Get reported comments
    async findReported() {
        // Query for comments where isReported is true OR reports array exists and not empty
        return await this.Comment.find({
            $or: [
                { isReported: true },
                { reports: { $exists: true, $not: { $size: 0 } } }
            ]
        }).toArray();
    }

    // Get comment by ID
    async findById(id) {
        return await this.Comment.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    // Create comment
    async create(payload) {
        console.log('Create comment - payload received:', payload);
        const comment = this.extractCommentData(payload);
        console.log('Create comment - after extract:', comment);
        
        // Convert novelId to ObjectId if it's a valid string
        if (comment.novelId && ObjectId.isValid(comment.novelId)) {
            comment.novelId = new ObjectId(comment.novelId);
        }
        
        // Convert chapterId to ObjectId if it's a valid string
        if (comment.chapterId && ObjectId.isValid(comment.chapterId)) {
            comment.chapterId = new ObjectId(comment.chapterId);
        }
        
        // Convert parentId to ObjectId if it's a valid string (for replies)
        if (comment.parentId && ObjectId.isValid(comment.parentId)) {
            comment.parentId = new ObjectId(comment.parentId);
        }
        
        console.log('Create comment - before insert:', comment);

        const result = await this.Comment.insertOne({
            ...comment,
            likedBy: [], // Initialize empty likedBy array
            reports: [], // Initialize empty reports array
            isReported: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return await this.findById(result.insertedId);
    }
    
    // Like a comment
    async likeComment(commentId, userId) {
        const comment = await this.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }
        
        const likedBy = comment.likedBy || [];
        
        // Check if user already liked
        if (likedBy.includes(userId)) {
            return comment;
        }
        
        // Add user to likedBy array
        await this.Comment.findOneAndUpdate(
            { _id: new ObjectId(commentId) },
            { 
                $push: { likedBy: userId },
                $set: { updatedAt: new Date() }
            },
            { returnDocument: 'after' }
        );
        
        // Return updated comment
        return await this.findById(commentId);
    }
    
    // Unlike a comment
    async unlikeComment(commentId, userId) {
        const comment = await this.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }
        
        // Remove user from likedBy array
        await this.Comment.findOneAndUpdate(
            { _id: new ObjectId(commentId) },
            { 
                $pull: { likedBy: userId },
                $set: { updatedAt: new Date() }
            },
            { returnDocument: 'after' }
        );
        
        // Return updated comment
        return await this.findById(commentId);
    }
    
    // Get replies for a comment
    async getReplies(parentId) {
        return await this.findAll({ 
            parentId: ObjectId.isValid(parentId) ? new ObjectId(parentId) : null 
        });
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
        
        // Convert chapterId to ObjectId if it's a valid string
        if (update.chapterId && ObjectId.isValid(update.chapterId)) {
            update.chapterId = new ObjectId(update.chapterId);
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

    // Delete all comments of a chapter
    async deleteByChapterId(chapterId) {
        const result = await this.Comment.deleteMany({
            chapterId: ObjectId.isValid(chapterId) ? new ObjectId(chapterId) : null,
        });
        return result.deletedCount;
    }

    // Delete all comments of a user
    async deleteByUserId(userId) {
        const result = await this.Comment.deleteMany({ userId });
        return result.deletedCount;
    }

    // Report a comment
    async reportComment(commentId, userId, reason) {
        const filter = {
            _id: ObjectId.isValid(commentId) ? new ObjectId(commentId) : null,
        };

        // First, ensure the comment has reports array
        await this.Comment.updateOne(
            filter,
            {
                $setOnInsert: { reports: [], isReported: false }
            },
            { upsert: false }
        );

        const report = {
            userId: userId,
            reason: reason || 'No reason provided',
            reportedAt: new Date(),
        };

        const result = await this.Comment.findOneAndUpdate(
            filter,
            {
                $addToSet: { reports: report }, // Use $addToSet to avoid duplicates
                $set: { isReported: true, updatedAt: new Date() }
            },
            { returnDocument: 'after' }
        );
        return result;
    }

    // Unreport a comment (clear all reports)
    async unreportComment(commentId) {
        const filter = {
            _id: ObjectId.isValid(commentId) ? new ObjectId(commentId) : null,
        };

        const result = await this.Comment.findOneAndUpdate(
            filter,
            {
                $set: { 
                    reports: [], 
                    isReported: false,
                    updatedAt: new Date() 
                }
            },
            { returnDocument: 'after' }
        );
        return result;
    }
}

module.exports = CommentService;
