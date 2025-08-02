const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");

// ========== USUÁRIOS ==========

// Buscar todos os usuários
router.get("/", UserController.getAllUsers);

// Buscar usuário por ID
router.get("/:id", UserController.getUserById);

// Criar novo usuário
router.post("/", UserController.createUser);

// Atualizar usuário
router.put("/:id", UserController.updateUser);

// Deletar usuário
router.delete("/:id", UserController.deleteUser);

// Buscar usuários por nome (para busca/autocomplete)
router.get("/search/:query", UserController.searchUsers);

// Verificar se email já existe
router.post("/check-email", UserController.checkEmailExists);

module.exports = router;
