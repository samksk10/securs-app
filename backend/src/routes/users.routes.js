const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

// Récupérer la liste des agents
router.get('/agents', authMiddleware, requireAdmin, usersController.getAgents);

// Créer un nouvel agent
router.post('/agents', authMiddleware, requireAdmin, usersController.createAgent);

// Mettre à jour un agent
router.put('/agents/:id', authMiddleware, requireAdmin, usersController.updateAgent);

// Supprimer un agent
router.delete('/agents/:id', authMiddleware, requireAdmin, usersController.deleteAgent);

module.exports = router;
