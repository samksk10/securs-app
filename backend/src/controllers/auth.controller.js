const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');

// Login pour agents et admin
const login = async (req, res) => {
    try {
        const { employeeId, password } = req.body;

        // Validation basique
        if (!employeeId || !password) {
            return res.status(400).json({
                error: 'ID employé et mot de passe requis'
            });
        }

        // Connexion directe à PostgreSQL
        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        // Trouver l'utilisateur
        const userResult = await client.query(
            'SELECT * FROM users WHERE employee_id = $1 AND is_active = true',
            [ employeeId.toUpperCase() ]
        );

        await client.end();

        const user = userResult.rows[ 0 ];

        if (!user) {
            return res.status(401).json({
                error: 'Identifiants incorrects'
            });
        }

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Identifiants incorrects'
            });
        }

        // Créer le token JWT
        const token = jwt.sign(
            {
                userId: user.id,
                employeeId: user.employee_id,
                role: user.user_role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Retourner les infos utilisateur (sans mot de passe)
        const userResponse = {
            id: user.id,
            employeeId: user.employee_id,
            fullName: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.user_role,
            hasFaceRegistered: !!user.face_encoding
        };

        res.json({
            success: true,
            token,
            user: userResponse,
            message: 'Connexion réussie'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Erreur lors de la connexion'
        });
    }
};

// Récupérer le profil de l'utilisateur connecté
const getProfile = async (req, res) => {
    try {
        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        const userResult = await client.query(
            'SELECT id, employee_id, full_name, email, phone, user_role, photo_url, is_active, created_at FROM users WHERE id = $1',
            [ req.user.id ]
        );

        await client.end();

        const user = userResult.rows[ 0 ];

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Formater la réponse
        const userResponse = {
            id: user.id,
            employeeId: user.employee_id,
            fullName: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.user_role,
            photoUrl: user.photo_url,
            isActive: user.is_active,
            createdAt: user.created_at,
            hasFaceRegistered: false // À implémenter plus tard
        };

        res.json(userResponse);

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
    }
};

// Changer le mot de passe
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Mot de passe actuel et nouveau mot de passe requis'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'Le nouveau mot de passe doit faire au moins 6 caractères'
            });
        }

        const client = new Client({
            connectionString: process.env.DATABASE_URL
        });

        await client.connect();

        // Récupérer l'utilisateur avec le mot de passe
        const userResult = await client.query(
            'SELECT * FROM users WHERE id = $1',
            [ req.user.id ]
        );

        const user = userResult.rows[ 0 ];

        // Vérifier le mot de passe actuel
        const isValid = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isValid) {
            await client.end();
            return res.status(401).json({
                error: 'Mot de passe actuel incorrect'
            });
        }

        // Hasher le nouveau mot de passe
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Mettre à jour
        await client.query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [ newPasswordHash, req.user.id ]
        );

        await client.end();

        res.json({
            success: true,
            message: 'Mot de passe changé avec succès'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
    }
};

module.exports = {
    login,
    getProfile,
    changePassword
};