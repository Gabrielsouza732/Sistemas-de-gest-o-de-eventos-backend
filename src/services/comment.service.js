const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getCommentsByEvent = async (eventId) => {
  return await prisma.comment.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
    include: {
      authorUser: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};

const createComment = async (commentData) => {
  // Se authorId for fornecido, buscar o nome do usuário
  let authorName = commentData.author;
  
  if (commentData.authorId && !authorName) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: commentData.authorId },
        select: { name: true }
      });
      authorName = user?.name || 'Usuário Desconhecido';
    } catch (error) {
      authorName = 'Usuário Desconhecido';
    }
  }

  return await prisma.comment.create({
    data: {
      text: commentData.text,
      eventId: commentData.eventId,
      author: authorName || 'Usuário Anônimo', // <--- Garantir que sempre tenha um valor
      authorId: commentData.authorId || null,
    },
    include: {
      authorUser: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};


const updateComment = async (id, commentData) => {
  return await prisma.comment.update({
    where: { id },
    data: commentData,
    include: {
      authorUser: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};

const deleteComment = async (id) => {
  return await prisma.comment.delete({
    where: { id }
  });
};

module.exports = {
  getCommentsByEvent,
  createComment,
  updateComment,
  deleteComment,
};

