const ChecklistService = require("../services/checklist.service");
const NotificationService = require("../services/notification.service");

// ========== ITENS DE CHECKLIST ==========

const getChecklistByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const checklist = await ChecklistService.getChecklistByEvent(eventId);
    res.status(200).json(checklist);
  } catch (error) {
    console.error("Erro ao buscar checklist:", error);
    res.status(500).json({ error: "Erro ao buscar checklist." });
  }
};

const createChecklistItem = async (req, res) => {
  try {
    const newItem = await ChecklistService.createChecklistItem(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Erro ao criar item do checklist:", error);
    res.status(500).json({ error: "Erro ao criar item do checklist." });
  }
};

const updateChecklistItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Buscar item atual para comparar mudanças
    const currentItem = await ChecklistService.getChecklistItemById(id);
    if (!currentItem) {
      return res.status(404).json({ error: "Item de checklist não encontrado." });
    }

    // Atualizar o item
    const updatedItem = await ChecklistService.updateChecklistItem(id, updateData);

    // Verificar se um responsável foi atribuído
    const responsibleChanged = !currentItem.responsibleId && updateData.responsibleId;
    const responsibleNameChanged = !currentItem.responsible && updateData.responsible;

    if (responsibleChanged || responsibleNameChanged) {
      console.log("📧 Enviando notificação de atribuição de responsável...");
      await NotificationService.sendTaskAssignmentNotification(id);
    }

    // Verificar se a tarefa foi marcada como concluída
    const taskCompleted = !currentItem.completed && updateData.completed === true;

    if (taskCompleted) {
      console.log("✅ Enviando notificação de conclusão de tarefa...");
      await NotificationService.sendTaskCompletionNotification(id);
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Erro ao atualizar item do checklist:", error);
    res.status(500).json({ error: "Erro ao atualizar item do checklist." });
  }
};

const deleteChecklistItem = async (req, res) => {
  try {
    const { id } = req.params;
    await ChecklistService.deleteChecklistItem(id);
    res.status(200).json({ message: "Item do checklist deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar item do checklist:", error);
    res.status(500).json({ error: "Erro ao deletar item do checklist." });
  }
};

// ========== TEMPLATES DE CHECKLIST ==========

const getAllTemplates = async (req, res) => {
  try {
    const templates = await ChecklistService.getAllTemplates();
    res.status(200).json(templates);
  } catch (error) {
    console.error("Erro ao buscar templates:", error);
    res.status(500).json({ error: "Erro ao buscar templates." });
  }
};

const getTemplateByEventType = async (req, res) => {
  try {
    const { eventType } = req.params;
    const template = await ChecklistService.getTemplateByEventType(eventType);
    if (!template) {
      return res.status(404).json({ error: "Template não encontrado." });
    }
    res.status(200).json(template);
  } catch (error) {
    console.error("Erro ao buscar template por tipo de evento:", error);
    res.status(500).json({ error: "Erro ao buscar template por tipo de evento." });
  }
};

const createTemplate = async (req, res) => {
  try {
    const newTemplate = await ChecklistService.createTemplate(req.body);
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error("Erro ao criar template:", error);
    res.status(500).json({ error: "Erro ao criar template." });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTemplate = await ChecklistService.updateTemplate(id, req.body);
    res.status(200).json(updatedTemplate);
  } catch (error) {
    console.error("Erro ao atualizar template:", error);
    res.status(500).json({ error: "Erro ao atualizar template." });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await ChecklistService.deleteTemplate(id);
    res.status(200).json({ message: "Template deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar template:", error);
    res.status(500).json({ error: "Erro ao deletar template." });
  }
};

const applyTemplate = async (req, res) => {
  try {
    const { eventId, eventType, eventStartDate } = req.body;
    if (!eventId || !eventType || !eventStartDate) {
      return res
        .status(400)
        .json({ error: "eventId, eventType e eventStartDate são obrigatórios." });
    }
    const createdItems = await ChecklistService.applyTemplateToEvent(
      eventId,
      eventType,
      new Date(eventStartDate)
    );
    res.status(201).json(createdItems);
  } catch (error) {
    console.error("Erro ao aplicar template ao evento:", error);
    res.status(500).json({ error: "Erro ao aplicar template ao evento." });
  }
};

module.exports = {
  getChecklistByEvent,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  getAllTemplates,
  getTemplateByEventType,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  applyTemplate,
};
