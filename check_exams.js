
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.examSession.count();
    console.log(`Total exams in database: ${count}`);
    const drafts = await prisma.examSession.count({ where: { status: 'DRAFT' } });
    console.log(`Draft exams: ${drafts}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
