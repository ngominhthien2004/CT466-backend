const express = require('express');
const auth = require('../controllers/auth.controller');

const router = express.Router();

// Auth routes - only register and login
router.post('/register', auth.register);
router.post('/login', auth.login);

module.exports = router;
