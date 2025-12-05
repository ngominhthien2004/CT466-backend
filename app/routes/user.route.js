const express = require('express');
const users = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Get active users - must be before /:id route
router.get('/active', authenticate, authorize('admin'), users.getActiveUsers);

// Get users by role - must be before /:id route
router.get('/role/:role', authenticate, authorize('admin'), users.getUsersByRole);

router.route('/')
    .get(authenticate, authorize('admin'), users.getAllUsers)
    .delete(authenticate, authorize('admin'), users.deleteAllUsers);

// Profile routes
router.route('/profile/:id')
    .get(authenticate, users.getProfile)
    .put(authenticate, users.updateProfile);

// Change password
router.put('/change-password/:id', authenticate, users.changePassword);

// User management routes
router.route('/:id')
    .get(authenticate, users.getUserById)
    .put(authenticate, authorize('admin'), users.updateUser)
    .delete(authenticate, authorize('admin'), users.deleteUser);

module.exports = router;
