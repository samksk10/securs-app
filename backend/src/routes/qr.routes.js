const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qr.controller');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

// ADMIN: Générer le QR code du jour
router.post('/generate', authMiddleware, requireAdmin, qrController.generateDailyQR);

// ADMIN: Désactiver le QR code du jour
router.post('/disable', authMiddleware, requireAdmin, qrController.disableTodayQR);

// TOUS (avec auth): Récupérer le QR code du jour
router.get('/today', authMiddleware, qrController.getTodayQR);

// AGENT: Valider un QR code scanné
router.post('/validate', authMiddleware, qrController.validateQR);

module.exports = router;