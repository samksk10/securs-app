const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agent.controller');
const { authMiddleware } = require('../middleware/auth');

// Récupérer les statistiques du tableau de bord
router.get('/dashboard-stats', authMiddleware, agentController.getDashboardStats);

module.exports = router;