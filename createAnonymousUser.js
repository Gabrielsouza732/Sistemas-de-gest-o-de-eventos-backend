const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createAnonymousUser() {
  try {
    const anonymousUser = await prisma.user.upsert({
      where: { id: 'anonymous_user' },
      update: {},
      create: {
        id: 'anonymous_user',
        name: 'Usuário Anônimo',
        email: 'anonymous@example.com',
        role: 'guest',
      },
    });
    console.log('Usuário anônimo criado ou atualizado:', anonymousUser);
  } catch (error) {
    console.error('Erro ao criar ou atualizar usuário anônimo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAnonymousUser();
