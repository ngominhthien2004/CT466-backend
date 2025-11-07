const { ObjectId } = require('mongodb');

class ReadingHistoryService {
    constructor(client) {
        this.ReadingHistory = client.db().collection('reading_history');
    }

    // Extract reading history data
    extractHistoryData(payload) {
        const history = {
            novelId: payload.novelId,
            chapterId: payload.chapterId,
            chapterTitle: payload.chapterTitle,
            novelTitle: payload.novelTitle,
            novelCover: payload.novelCover,
            lastRead: payload.lastRead || new Date()
        };

        // Remove undefined fields
        Object.keys(history).forEach(
            key => history[key] === undefined && delete history[key]
        );

        return history;
    }

    // Find all history by user ID
    async findByUserId(userId) {
        try {
            const cursor = await this.ReadingHistory.find({
                userId: new ObjectId(userId)
            }).sort({ lastRead: -1 });

            return await cursor.toArray();
        } catch (error) {
            console.error('Error finding reading history:', error);
            throw error;
        }
    }

    // Add or update reading history
    async addOrUpdate(userId, payload) {
        try {
            const historyData = this.extractHistoryData(payload);
            
            // Check if this novel already exists in history
            const existing = await this.ReadingHistory.findOne({
                userId: new ObjectId(userId),
                novelId: historyData.novelId
            });

            if (existing) {
                // Update existing entry
                const result = await this.ReadingHistory.findOneAndUpdate(
                    {
                        userId: new ObjectId(userId),
                        novelId: historyData.novelId
                    },
                    {
                        $set: {
                            ...historyData,
                            lastRead: new Date()
                        }
                    },
                    {
                        returnDocument: 'after'
                    }
                );
                return result.value;
            } else {
                // Create new entry
                const newHistory = {
                    userId: new ObjectId(userId),
                    ...historyData,
                    createdAt: new Date()
                };

                const result = await this.ReadingHistory.insertOne(newHistory);
                return { _id: result.insertedId, ...newHistory };
            }
        } catch (error) {
            console.error('Error adding/updating reading history:', error);
            throw error;
        }
    }

    // Remove a novel from reading history
    async removeNovel(userId, novelId) {
        try {
            const result = await this.ReadingHistory.deleteOne({
                userId: new ObjectId(userId),
                novelId: novelId
            });

            return result.deletedCount;
        } catch (error) {
            console.error('Error removing from reading history:', error);
            throw error;
        }
    }

    // Clear all reading history for a user
    async clearAll(userId) {
        try {
            const result = await this.ReadingHistory.deleteMany({
                userId: new ObjectId(userId)
            });

            return result.deletedCount;
        } catch (error) {
            console.error('Error clearing reading history:', error);
            throw error;
        }
    }

    // Get recent reading history (limited)
    async getRecent(userId, limit = 20) {
        try {
            const cursor = await this.ReadingHistory
                .find({ userId: new ObjectId(userId) })
                .sort({ lastRead: -1 })
                .limit(limit);

            return await cursor.toArray();
        } catch (error) {
            console.error('Error getting recent reading history:', error);
            throw error;
        }
    }
}

module.exports = ReadingHistoryService;
