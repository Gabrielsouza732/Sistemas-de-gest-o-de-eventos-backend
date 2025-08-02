const express = require("express");
const router = express.Router();
const NotificationService = require("../services/notification.service");

// Rotas de teste para o sistema de notificação
router.get("/test-system", async (req, res) => {
  try {
    const result = await NotificationService.testNotificationSystem();
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao testar sistema de notificação:", error);
    res.status(500).json({ error: "Erro ao testar sistema de notificação." });
  }
});

// Rota para verificar prazos manualmente (para debug/teste)
router.post("/check-deadlines", async (req, res) => {
  try {
    await NotificationService.checkAndSendDeadlineReminders();
    res.status(200).json({ message: "Verificação de prazos iniciada." });
  } catch (error) {
    console.error("Erro ao iniciar verificação de prazos:", error);
    res.status(500).json({ error: "Erro ao iniciar verificação de prazos." });
  }
});

module.exports = router;
