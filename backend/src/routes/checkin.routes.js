const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkin.controller');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

// AGENT: Enregistrer un pointage
router.post('/', authMiddleware, checkinController.createCheckIn);

// AGENT: Historique des pointages
router.get('/history', authMiddleware, checkinController.getCheckInHistory);

// AGENT: Statistiques
router.get('/stats', authMiddleware, checkinController.getCheckInStats);

// ADMIN: Récupérer tous les pointages
router.get('/all', authMiddleware, requireAdmin, checkinController.getAllCheckIns);

// ADMIN: Valider/rejeter un pointage
router.put('/status', authMiddleware, requireAdmin, checkinController.updateCheckInStatus);

module.exports = router;