const { PrismaClient } = require('@prisma/client');

async function testConnection() {
    const prisma = new PrismaClient();

    try {
        console.log('🔌 Test de connexion à PostgreSQL...');

        // Test simple
        const result = await prisma.$queryRaw`SELECT version()`;
        console.log('✅ Connexion réussie !');
        console.log('PostgreSQL version:', result[ 0 ].version);

        // Lister les tables (après migration)
        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
        console.log('Tables:', tables);

    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();