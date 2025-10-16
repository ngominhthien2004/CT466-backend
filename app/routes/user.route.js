const express = require('express');
const users = require('../controllers/user.controller');

const router = express.Router();

// Get active users - must be before /:id route
router.get('/active', users.getActiveUsers);

// Get users by role - must be before /:id route
router.get('/role/:role', users.getUsersByRole);

router.route('/')
    .get(users.getAllUsers)
    .delete(users.deleteAllUsers);

// Profile routes
router.route('/profile/:id')
    .get(users.getProfile)
    .put(users.updateProfile);

// Change password
router.put('/change-password/:id', users.changePassword);

// User management routes
router.route('/:id')
    .get(users.getUserById)
    .put(users.updateUser)
    .delete(users.deleteUser);

module.exports = router;
