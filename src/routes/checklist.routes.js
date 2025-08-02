const express = require("express");
const router = express.Router();
const ChecklistController = require("../controllers/checklist.controller");

// ========== ITENS DE CHECKLIST ==========

// Buscar itens do checklist por evento
router.get("/event/:eventId", ChecklistController.getChecklistByEvent);

// Criar novo item do checklist
router.post("/", ChecklistController.createChecklistItem);

// Atualizar item do checklist
router.put("/:id", ChecklistController.updateChecklistItem);

// Deletar item do checklist
router.delete("/:id", ChecklistController.deleteChecklistItem);

// ========== TEMPLATES DE CHECKLIST ==========

// Buscar todos os templates
router.get("/templates", ChecklistController.getAllTemplates);

// Buscar template por tipo de evento
router.get("/templates/type/:eventType", ChecklistController.getTemplateByEventType);

// Criar novo template
router.post("/templates", ChecklistController.createTemplate);

// Atualizar template
router.put("/templates/:id", ChecklistController.updateTemplate);

// Deletar template
router.delete("/templates/:id", ChecklistController.deleteTemplate);

// Aplicar template a um evento
router.post("/templates/apply", ChecklistController.applyTemplate);

module.exports = router;
