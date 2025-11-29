const express = require('express');
const cors = require('cors');

const ApiError = require('./app/api-error');

const app = express();

// Middleware phải đặt TRƯỚC routes
app.use(cors());
app.use(express.json());

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