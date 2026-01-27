const { Client } = require('pg');

// Récupérer la liste des agents
const getAgents = async (req, res) => {
    try {
        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        const result = await client.query(
            'SELECT id, employee_id, full_name, email, user_role FROM users WHERE user_role = $1 AND is_active = true ORDER BY full_name ASC',
            [ 'agent' ]
        );

        await client.end();

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Erreur récupération agents:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des agents'
        });
    }
};

module.exports = {
    getAgents
};
