import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Messages:");
    const messages = await prisma.message.findMany();
    console.log(JSON.stringify(messages, null, 2));

    console.log("\nUsers:");
    const users = await prisma.user.findMany({ select: { id: true, name: true, role: true } });
    console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
