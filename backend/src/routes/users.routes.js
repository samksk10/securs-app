const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

// Récupérer la liste des agents
router.get('/agents', authMiddleware, requireAdmin, usersController.getAgents);

module.exports = router;
