const express = require('express');
const auth = require('../controllers/auth.controller');
const passport = require('../config/passport');

const router = express.Router();

// Auth routes - only register and login
router.post('/register', auth.register);
router.post('/login', auth.login);

// Google OAuth routes
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/login',
        session: false 
    }),
    auth.googleCallback
);

module.exports = router;
