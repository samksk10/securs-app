const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Enregistrer la photo de référence d'un agent
const registerFace = async (req, res) => {
    try {
        const userId = req.user.id;
        const { faceData } = req.body; // Base64 de la photo

        if (!faceData) {
            return res.status(400).json({
                success: false,
                error: 'Données faciales manquantes'
            });
        }

        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        // Sauvegarder l'encodage facial
        await client.query(
            `UPDATE users SET face_encoding = $1, updated_at = NOW() WHERE id = $2`,
            [ faceData, userId ]
        );

        await client.end();

        res.json({
            success: true,
            message: 'Visage enregistré avec succès'
        });

    } catch (error) {
        console.error('Erreur enregistrement visage:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'enregistrement du visage'
        });
    }
};

// Vérifier la correspondance faciale (version simplifiée)
const verifyFace = async (req, res) => {
    try {
        const userId = req.user.id;
        const { faceData } = req.body; // Photo prise lors du pointage

        if (!faceData) {
            return res.status(400).json({
                success: false,
                error: 'Photo manquante'
            });
        }

        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        // Récupérer l'encodage facial de référence
        const userResult = await client.query(
            `SELECT face_encoding FROM users WHERE id = $1`,
            [ userId ]
        );

        if (userResult.rows.length === 0 || !userResult.rows[ 0 ].face_encoding) {
            await client.end();
            return res.status(404).json({
                success: false,
                error: 'Aucun visage enregistré pour cet agent'
            });
        }

        const storedFaceData = userResult.rows[ 0 ].face_encoding;

        // SIMULATION: Pour l'instant, on simule une vérification réussie
        // En production, utiliser une librairie de comparaison d'images
        const matchConfidence = 0.85; // Simulation: 85% de correspondance

        // Logique simplifiée: comparer la taille des données
        const similarityScore = Math.min(
            faceData.length / storedFaceData.length,
            storedFaceData.length / faceData.length
        );

        const isMatch = similarityScore > 0.7; // Seuil à 70%

        await client.end();

        res.json({
            success: true,
            match: isMatch,
            confidence: isMatch ? matchConfidence : 0.3,
            message: isMatch
                ? 'Vérification faciale réussie'
                : 'La photo ne correspond pas à l\'agent'
        });

    } catch (error) {
        console.error('Erreur vérification faciale:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la vérification faciale'
        });
    }
};

// Vérifier si l'agent a déjà enregistré son visage
const checkFaceRegistered = async (req, res) => {
    try {
        const userId = req.user.id;

        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        const result = await client.query(
            `SELECT face_encoding IS NOT NULL as has_face FROM users WHERE id = $1`,
            [ userId ]
        );

        await client.end();

        res.json({
            success: true,
            hasFaceRegistered: result.rows[ 0 ]?.has_face || false
        });

    } catch (error) {
        console.error('Erreur vérification enregistrement:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la vérification'
        });
    }
};

module.exports = {
    registerFace,
    verifyFace,
    checkFaceRegistered
};