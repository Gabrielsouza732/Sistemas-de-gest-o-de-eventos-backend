const express = require("express");
const router = express.Router();
const CommentController = require("../controllers/comment.controller");

// ========== COMENTÁRIOS ==========

// Buscar comentários por evento
router.get("/event/:eventId", CommentController.getCommentsByEvent);

// Criar novo comentário
router.post("/", CommentController.createComment);

// Atualizar comentário
router.put("/:id", CommentController.updateComment);

// Deletar comentário
router.delete("/:id", CommentController.deleteComment);

module.exports = router;
