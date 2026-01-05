const QRCode = require('qrcode');
const { Client } = require('pg');
const crypto = require('crypto');

// Générer un token unique pour la journée
const generateDailyToken = () => {
    const date = new Date().toISOString().split('T')[ 0 ]; // YYYY-MM-DD
    const random = crypto.randomBytes(8).toString('hex');
    return `SECURIS-${ date }-${ random }`;
};

// Générer le QR code du jour
const generateDailyQR = async (req, res) => {
    try {
        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        // Date d'aujourd'hui (format YYYY-MM-DD)
        const today = new Date();
        const dateStr = today.toISOString().split('T')[ 0 ];

        // Créer un token unique
        const token = generateDailyToken();

        // Données à encoder dans le QR code
        const qrData = {
            system: 'SECURIS',
            date: dateStr,
            token: token,
            validFrom: "00:00",
            validTo: "05:30",
            type: "agent_checkin",
            hotel: "Leon_Kinshasa"
        };

        // Générer le QR code (image base64)
        const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));

        // Sauvegarder dans la base de données
        await client.query(`
      INSERT INTO qr_codes (date, token, qr_code_data, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (date) DO UPDATE SET
        token = EXCLUDED.token,
        qr_code_data = EXCLUDED.qr_code_data,
        created_at = NOW(),
        is_active = true
      RETURNING *
    `, [ dateStr, token, qrCodeImage ]);

        await client.end();

        res.json({
            success: true,
            message: 'QR code généré pour aujourd\'hui',
            data: {
                date: dateStr,
                token: token,
                qrCode: qrCodeImage, // Image base64
                validFrom: "00:00",
                validTo: "05:30"
            }
        });

    } catch (error) {
        console.error('Erreur génération QR code:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la génération du QR code'
        });
    }
};

// Récupérer le QR code du jour
const getTodayQR = async (req, res) => {
    try {
        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        const today = new Date().toISOString().split('T')[ 0 ];

        const result = await client.query(
            `SELECT * FROM qr_codes WHERE date = $1 AND is_active = true`,
            [ today ]
        );

        await client.end();

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Aucun QR code actif pour aujourd\'hui'
            });
        }

        const qrCode = result.rows[ 0 ];

        res.json({
            success: true,
            data: {
                date: qrCode.date,
                token: qrCode.token,
                qrCode: qrCode.qr_code_data,
                validFrom: qrCode.valid_from || "00:00",
                validTo: qrCode.valid_to || "05:30",
                isActive: qrCode.is_active
            }
        });

    } catch (error) {
        console.error('Erreur récupération QR code:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération du QR code'
        });
    }
};

// Valider un QR code scanné
const validateQR = async (req, res) => {
    try {
        const { qrData } = req.body;

        if (!qrData) {
            return res.status(400).json({
                success: false,
                error: 'Données QR code manquantes'
            });
        }

        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        // Parser les données du QR code
        let parsedData;
        try {
            parsedData = JSON.parse(qrData);
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: 'Format QR code invalide'
            });
        }

        // Vérifier la date
        const today = new Date().toISOString().split('T')[ 0 ];
        if (parsedData.date !== today) {
            return res.status(400).json({
                success: false,
                valid: false,
                error: 'QR code expiré (mauvaise date)'
            });
        }

        // Vérifier le token dans la base
        const result = await client.query(
            `SELECT * FROM qr_codes WHERE date = $1 AND token = $2 AND is_active = true`,
            [ today, parsedData.token ]
        );

        if (result.rows.length === 0) {
            await client.end();
            return res.status(404).json({
                success: false,
                valid: false,
                error: 'QR code invalide ou désactivé'
            });
        }

        // Vérifier l'heure actuelle
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes depuis minuit

        // Convertir les heures de validation
        const [ fromHour, fromMinute ] = (parsedData.validFrom || "00:00").split(':').map(Number);
        const [ toHour, toMinute ] = (parsedData.validTo || "05:30").split(':').map(Number);

        const validFrom = fromHour * 60 + fromMinute;
        const validTo = toHour * 60 + toMinute;

        // Vérifier si on est dans la plage horaire
        const isInTimeRange = currentTime >= validFrom && currentTime <= validTo;

        await client.end();

        if (!isInTimeRange) {
            return res.json({
                success: true,
                valid: false,
                error: 'Hors plage horaire autorisée (00:00 - 05:30)',
                currentTime: `${ now.getHours().toString().padStart(2, '0') }:${ now.getMinutes().toString().padStart(2, '0') }`
            });
        }

        // QR code valide !
        res.json({
            success: true,
            valid: true,
            message: 'QR code valide',
            data: {
                date: parsedData.date,
                time: `${ now.getHours().toString().padStart(2, '0') }:${ now.getMinutes().toString().padStart(2, '0') }`,
                location: parsedData.hotel || 'Hôtel Leon Kinshasa'
            }
        });

    } catch (error) {
        console.error('Erreur validation QR code:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la validation du QR code'
        });
    }
};

// Désactiver le QR code du jour (admin seulement)
const disableTodayQR = async (req, res) => {
    try {
        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        const today = new Date().toISOString().split('T')[ 0 ];

        await client.query(
            `UPDATE qr_codes SET is_active = false WHERE date = $1`,
            [ today ]
        );

        await client.end();

        res.json({
            success: true,
            message: 'QR code désactivé pour aujourd\'hui'
        });

    } catch (error) {
        console.error('Erreur désactivation QR code:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la désactivation du QR code'
        });
    }
};

module.exports = {
    generateDailyQR,
    getTodayQR,
    validateQR,
    disableTodayQR
};