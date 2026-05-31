import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.user.findMany({take:1}).then(console.log).catch(console.error).finally(()=>prisma.$disconnect());
