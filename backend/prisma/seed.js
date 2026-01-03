// CHARGER LES VARIABLES D'ENVIRONNEMENT EN PREMIER
require('dotenv').config({ path: '.env' });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🌱 Début du seeding...');
    console.log('URL de la base:', process.env.DATABASE_URL);

    const prisma = new PrismaClient();

    try {
        // Créer l'admin principal
        const adminPassword = await bcrypt.hash('admin', 10);

        const admin = await prisma.user.upsert({
            where: { email: 'admin@securis.com' },
            update: {},
            create: {
                employeeId: 'ADMIN001',
                fullName: 'Administrateur Principal',
                email: 'admin@securis.com',
                passwordHash: adminPassword,
                role: 'ADMIN',
                isActive: true
            }
        });

        // S'assurer que la colonne user_role est bien définie
        await prisma.$executeRaw`UPDATE "users" SET "user_role" = ${ 'ADMIN' } WHERE id = ${ admin.id }`;

        console.log('✅ Admin créé:', admin.email);

        // Créer les agents
        const agents = [
            {
                employeeId: 'AGENT001',
                fullName: 'Jean Kabasele',
                email: 'jean@securis.com',
                phone: '+243810000001',
                password: 'agent001'
            },
            {
                employeeId: 'AGENT002',
                fullName: 'Marie Lukunku',
                email: 'marie@securis.com',
                phone: '+243810000002',
                password: 'agent002'
            },
            {
                employeeId: 'AGENT003',
                fullName: 'Paul Mbuta',
                email: 'paul@securis.com',
                phone: '+243810000003',
                password: 'agent003'
            }
        ];

        for (const agentData of agents) {
            const passwordHash = await bcrypt.hash(agentData.password, 10);

            const agent = await prisma.user.upsert({
                where: { email: agentData.email },
                update: {},
                create: {
                    employeeId: agentData.employeeId,
                    fullName: agentData.fullName,
                    email: agentData.email,
                    phone: agentData.phone,
                    passwordHash: passwordHash,
                    role: 'AGENT',
                    isActive: true
                }
            });

            // S'assurer que la colonne user_role est bien définie pour cet agent
            await prisma.$executeRaw`UPDATE "users" SET "user_role" = ${ 'AGENT' } WHERE id = ${ agent.id }`;

            console.log(`✅ Agent créé: ${ agent.fullName }`);
        }

        console.log('\n🎉 Seeding terminé avec succès !');
        console.log('\n📋 Identifiants de test:');
        console.log('👤 Admin: ADMIN001 / admin');
        console.log('👥 Agent 1: AGENT001 / agent001');
        console.log('👥 Agent 2: AGENT002 / agent002');
        console.log('👥 Agent 3: AGENT003 / agent003');

    } catch (error) {
        console.error('❌ Erreur lors du seeding:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter seulement si appelé directement
if (require.main === module) {
    main().catch(e => {
        console.error(e);
        process.exit(1);
    });
}

module.exports = { main };