const { Client } = require('pg');

// Enregistrer un pointage
const createCheckIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            qrToken,
            faceConfidence,
            location,
            photoUrl
        } = req.body;

        if (!qrToken) {
            return res.status(400).json({
                success: false,
                error: 'Token QR code manquant'
            });
        }

        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        // Vérifier le QR code du jour
        const today = new Date().toISOString().split('T')[ 0 ];
        const qrResult = await client.query(
            `SELECT id FROM qr_codes WHERE date = $1 AND token = $2 AND is_active = true`,
            [ today, qrToken ]
        );

        if (qrResult.rows.length === 0) {
            await client.end();
            return res.status(400).json({
                success: false,
                error: 'QR code invalide ou expiré'
            });
        }

        const qrCodeId = qrResult.rows[ 0 ].id;

        // Vérifier si l'agent a déjà pointé aujourd'hui (max 2 fois)
        const todayCheckins = await client.query(
            `SELECT COUNT(*) as count FROM check_ins 
       WHERE user_id = $1 AND DATE(check_in_time) = $2`,
            [ userId, today ]
        );

        const checkinCount = parseInt(todayCheckins.rows[ 0 ].count);

        if (checkinCount >= 2) {
            await client.end();
            return res.status(400).json({
                success: false,
                error: 'Pointages quotidiens maximum atteints (2)'
            });
        }

        // Créer le pointage
        const result = await client.query(
            `INSERT INTO check_ins 
       (user_id, qr_code_id, location, face_match_confidence, photo_url, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id, check_in_time`,
            [ userId, qrCodeId, location, faceConfidence, photoUrl ]
        );

        await client.end();

        res.json({
            success: true,
            message: 'Pointage enregistré avec succès',
            data: {
                id: result.rows[ 0 ].id,
                checkInTime: result.rows[ 0 ].check_in_time,
                checkinNumber: checkinCount + 1
            }
        });

    } catch (error) {
        console.error('Erreur pointage:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'enregistrement du pointage'
        });
    }
};

// Récupérer l'historique des pointages
const getCheckInHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, limit = 50 } = req.query;

        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        let query = `
      SELECT 
        c.id,
        c.check_in_time,
        c.location,
        c.face_match_confidence,
        c.status,
        c.photo_url,
        q.date as qr_date
      FROM check_ins c
      JOIN qr_codes q ON c.qr_code_id = q.id
      WHERE c.user_id = $1
    `;

        const params = [ userId ];
        let paramCount = 1;

        if (startDate) {
            paramCount++;
            query += ` AND c.check_in_time >= $${ paramCount }`;
            params.push(startDate);
        }

        if (endDate) {
            paramCount++;
            query += ` AND c.check_in_time <= $${ paramCount }`;
            params.push(endDate);
        }

        query += ` ORDER BY c.check_in_time DESC LIMIT $${ paramCount + 1 }`;
        params.push(parseInt(limit));

        const result = await client.query(query, params);

        await client.end();

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Erreur historique:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de l\'historique'
        });
    }
};

// Récupérer les statistiques
const getCheckInStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        // Statistiques du mois
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
            .toISOString().split('T')[ 0 ];

        const stats = await client.query(
            `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        TO_CHAR(MIN(check_in_time), 'YYYY-MM-DD') as first_checkin,
        TO_CHAR(MAX(check_in_time), 'YYYY-MM-DD') as last_checkin
       FROM check_ins 
       WHERE user_id = $1 AND check_in_time >= $2`,
            [ userId, firstDay ]
        );

        // Pointages d'aujourd'hui
        const todayCheckins = await client.query(
            `SELECT * FROM check_ins 
       WHERE user_id = $1 AND DATE(check_in_time) = $2
       ORDER BY check_in_time DESC`,
            [ userId, today.toISOString().split('T')[ 0 ] ]
        );

        await client.end();

        res.json({
            success: true,
            data: {
                monthly: stats.rows[ 0 ],
                today: todayCheckins.rows
            }
        });

    } catch (error) {
        console.error('Erreur statistiques:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des statistiques'
        });
    }
};

// ADMIN: Valider/rejeter un pointage
const updateCheckInStatus = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { checkInId, status } = req.body;

        if (![ 'approved', 'rejected' ].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Statut invalide'
            });
        }

        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        const result = await client.query(
            `UPDATE check_ins 
       SET status = $1, validated_by_id = $2, validated_at = NOW()
       WHERE id = $3
       RETURNING id, user_id, check_in_time`,
            [ status, adminId, checkInId ]
        );

        if (result.rows.length === 0) {
            await client.end();
            return res.status(404).json({
                success: false,
                error: 'Pointage non trouvé'
            });
        }

        await client.end();

        res.json({
            success: true,
            message: `Pointage ${ status === 'approved' ? 'approuvé' : 'rejeté' }`,
            data: result.rows[ 0 ]
        });

    } catch (error) {
        console.error('Erreur validation:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour du pointage'
        });
    }
};

// ADMIN: Récupérer tous les pointages
const getAllCheckIns = async (req, res) => {
    try {
        const { startDate, endDate, status, userId, limit = 100 } = req.query;

        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        let query = `
      SELECT 
        c.id,
        c.check_in_time,
        c.location,
        c.face_match_confidence,
        c.status,
        c.photo_url,
        u.employee_id,
        u.full_name,
        u.user_role,
        q.date as qr_date,
        v.full_name as validated_by_name
      FROM check_ins c
      JOIN users u ON c.user_id = u.id
      JOIN qr_codes q ON c.qr_code_id = q.id
      LEFT JOIN users v ON c.validated_by_id = v.id
      WHERE 1=1
    `;

        const params = [];
        let paramCount = 0;

        if (startDate) {
            paramCount++;
            query += ` AND c.check_in_time >= $${ paramCount }`;
            params.push(startDate);
        }

        if (endDate) {
            paramCount++;
            query += ` AND c.check_in_time <= $${ paramCount }`;
            params.push(endDate);
        }

        if (status) {
            paramCount++;
            query += ` AND c.status = $${ paramCount }`;
            params.push(status);
        }

        if (userId) {
            paramCount++;
            query += ` AND c.user_id = $${ paramCount }`;
            params.push(userId);
        }

        query += ` ORDER BY c.check_in_time DESC LIMIT $${ paramCount + 1 }`;
        params.push(parseInt(limit));

        const result = await client.query(query, params);

        await client.end();

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Erreur récupération pointages:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des pointages'
        });
    }
};

// ADMIN: Récupérer l'historique détaillé avec pagination
const getDetailedHistory = async (req, res) => {
    try {
        const { startDate, endDate, agentId, page = 1, limit = 50 } = req.query;

        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        // Calcul de l'offset pour la pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = `
      SELECT 
        c.id,
        c.check_in_time,
        c.location,
        c.face_match_confidence,
        c.status,
        c.photo_url,
        u.id as user_id,
        u.employee_id,
        u.full_name,
        u.email,
        u.user_role,
        q.date as qr_date,
        q.token as qr_token,
        v.full_name as validated_by_name
      FROM check_ins c
      JOIN users u ON c.user_id = u.id
      JOIN qr_codes q ON c.qr_code_id = q.id
      LEFT JOIN users v ON c.validated_by_id = v.id
      WHERE 1=1
    `;

        const params = [];
        let paramCount = 0;

        if (startDate) {
            paramCount++;
            query += ` AND DATE(c.check_in_time) >= $${ paramCount }`;
            params.push(startDate);
        }

        if (endDate) {
            paramCount++;
            query += ` AND DATE(c.check_in_time) <= $${ paramCount }`;
            params.push(endDate);
        }

        if (agentId) {
            paramCount++;
            query += ` AND c.user_id = $${ paramCount }`;
            params.push(agentId);
        }

        // Requête pour le total
        const countQuery = query.replace(
            /SELECT[\s\S]*?FROM/,
            'SELECT COUNT(*) as total FROM'
        );

        const countResult = await client.query(countQuery, params);
        const total = parseInt(countResult.rows[ 0 ].total);
        const totalPages = Math.ceil(total / parseInt(limit));

        // Ajout de la pagination et du tri
        query += ` ORDER BY c.check_in_time DESC LIMIT $${ paramCount + 1 } OFFSET $${ paramCount + 2 }`;
        params.push(parseInt(limit));
        params.push(offset);

        const result = await client.query(query, params);

        await client.end();

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                totalPages: totalPages,
                count: result.rows.length
            }
        });

    } catch (error) {
        console.error('Erreur récupération historique détaillé:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de l\'historique détaillé'
        });
    }
};

module.exports = {
    createCheckIn,
    getCheckInHistory,
    getCheckInStats,
    updateCheckInStatus,
    getAllCheckIns,
    getDetailedHistory
};