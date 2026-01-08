const { Client } = require('pg');

/**
 * Création d'un client PostgreSQL
 */
const getClient = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    return client;
};

/**
 * Vérifier si l'agent a déjà enregistré son visage
 */
const checkFaceRegistered = async (req, res) => {
    try {
        const userId = req.user.id;
        const client = await getClient();

        const result = await client.query(
            `SELECT face_encoding IS NOT NULL AS has_face FROM users WHERE id = $1`,
            [ userId ]
        );

        await client.end();

        res.json({
            success: true,
            hasFaceRegistered: result.rows[ 0 ]?.has_face || false
        });

    } catch (error) {
        console.error('Erreur vérification visage:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la vérification du visage'
        });
    }
};

/**
 * Enregistrer le visage de référence de l'agent
 */
const registerFace = async (req, res) => {
    try {
        const userId = req.user.id;
        const { faceData } = req.body;

        if (!faceData) {
            return res.status(400).json({
                success: false,
                error: 'Données faciales manquantes'
            });
        }

        const client = await getClient();

        await client.query(
            `UPDATE users
       SET face_encoding = $1,
           updated_at = NOW()
       WHERE id = $2`,
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
            error: 'Erreur lors de l’enregistrement du visage'
        });
    }
};

/**
 * Vérifier la correspondance faciale (simulation contrôlée)
 * ⚠️ À remplacer par une vraie librairie en production
 */
const verifyFace = async (req, res) => {
    try {
        const userId = req.user.id;
        const { faceData } = req.body;

        if (!faceData) {
            return res.status(400).json({
                success: false,
                error: 'Photo manquante'
            });
        }

        const client = await getClient();

        const result = await client.query(
            `SELECT face_encoding FROM users WHERE id = $1`,
            [ userId ]
        );

        if (result.rows.length === 0 || !result.rows[ 0 ].face_encoding) {
            await client.end();
            return res.status(404).json({
                success: false,
                error: 'Aucun visage enregistré pour cet agent'
            });
        }

        const storedFaceData = result.rows[ 0 ].face_encoding;

        /**
         * Simulation de similarité
         * Plus les tailles sont proches, plus le score est élevé
         */
        const similarityScore = Math.min(
            faceData.length / storedFaceData.length,
            storedFaceData.length / faceData.length
        );

        const THRESHOLD = 0.7;
        const isMatch = similarityScore >= THRESHOLD;

        await client.end();

        res.json({
            success: true,
            match: isMatch,
            confidence: Number(similarityScore.toFixed(2)),
            message: isMatch
                ? 'Vérification faciale réussie'
                : 'Le visage ne correspond pas à l’agent'
        });

    } catch (error) {
        console.error('Erreur vérification faciale:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la vérification faciale'
        });
    }
};

module.exports = {
    checkFaceRegistered,
    registerFace,
    verifyFace
};
