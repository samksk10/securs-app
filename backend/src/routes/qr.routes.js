const express = require('express');
const router = express.Router();
const { authMiddleware, requireAdmin } = require('../middleware/auth');

// Routes temporaires - à compléter plus tard
router.get('/', (req, res) => {
    res.json({ message: 'QR routes will be implemented soon' });
});

module.exports = router;