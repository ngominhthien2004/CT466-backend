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
    if (!req.body?.oldPassword) {
        return next(new ApiError(400, 'Old password can not be empty'));
    }
    if (!req.body?.newPassword) {
        return next(new ApiError(400, 'New password can not be empty'));
    }

    try {
        const userService = new UserService(MongoDB.client);
        const user = await userService.findById(req.params.id);

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        // Check old password (use bcrypt.compare in production!)
        if (user.password !== req.body.oldPassword) {
            return next(new ApiError(401, 'Old password is incorrect'));
        }

        // Update password (hash with bcrypt in production!)
        await userService.updatePassword(req.params.id, req.body.newPassword);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while changing password', error)
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
