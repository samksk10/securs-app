const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes - VÉRIFIE QUE CES FICHIERS EXISTENT
const authRoutes = require('./routes/auth.routes');
const qrRoutes = require('./routes/qr.routes');
const checkinRoutes = require('./routes/checkin.routes');
const incidentRoutes = require('./routes/incident.routes');
const adminRoutes = require('./routes/admin.routes');
const faceRoutes = require('./routes/face.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/face', faceRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${ PORT }`);
    console.log(`📁 Uploads directory: ${ path.join(__dirname, '../uploads') }`);
});

module.exports = app;