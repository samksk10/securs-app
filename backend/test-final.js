const { Client } = require('pg');

async function test() {
    console.log('🧪 Test final de connexion...');

    const client = new Client({
        user: 'postgres',
        password: 'admin',
        host: 'localhost',
        port: 5432,
        database: 'securis_db'
    });

    try {
        await client.connect();
        console.log('✅ Connexion PostgreSQL réussie !');

        // Vérifier la version
        const version = await client.query('SELECT version()');
        console.log('📊 PostgreSQL:', version.rows[ 0 ].version);

        // Vérifier les tables
        const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        console.log('📋 Tables existantes:', tables.rows.map(t => t.table_name).join(', ') || 'Aucune');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.log('\n🔍 Vérifie que:');
        console.log('1. PostgreSQL est démarré');
        console.log('2. Le mot de passe est "admin"');
        console.log('3. La base "securis_db" existe');
    } finally {
        await client.end();
    }
}

test();