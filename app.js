const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./app/config/passport');

const ApiError = require('./app/api-error');

const app = express();

// Middleware 
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
}));
// Increase payload limit for base64 images (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Session middleware for passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Import routes
const novelsRoutes = require('./app/routes/novel.route');
const chaptersRoutes = require('./app/routes/chapter.route');
const commentsRoutes = require('./app/routes/comment.route');
const authRoutes = require('./app/routes/auth.route');
const usersRoutes = require('./app/routes/user.route');

const genresRoutes = require('./app/routes/genre.route');
const readingHistoryRoutes = require('./app/routes/readingHistory.route');

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to novel application' });
});

// Register routes
app.use('/api/novels', novelsRoutes);
app.use('/api/chapters', chaptersRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/genres', genresRoutes);
app.use('/api/reading-history', readingHistoryRoutes);

app.use((req, res, next) => {
    return next(new ApiError(404, 'Resource Not Found'));
});

// Error handling middleware

app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
    });
});


module.exports = app;