import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Admin user
    const adminHash = await bcrypt.hash('admin123', 10);
    const adminId = randomUUID();
    await prisma.user.upsert({
        where: { email: 'admin@eai.local' },
        update: {},
        create: {
            id: adminId,
            email: 'admin@eai.local',
            passwordHash: adminHash,
            role: 'ADMIN',
        },
    });

    // Sample owner
    const ownerUserId = randomUUID();
    const ownerHash = await bcrypt.hash('owner123', 10);
    await prisma.user.upsert({
        where: { email: 'owner@eai.local' },
        update: {},
        create: {
            id: ownerUserId,
            email: 'owner@eai.local',
            passwordHash: ownerHash,
            role: 'OWNER',
        },
    });

    const ownerId = randomUUID();
    await prisma.owner.upsert({
        where: { userId: ownerUserId },
        update: {},
        create: {
            id: ownerId,
            userId: ownerUserId,
            name: 'Moussa Ouédraogo',
            email: 'owner@eai.local',
            phone: '+226 70 12 34 56',
            address: 'Ouagadougou, Burkina Faso',
        },
    });

    // Sample properties
    const prop1Id = randomUUID();
    const prop2Id = randomUUID();
    await prisma.property.createMany({
        data: [
            {
                id: prop1Id,
                ownerId,
                designation: 'Villa Résidentielle',
                addressStreet: 'Avenue de l\'Indépendance, 123',
                addressCity: 'Ouagadougou',
                addressZip: '01 BP 456',
                type: 'HOUSE',
                status: 'OCCUPIED',
            },
            {
                id: prop2Id,
                ownerId,
                designation: 'Appartement Centre-Ville',
                addressStreet: 'Rue du Marché, 45',
                addressCity: 'Bobo-Dioulasso',
                addressZip: '01 BP 789',
                type: 'APARTMENT',
                status: 'VACANT',
            },
        ],
    });

    // Sample tenant
    const tenantId = randomUUID();
    await prisma.tenant.create({
        data: {
            id: tenantId,
            ownerId,
            firstName: 'Aminata',
            lastName: 'Kaboré',
            idDocumentType: 'CNI',
            idDocumentNumber: 'BFA123456789',
            phone: '+226 71 98 76 54',
            email: 'aminata@email.bf',
            profession: 'Commerçante',
        },
    });

    // Sample contract (active)
    const contractId = randomUUID();
    await prisma.contract.create({
        data: {
            id: contractId,
            ownerId,
            propertyId: prop1Id,
            tenantId,
            monthlyRent: 150000,
            startDate: new Date('2026-01-01'),
            endDate: new Date('2027-01-01'),
            status: 'ACTIVE',
        },
    });

    // Sample invoice (current quarter, unpaid)
    await prisma.invoice.create({
        data: {
            id: randomUUID(),
            contractId,
            ownerId,
            periodLabel: 'Avril–Juin 2026',
            amount: 450000,
            dueDate: new Date('2026-04-15'),
            status: 'UNPAID',
        },
    });

    console.log('✅ Seed complete!');
    console.log('');
    console.log('📧 Login credentials:');
    console.log('   Admin:  admin@eai.local  / admin123');
    console.log('   Owner:  owner@eai.local / owner123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
