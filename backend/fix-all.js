const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixAll() {
    console.log('🔧 Correction complète de la base de données...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();

        // 1. Supprimer la contrainte problématique si elle existe
        console.log('1. 🔍 Recherche de contraintes problématiques...');
        try {
            await client.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;');
            console.log('   ✅ Contrainte users_role_check supprimée');
        } catch (e) {
            console.log('   ℹ️  Pas de contrainte à supprimer');
        }

        // 2. Renommer la colonne role en user_role si elle existe encore
        console.log('2. 🔄 Renommage de la colonne role...');
        try {
            const hasRoleColumn = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
      `);

            if (hasRoleColumn.rows.length > 0) {
                await client.query('ALTER TABLE users RENAME COLUMN role TO user_role;');
                console.log('   ✅ Colonne role renommée en user_role');
            } else {
                console.log('   ℹ️  Colonne role déjà renommée');
            }
        } catch (e) {
            console.log('   ℹ️  Erreur lors du renommage:', e.message);
        }

        // 3. Vérifier la structure actuelle
        console.log('3. 📊 Vérification de la structure...');
        const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

        console.log('   Colonnes de la table users:');
        columns.rows.forEach(col => {
            console.log(`   - ${ col.column_name } (${ col.data_type })`);
        });

        // 4. Vider et réinsérer les données
        console.log('4. 🗑️  Nettoyage des données...');
        await client.query('DELETE FROM users;');

        // 5. Insérer les données correctes
        console.log('5. 👥 Insertion des utilisateurs...');

        // Admin
        const adminPassword = await bcrypt.hash('admin', 10);
        await client.query(`
      INSERT INTO users (employee_id, full_name, email, password_hash, user_role)
      VALUES ($1, $2, $3, $4, $5)
    `, [ 'ADMIN001', 'Administrateur Principal', 'admin@securis.com', adminPassword, 'admin' ]);
        console.log('   ✅ Admin créé: ADMIN001 / admin');

        // Agents
        const agents = [
            [ 'AGENT001', 'Jean Kabasele', 'jean@securis.com', '+243810000001', 'agent001' ],
            [ 'AGENT002', 'Marie Lukunku', 'marie@securis.com', '+243810000002', 'agent002' ],
            [ 'AGENT003', 'Paul Mbuta', 'paul@securis.com', '+243810000003', 'agent003' ]
        ];

        for (const [ employeeId, fullName, email, phone, password ] of agents) {
            const passwordHash = await bcrypt.hash(password, 10);
            await client.query(`
        INSERT INTO users (employee_id, full_name, email, phone, password_hash, user_role)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [ employeeId, fullName, email, phone, passwordHash, 'agent' ]);
            console.log(`   ✅ Agent créé: ${ employeeId } / ${ password }`);
        }

        // 6. Vérifier
        console.log('6. ✅ Vérification finale...');
        const count = await client.query('SELECT COUNT(*) as count FROM users');
        console.log(`   Total utilisateurs: ${ count.rows[ 0 ].count }`);

        const users = await client.query(`
      SELECT employee_id, full_name, user_role 
      FROM users 
      ORDER BY user_role, employee_id
    `);

        console.log('\n📋 Liste des utilisateurs:');
        users.rows.forEach(user => {
            console.log(`   ${ user.employee_id }: ${ user.full_name } (${ user.user_role })`);
        });

        console.log('\n🎉 Correction terminée avec succès !');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error('Détails:', error);
    } finally {
        await client.end();
        console.log('\n🔌 Connexion fermée');
    }
}

fixAll();