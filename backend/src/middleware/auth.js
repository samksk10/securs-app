const jwt = require('jsonwebtoken');
const { Client } = require('pg');

const authMiddleware = async (req, res, next) => {
    try {
        // Récupérer le token du header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Authentification requise' });
        }

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Trouver l'utilisateur
        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        const userResult = await client.query(
            'SELECT id, employee_id, full_name, email, user_role, is_active FROM users WHERE id = $1 AND is_active = true',
            [ decoded.userId ]
        );

        await client.end();

        const user = userResult.rows[ 0 ];

        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé' });
        }

        // Ajouter l'utilisateur à la requête
        req.user = {
            id: user.id,
            employeeId: user.employee_id,
            fullName: user.full_name,
            email: user.email,
            userRole: user.user_role,
            isActive: user.is_active
        };

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Token invalide' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user.userRole !== 'admin' && req.user.userRole !== 'sub_admin') {
        return res.status(403).json({ error: 'Accès administrateur requis' });
    }
    next();
};

const requireSuperAdmin = (req, res, next) => {
    if (req.user.userRole !== 'admin') {
        return res.status(403).json({ error: 'Accès administrateur principal requis' });
    }
    next();
};

module.exports = { authMiddleware, requireAdmin, requireSuperAdmin };