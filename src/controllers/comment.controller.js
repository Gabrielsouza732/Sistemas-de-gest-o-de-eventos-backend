const CommentService = require("../services/comment.service");

const getCommentsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const comments = await CommentService.getCommentsByEvent(eventId);
    res.status(200).json(comments);
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    res.status(500).json({ error: "Erro ao buscar comentários." });
  }
};

const createComment = async (req, res) => {
  try {
    const newComment = await CommentService.createComment(req.body);
    res.status(201).json(newComment);
  } catch (error) {
    console.error("Erro ao criar comentário:", error);
    res.status(500).json({ error: "Erro ao criar comentário." });
  }
};

const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedComment = await CommentService.updateComment(id, req.body);
    res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Erro ao atualizar comentário:", error);
    res.status(500).json({ error: "Erro ao atualizar comentário." });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    await CommentService.deleteComment(id);
    res.status(200).json({ message: "Comentário deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    res.status(500).json({ error: "Erro ao deletar comentário." });
  }
};

module.exports = {
  getCommentsByEvent,
  createComment,
  updateComment,
  deleteComment,
};
