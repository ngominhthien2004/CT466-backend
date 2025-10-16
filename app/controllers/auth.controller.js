const UserService = require('../services/user.service');
const MongoDB = require('../utils/mongodb.util');
const ApiError = require('../api-error');

// Register new user
exports.register = async (req, res, next) => {
    if (!req.body?.username) {
        return next(new ApiError(400, 'Username can not be empty'));
    }
    if (!req.body?.email) {
        return next(new ApiError(400, 'Email can not be empty'));
    }
    if (!req.body?.password) {
        return next(new ApiError(400, 'Password can not be empty'));
    }

    try {
        const userService = new UserService(MongoDB.client);
        
        // Check if user already exists
        const existingUser = await userService.checkExists(req.body.email, req.body.username);

        if (existingUser) {
            return next(new ApiError(400, 'Username or email already exists'));
        }

        // Create new user (you should hash password in production!)
        const userData = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password, // TODO: Hash this with bcrypt
            fullName: req.body.fullName || '',
            avatar: req.body.avatar || '',
            role: req.body.role || 'user',
        };

        const user = await userService.create(userData);

        // Remove password from response
        delete user.password;

        res.status(201).json({
            message: 'User registered successfully',
            user: user
        });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while registering user', error)
        );
    }
};

// Login user
exports.login = async (req, res, next) => {
    if (!req.body?.email) {
        return next(new ApiError(400, 'Email can not be empty'));
    }
    if (!req.body?.password) {
        return next(new ApiError(400, 'Password can not be empty'));
    }

    try {
        const userService = new UserService(MongoDB.client);
        
        // Find user by email
        const user = await userService.findByEmail(req.body.email);

        if (!user) {
            return next(new ApiError(401, 'Invalid email or password'));
        }

        // Check if user is active
        if (user.isActive === false) {
            return next(new ApiError(403, 'Your account has been deactivated'));
        }

        // Check password (you should use bcrypt.compare in production!)
        if (user.password !== req.body.password) {
            return next(new ApiError(401, 'Invalid email or password'));
        }

        // Remove password from response
        delete user.password;

        // TODO: Generate JWT token here
        res.json({
            message: 'Login successful',
            user: user,
            // token: 'your-jwt-token-here'
        });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while logging in', error)
        );
    }
};

