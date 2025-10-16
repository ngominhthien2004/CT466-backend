const { ObjectId } = require('mongodb');

class UserService {
    constructor(client) {
        this.User = client.db().collection('users');
    }

    // Extract user data from request
    extractUserData(payload) {
        const user = {
            username: payload.username,
            email: payload.email,
            password: payload.password, // Will be hashed in production
            fullName: payload.fullName,
            avatar: payload.avatar,
            role: payload.role || 'user',
            isActive: payload.isActive !== undefined ? payload.isActive : true,
        };

        // Remove undefined fields
        Object.keys(user).forEach(
            (key) => user[key] === undefined && delete user[key]
        );

        return user;
    }

    // Get all users
    async findAll(filter = {}) {
        const cursor = await this.User.find(filter);
        return await cursor.toArray();
    }

    // Get user by ID
    async findById(id) {
        return await this.User.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    // Get user by email
    async findByEmail(email) {
        return await this.User.findOne({ email });
    }

    // Get user by username
    async findByUsername(username) {
        return await this.User.findOne({ username });
    }

    // Check if user exists
    async checkExists(email, username) {
        return await this.User.findOne({
            $or: [{ email }, { username }]
        });
    }

    // Create user
    async create(payload) {
        const user = this.extractUserData(payload);
        const result = await this.User.insertOne({
            ...user,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return await this.findById(result.insertedId);
    }

    // Update user
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        
        const update = {};
        
        // Only update allowed fields
        if (payload.fullName !== undefined) update.fullName = payload.fullName;
        if (payload.avatar !== undefined) update.avatar = payload.avatar;
        if (payload.role !== undefined) update.role = payload.role;
        if (payload.isActive !== undefined) update.isActive = payload.isActive;
        
        // Don't allow updating email, username, password here
        
        const result = await this.User.findOneAndUpdate(
            filter,
            { $set: { ...update, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        return result;
    }

    // Update password
    async updatePassword(id, newPassword) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        
        const result = await this.User.findOneAndUpdate(
            filter,
            { $set: { password: newPassword, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        return result;
    }

    // Delete user
    async delete(id) {
        const result = await this.User.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    // Delete all users
    async deleteAll() {
        const result = await this.User.deleteMany({});
        return result.deletedCount;
    }

    // Get users by role
    async findByRole(role) {
        return await this.findAll({ role });
    }

    // Get active users
    async findActive() {
        return await this.findAll({ isActive: true });
    }
}

module.exports = UserService;
