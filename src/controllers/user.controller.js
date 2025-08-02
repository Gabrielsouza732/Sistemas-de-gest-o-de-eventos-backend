const UserService = require("../services/user.service");

// ========== USUÁRIOS ==========

const getAllUsers = async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro ao buscar usuário." });
  }
};

const createUser = async (req, res) => {
  try {
    const userData = req.body;
    
    // Validações básicas
    if (!userData.name || !userData.email) {
      return res.status(400).json({ error: "Nome e email são obrigatórios." });
    }
    
    // Verificar se email já existe
    const existingUser = await UserService.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(409).json({ error: "Email já está em uso." });
    }
    
    const newUser = await UserService.createUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Verificar se usuário existe
    const existingUser = await UserService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    
    // Se está atualizando email, verificar se não está em uso
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailInUse = await UserService.getUserByEmail(updateData.email);
      if (emailInUse) {
        return res.status(409).json({ error: "Email já está em uso." });
      }
    }
    
    const updatedUser = await UserService.updateUser(id, updateData);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro ao atualizar usuário." });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se usuário existe
    const existingUser = await UserService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    
    await UserService.deleteUser(id);
    res.status(200).json({ message: "Usuário deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ error: "Erro ao deletar usuário." });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: "Query deve ter pelo menos 2 caracteres." });
    }
    
    const users = await UserService.searchUsers(query);
    res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
};

const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email é obrigatório." });
    }
    
    const user = await UserService.getUserByEmail(email);
    res.status(200).json({ exists: !!user, user: user || null });
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    res.status(500).json({ error: "Erro ao verificar email." });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  checkEmailExists,
};
