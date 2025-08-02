const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ========== USUÁRIOS ==========

const getAllUsers = async () => {
  return await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          responsibleChecklistItems: true,
          authoredComments: true
        }
      }
    }
  });
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      responsibleChecklistItems: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
              status: true
            }
          }
        }
      },
      authoredComments: {
        include: {
          event: {
            select: {
              id: true,
              title: true
            }
          }
        }
      },
      _count: {
        select: {
          responsibleChecklistItems: true,
          authoredComments: true
        }
      }
    }
  });
};

const getUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email }
  });
};

const createUser = async (userData) => {
  return await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      role: userData.role || "user"
    }
  });
};

const updateUser = async (id, updateData) => {
  return await prisma.user.update({
    where: { id },
    data: updateData
  });
};

const deleteUser = async (id) => {
  // Primeiro, atualizar registros relacionados para não quebrar referências
  await prisma.checklistItem.updateMany({
    where: { responsibleId: id },
    data: { responsibleId: null }
  });
  
  await prisma.comment.updateMany({
    where: { authorId: id },
    data: { authorId: null }
  });
  
  // Depois deletar o usuário
  return await prisma.user.delete({
    where: { id }
  });
};

const searchUsers = async (query) => {
  return await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } }
      ]
    },
    orderBy: { name: "asc" },
    take: 10 // Limitar resultados
  });
};

// ========== FUNÇÕES AUXILIARES ==========

const createDefaultUsers = async () => {
  try {
    const existingUsers = await prisma.user.count();
    
    if (existingUsers === 0) {
      console.log("🔄 Criando usuários padrão...");
      
      const defaultUsers = [
        {
          name: "João Santos",
          email: "joao.santos@empresa.com",
          role: "user"
        },
        {
          name: "Maria Silva",
          email: "maria.silva@empresa.com",
          role: "user"
        },
        {
          name: "Pedro Costa",
          email: "pedro.costa@empresa.com",
          role: "user"
        },
        {
          name: "Ana Oliveira",
          email: "ana.oliveira@empresa.com",
          role: "user"
        },
        {
          name: "Carlos Ferreira",
          email: "carlos.ferreira@empresa.com",
          role: "admin"
        }
      ];
      
      for (const userData of defaultUsers) {
        await prisma.user.create({ data: userData });
      }
      
      console.log(`✅ ${defaultUsers.length} usuários padrão criados`);
    } else {
      console.log(`ℹ️ ${existingUsers} usuários já existem no sistema`);
    }
  } catch (error) {
    console.error("❌ Erro ao criar usuários padrão:", error);
  }
};

const getUsersForMemberSelection = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true
    },
    orderBy: { name: "asc" }
  });
};

const getUserStats = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          responsibleChecklistItems: true,
          authoredComments: true
        }
      }
    }
  });
  
  if (!user) return null;
  
  // Estatísticas adicionais
  const completedTasks = await prisma.checklistItem.count({
    where: {
      responsibleId: userId,
      completed: true
    }
  });
  
  const pendingTasks = await prisma.checklistItem.count({
    where: {
      responsibleId: userId,
      completed: false
    }
  });
  
  return {
    ...user,
    stats: {
      totalTasks: user._count.responsibleChecklistItems,
      completedTasks,
      pendingTasks,
      totalComments: user._count.authoredComments,
      completionRate: user._count.responsibleChecklistItems > 0 
        ? Math.round((completedTasks / user._count.responsibleChecklistItems) * 100)
        : 0
    }
  };
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  createDefaultUsers,
  getUsersForMemberSelection,
  getUserStats,
};
