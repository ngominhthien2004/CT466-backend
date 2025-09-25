const express = require('express');
const cors = require('cors');

const ApiError = require('./app/api-error');

const app = express();

const novelRoutes = require('./app/routes/novel.route');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to novel application' });
});

app.use('/api/novel', novelRoutes);

// Handle 404 errors
app.use((req, res, next) => {
    return next(new ApiError(404, 'Resource not found'));
});

app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
    });
});

module.exports = app;