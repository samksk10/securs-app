const express = require('express');
const router = express.Router();
const faceController = require('../controllers/face.controller');
const { authMiddleware } = require('../middleware/auth');

// Vérifier si visage enregistré
router.get('/check', authMiddleware, faceController.checkFaceRegistered);

// Enregistrer visage (première fois)
router.post('/register', authMiddleware, faceController.registerFace);

// Vérifier correspondance lors du pointage
router.post('/verify', authMiddleware, faceController.verifyFace);

module.exports = router;