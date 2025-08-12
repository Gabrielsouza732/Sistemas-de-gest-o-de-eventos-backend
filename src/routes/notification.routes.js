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

// NOVA ROTA: enviar email ao atribuir responsável a um item do checklist
router.post("/assignment", async (req, res) => {
  try {
    const { checklistItemId } = req.body;
    if (!checklistItemId) {
      return res.status(400).json({ error: "checklistItemId é obrigatório." });
    }
    await NotificationService.sendTaskAssignmentNotification(checklistItemId);
    res.status(200).json({ message: "Notificação de atribuição disparada." });
  } catch (error) {
    console.error("Erro ao enviar notificação de atribuição:", error);
    res.status(500).json({ error: "Erro ao enviar notificação de atribuição." });
  }
});

module.exports = router;
