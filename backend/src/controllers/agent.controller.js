const { Client } = require('pg');

// Récupérer les statistiques du tableau de bord agent
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        const today = new Date().toISOString().split('T')[ 0 ];

        // Nombre de pointages effectués aujourd'hui
        const completedRoundsResult = await client.query(
            `SELECT COUNT(*) as count FROM check_ins
             WHERE user_id = $1 AND DATE(check_in_time) = $2`,
            [ userId, today ]
        );

        const completedRounds = parseInt(completedRoundsResult.rows[ 0 ].count);
        const totalRounds = 2; // Maximum 2 pointages par jour

        // Statut de l'utilisateur
        const userResult = await client.query(
            `SELECT user_role, is_active FROM users WHERE id = $1`,
            [ userId ]
        );

        let status = 'Hors service';
        if (userResult.rows.length > 0) {
            const user = userResult.rows[ 0 ];
            if (user.is_active) {
                status = user.user_role === 'admin' ? 'Administrateur' : 'En service';
            }
        }

        // Nombre d'incidents signalés
        const incidentsResult = await client.query(
            `SELECT COUNT(*) as count FROM incidents WHERE user_id = $1`,
            [ userId ]
        );

        const incidents = parseInt(incidentsResult.rows[ 0 ].count);

        await client.end();

        res.json({
            success: true,
            data: {
                completedRounds,
                totalRounds,
                status,
                incidents
            }
        });

    } catch (error) {
        console.error('Erreur récupération stats dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des statistiques'
        });
    }
};

module.exports = {
    getDashboardStats
};