const UserService = require('../services/user.service');
const MongoDB = require('../utils/mongodb.util');
const ApiError = require('../api-error');

// Get all users
exports.getAllUsers = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const users = await userService.findAll();
        
        // Remove passwords from response
        users.forEach(user => delete user.password);
        
        res.json(users);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while retrieving users', error)
        );
    }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const user = await userService.findById(req.params.id);
        
        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        // Remove password from response
        delete user.password;

        res.json(user);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while retrieving user with id ' + req.params.id, error)
        );
    }
};

// Get user profile (same as getUserById but different route)
exports.getProfile = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const user = await userService.findById(req.params.id);
        
        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        // Remove password from response
        delete user.password;

        res.json(user);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while retrieving user profile', error)
        );
    }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const updatedUser = await userService.update(req.params.id, req.body);
        
        if (!updatedUser) {
            return next(new ApiError(404, 'User not found'));
        }

        // Remove password from response
        delete updatedUser.password;

        res.json(updatedUser);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while updating user profile', error)
        );
    }
};

// Update user (admin function)
exports.updateUser = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const updatedUser = await userService.update(req.params.id, req.body);
        
        if (!updatedUser) {
            return next(new ApiError(404, 'User not found'));
        }

        // Remove password from response
        delete updatedUser.password;

        res.json(updatedUser);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while updating user with id ' + req.params.id, error)
        );
    }
};

// Change password
exports.changePassword = async (req, res, next) => {
    if (!req.body?.currentPassword) {
        return next(new ApiError(400, 'Current password can not be empty'));
    }
    if (!req.body?.newPassword) {
        return next(new ApiError(400, 'New password can not be empty'));
    }

    try {
        const bcrypt = require('bcryptjs');
        const userService = new UserService(MongoDB.client);
        const user = await userService.findById(req.params.id);

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        // Check current password with bcrypt
        const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!isMatch) {
            return next(new ApiError(401, 'Current password is incorrect'));
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        await userService.updatePassword(req.params.id, hashedPassword);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while changing password', error)
        );
    }
};

// Upload avatar
exports.uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new ApiError(400, 'No file uploaded'));
        }

        const userService = new UserService(MongoDB.client);
        const userId = req.params.id;
        
        // Check if user exists
        const user = await userService.findById(userId);
        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        // Delete old avatar file if exists
        if (user.avatar && !user.avatar.startsWith('http')) {
            const fs = require('fs');
            const path = require('path');
            const oldAvatarPath = path.join(__dirname, '../../../frontend/public/assets/user', userId, user.avatar);
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }

        // Update user avatar
        const avatarFilename = req.file.filename;
        await userService.update(userId, { avatar: avatarFilename });

        res.json({
            message: 'Avatar uploaded successfully',
            avatar: avatarFilename,
            avatarUrl: `/assets/user/${userId}/${avatarFilename}`
        });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while uploading avatar', error)
        );
    }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const deletedUser = await userService.delete(req.params.id);
        
        if (!deletedUser) {
            return next(new ApiError(404, 'User not found'));
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while deleting user with id ' + req.params.id, error)
        );
    }
};

// Delete all users
exports.deleteAllUsers = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const deletedCount = await userService.deleteAll();
        res.json({ message: `${deletedCount} users deleted` });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while deleting all users', error)
        );
    }
};

// Get users by role
exports.getUsersByRole = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const users = await userService.findByRole(req.params.role);
        
        // Remove passwords from response
        users.forEach(user => delete user.password);
        
        res.json(users);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while retrieving users with role ' + req.params.role, error)
        );
    }
};

// Get active users
exports.getActiveUsers = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const users = await userService.findActive();
        
        // Remove passwords from response
        users.forEach(user => delete user.password);
        
        res.json(users);
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while retrieving active users', error)
        );
    }
};
