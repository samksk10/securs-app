const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Récupérer la liste des agents
const getAgents = async (req, res) => {
    try {
        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        const result = await client.query(
            'SELECT id, employee_id, full_name, email, phone, user_role, created_at FROM users WHERE user_role = $1 AND is_active = true ORDER BY full_name ASC',
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

// Créer un nouvel agent
const createAgent = async (req, res) => {
    try {
        const { employeeId, fullName, email, phone, password } = req.body;

        console.log('Données reçues:', { employeeId, fullName, email, phone, password: password ? '***' : null });

        // Validation basique
        if (!employeeId || !fullName || !password) {
            console.log('Validation échouée:', { employeeId: !!employeeId, fullName: !!fullName, password: !!password });
            return res.status(400).json({
                success: false,
                error: 'employeeId, fullName et password sont requis'
            });
        }

        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        // Vérifier si employeeId existe déjà
        const existing = await client.query(
            'SELECT id FROM users WHERE employee_id = $1',
            [ employeeId ]
        );

        if (existing.rows.length > 0) {
            await client.end();
            return res.status(400).json({
                success: false,
                error: 'Un utilisateur avec cet ID employé existe déjà'
            });
        }

        // Hasher le mot de passe
        const passwordHash = await bcrypt.hash(password, 10);

        const result = await client.query(
            'INSERT INTO users (employee_id, full_name, email, phone, password_hash, user_role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, employee_id, full_name, email, phone, user_role, created_at',
            [ employeeId.toUpperCase(), fullName, email, phone, passwordHash, 'agent' ]
        );

        await client.end();

        res.status(201).json({
            success: true,
            data: result.rows[ 0 ],
            message: 'Agent créé avec succès'
        });

    } catch (error) {
        console.error('Erreur création agent:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création de l\'agent'
        });
    }
};

// Mettre à jour un agent
const updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, phone } = req.body;

        console.log('Update agent:', { id, fullName, email, phone });

        if (!fullName) {
            return res.status(400).json({
                success: false,
                error: 'fullName est requis'
            });
        }

        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        const result = await client.query(
            'UPDATE users SET full_name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING id, employee_id, full_name, email, phone, user_role, created_at',
            [ fullName, email, phone, parseInt(id) ]
        );

        await client.end();

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Agent non trouvé'
            });
        }

        res.json({
            success: true,
            data: result.rows[ 0 ],
            message: 'Agent mis à jour avec succès'
        });

    } catch (error) {
        console.error('Erreur mise à jour agent:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour de l\'agent'
        });
    }
};

// Supprimer un agent (soft delete)
const deleteAgent = async (req, res) => {
    try {
        const { id } = req.params;

        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        await client.query(
            'UPDATE users SET is_active = false WHERE id = $1',
            [ parseInt(id) ]
        );

        await client.end();

        res.json({
            success: true,
            message: 'Agent supprimé avec succès'
        });

    } catch (error) {
        console.error('Erreur suppression agent:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression de l\'agent'
        });
    }
};

module.exports = {
    getAgents,
    createAgent,
    updateAgent,
    deleteAgent
};
