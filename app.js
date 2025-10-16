const express = require('express');
const cors = require('cors');

const ApiError = require('./app/api-error');

const app = express();

// Middleware phải đặt TRƯỚC routes
app.use(cors());
app.use(express.json());

const novelsRoutes = require('./app/routes/novel.route');

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to novel application' });
});

app.use('/api/novels', novelsRoutes);

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