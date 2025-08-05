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
  return await prisma.comment.create({
    data: {
      text: commentData.text,
      eventId: commentData.eventId,
      author: commentData.author || 'Usuário Anônimo',
      authorId: commentData.authorId || null,
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
