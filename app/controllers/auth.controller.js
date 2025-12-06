const UserService = require('../services/user.service');
const MongoDB = require('../utils/mongodb.util');
const ApiError = require('../api-error');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

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

        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create new user
        const userData = {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            fullName: req.body.fullName || '',
            avatar: req.body.avatar || '',
            role: req.body.role || 'user',
        };

        const user = await userService.create(userData);

        // Generate token
        const token = generateToken(user);

        // Remove password from response
        delete user.password;

        res.status(201).json({
            message: 'User registered successfully',
            user: user,
            token: token
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

        // Verify password
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        
        if (!isPasswordValid) {
            return next(new ApiError(401, 'Invalid email or password'));
        }

        // Generate token
        const token = generateToken(user);

        // Remove password from response
        delete user.password;

        res.json({
            message: 'Login successful',
            user: user,
            token: token
        });
    } catch (error) {
        return next(
            new ApiError(500, 'An error occurred while logging in', error)
        );
    }
};

// Google OAuth callback handler
exports.googleCallback = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
        }

        // Generate token
        const token = generateToken(req.user);

        // Remove password from user object
        const userWithoutPassword = { ...req.user };
        delete userWithoutPassword.password;

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}`);
    } catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }
};
