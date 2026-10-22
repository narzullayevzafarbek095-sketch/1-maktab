require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Initialize Database & Seed
const db = require('./config/database');
const seedDatabase = require('./seed/seedData');
seedDatabase();

const apiRoutes = require('./routes/api');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Body parsing middlewares
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logger for development
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toLocaleTimeString('uz-UZ')}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Static directory for uploaded media
const uploadsPath = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Mount REST API endpoints
app.use('/api', apiRoutes);

// Serve Frontend Static Files (Root Directory)
const rootPath = path.join(__dirname, '..');
app.use(express.static(rootPath));

// Fallback to index.html for root navigation if not matched
app.get('/', (req, res) => {
    res.sendFile(path.join(rootPath, 'index.html'));
});

// 404 for unmatched API routes
app.use('/api/*', notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Start HTTP server only if executed directly
if (require.main === module) {
    const server = app.listen(PORT, () => {
        console.log('====================================================');
        console.log(`🚀 DILBAR EDICATION BACKEND SERVER IS RUNNING`);
        console.log(`🌐 Sayt & API manzili: http://localhost:${PORT}`);
        console.log(`📡 REST API Docs:      http://localhost:${PORT}/api`);
        console.log(`🩺 Health check:       http://localhost:${PORT}/api/health`);
        console.log(`🔑 Admin Demo Login:   admin / admin123 (yoki 12345)`);
        console.log(`💾 Ma'lumotlar bazasi: SQLite (data/school.db)`);
        console.log('====================================================');
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
        console.log('SIGTERM qabul qilindi. Server to\'xtatilmoqda...');
        server.close(() => {
            console.log('HTTP server yopildi.');
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        console.log('SIGINT qabul qilindi. Server to\'xtatilmoqda...');
        server.close(() => {
            console.log('HTTP server yopildi.');
            process.exit(0);
        });
    });
}

module.exports = app;
