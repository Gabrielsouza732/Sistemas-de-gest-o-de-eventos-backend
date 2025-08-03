const { PrismaClient } = require("@prisma/client");
const moment = require("moment"); // Certifique-se que moment está instalado
const prisma = new PrismaClient();

// ========== ITENS DE CHECKLIST ==========

const getChecklistItemsByEvent = async (eventId) => {
  return await prisma.checklistItem.findMany({
    where: { eventId },
    orderBy: { dueDate: "asc" },
    include: {
      responsibleUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const getChecklistItemById = async (id) => {
  return await prisma.checklistItem.findUnique({
    where: { id },
    include: {
      responsibleUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          startDate: true,
        },
      },
    },
  });
};

const createChecklistItem = async (itemData) => {
  return await prisma.checklistItem.create({
    data: itemData,
  });
};

const updateChecklistItem = async (id, updateData) => {
  return await prisma.checklistItem.update({
    where: { id },
    data: updateData,
  });
};

const deleteChecklistItem = async (id) => {
  return await prisma.checklistItem.delete({
    where: { id },
  });
};

// ========== TEMPLATES DE CHECKLIST ==========

const getAllTemplates = async () => {
  return await prisma.checklistTemplate.findMany({
    include: { items: true },
  });
};

const getTemplateByEventType = async (eventType) => {
  return await prisma.checklistTemplate.findUnique({
    where: { eventType },
    include: { items: true },
  });
};

const createTemplate = async (templateData) => {
  return await prisma.checklistTemplate.create({
    data: {
      eventType: templateData.eventType,
      name: templateData.name,
      description: templateData.description,
      items: {
        create: templateData.items,
      },
    },
    include: { items: true },
  });
};

const updateTemplate = async (id, updateData) => {
  return await prisma.checklistTemplate.update({
    where: { id },
    data: {
      eventType: updateData.eventType,
      name: updateData.name,
      description: updateData.description,
      items: {
        // Isso substitui todos os itens existentes. Para atualização granular, seria mais complexo.
        deleteMany: {},
        create: updateData.items,
      },
    },
    include: { items: true },
  });
};

const deleteTemplate = async (id) => {
  return await prisma.checklistTemplate.delete({
    where: { id },
  });
};

const applyTemplateToEvent = async (
  eventId,
  eventType,
  eventStartDate
) => {
  const template = await getTemplateByEventType(eventType);

  if (!template) {
    console.log(
      `⚠️ Nenhum template encontrado para o tipo de evento: ${eventType}`
    );
    return [];
  }

  const checklistItemsToCreate = template.items.map((item) => {
    const dueDate = moment(eventStartDate)
      .add(item.daysOffset, "days")
      .toDate();
    return {
      text: item.text,
      dueDate: dueDate,
      eventId: eventId,
      completed: false,
    };
  });

  return await prisma.checklistItem.createMany({
    data: checklistItemsToCreate,
  });
};

const createDefaultTemplates = async () => {
  try {
    const defaultTemplates = [
      {
        eventType: "Conferência",
        name: "Checklist para Conferência",
        description: "Tarefas essenciais para organizar uma conferência.",
        items: [
          { text: "Definir palestrantes principais", daysOffset: -30 },
          { text: "Reservar local do evento", daysOffset: -45 },
          { text: "Criar material de divulgação", daysOffset: -25 },
          { text: "Abrir inscrições", daysOffset: -20 },
          { text: "Confirmar equipamentos audiovisuais", daysOffset: -7 },
          { text: "Preparar credenciais e materiais", daysOffset: -3 },
          { text: "Testar som e equipamentos", daysOffset: -1 },
        ],
      },
      {
        eventType: "Workshop",
        name: "Checklist para Workshop",
        description: "Tarefas para um workshop interativo.",
        items: [
          { text: "Definir tema e conteúdo", daysOffset: -15 },
          { text: "Preparar materiais didáticos", daysOffset: -10 },
          { text: "Configurar ambiente (online/físico)", daysOffset: -5 },
          { text: "Enviar lembretes aos participantes", daysOffset: -1 },
        ],
      },
      {
        eventType: "Reunião",
        name: "Checklist para Reunião",
        description: "Tarefas para uma reunião produtiva.",
        items: [
          { text: "Definir pauta", daysOffset: -2 },
          { text: "Convidar participantes", daysOffset: -2 },
          { text: "Preparar apresentações", daysOffset: -1 },
          { text: "Enviar ata da reunião", daysOffset: 1 },
        ],
      },
      {
        eventType: "Treinamento",
        name: "Checklist para Treinamento",
        description: "Tarefas para sessões de treinamento.",
        items: [
          { text: "Preparar conteúdo do treinamento", daysOffset: -20 },
          { text: "Agendar instrutores", daysOffset: -15 },
          { text: "Disponibilizar material de apoio", daysOffset: -5 },
          { text: "Coletar feedback", daysOffset: 1 },
        ],
      },
      {
        eventType: "Evento Social",
        name: "Checklist para Evento Social",
        description: "Tarefas para eventos de confraternização.",
        items: [
          { text: "Definir tema e lista de convidados", daysOffset: -30 },
          { text: "Reservar local e buffet", daysOffset: -20 },
          { text: "Enviar convites", daysOffset: -15 },
          { text: "Organizar atividades/entretenimento", daysOffset: -7 },
        ],
      },
    ];

    for (const template of defaultTemplates) {
      const existingTemplate = await prisma.checklistTemplate.findUnique({
        where: { eventType: template.eventType }, // <--- CORRIGIDO AQUI!
        include: { items: true }, // <--- MOVIDO PARA CÁ!
      });

      if (!existingTemplate) {
        await prisma.checklistTemplate.create({
          data: {
            eventType: template.eventType,
            name: template.name,
            description: template.description,
            items: {
              create: template.items,
            },
          },
        });
        console.log(`✅ Template '${template.name}' criado.`);
      } else {
        console.log(`ℹ️ Template '${template.name}' já existe.`);
      }
    }
  } catch (error) {
    console.error("❌ Erro ao criar templates padrão:", error);
  }
};

module.exports = {
  getChecklistItemsByEvent,
  getChecklistItemById,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  getAllTemplates,
  getTemplateByEventType,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  applyTemplateToEvent,
  createDefaultTemplates,
};
