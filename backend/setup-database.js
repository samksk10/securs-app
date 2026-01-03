const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
    console.log('🗄️  Configuration de la base de données...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        // Se connecter
        await client.connect();
        console.log('✅ Connecté à PostgreSQL');

        // Lire le fichier SQL
        const sql = fs.readFileSync(
            path.join(__dirname, 'create-tables.sql'),
            'utf8'
        );

        // Exécuter les commandes SQL
        console.log('📋 Création des tables...');
        await client.query(sql);
        console.log('✅ Tables créées avec succès !');

        // Vérifier les tables créées
        const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

        console.log('\n📊 Tables disponibles:');
        tables.rows.forEach(table => {
            console.log(`   - ${ table.table_name }`);
        });

        // Vérifier les colonnes de la table users
        const usersColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

        console.log('\n👤 Structure de la table users:');
        usersColumns.rows.forEach(col => {
            console.log(`   - ${ col.column_name } (${ col.data_type })`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error('Détails:', error);
    } finally {
        await client.end();
        console.log('\n🔌 Connexion fermée');
    }
}

setupDatabase();