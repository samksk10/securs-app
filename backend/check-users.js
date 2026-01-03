const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();

        // Voir tous les utilisateurs
        const users = await client.query(`
      SELECT id, employee_id, full_name, email, role, is_active
      FROM users 
      ORDER BY role, employee_id
    `);

        console.log('👥 Utilisateurs dans la base:');
        console.log('='.repeat(60));

        users.rows.forEach((user, index) => {
            console.log(`${ index + 1 }. ${ user.employee_id } - ${ user.full_name }`);
            console.log(`   Email: ${ user.email }`);
            console.log(`   Rôle: ${ user.role }`);
            console.log(`   Actif: ${ user.is_active ? '✅' : '❌' }`);
            console.log('');
        });

        console.log(`Total: ${ users.rows.length } utilisateurs`);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await client.end();
    }
}

check();