const { PrismaClient } = require("@prisma/client");
const moment = require("moment");
const prisma = new PrismaClient();

// ========== ITENS DE CHECKLIST ==========

const getChecklistByEvent = async (eventId) => {
  return await prisma.checklistItem.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
  });
};

const getChecklistItemById = async (id) => {
  return await prisma.checklistItem.findUnique({
    where: { id },
    include: {
      event: true,
      responsibleUser: true,
    },
  });
};

const createChecklistItem = async (itemData) => {
  return await prisma.checklistItem.create({
    data: itemData,
  });
};

const updateChecklistItem = async (id, itemData) => {
  return await prisma.checklistItem.update({
    where: { id },
    data: itemData,
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
  const { items, ...data } = templateData;
  return await prisma.checklistTemplate.create({
    data: {
      ...data,
      items: {
        create: items,
      },
    },
    include: { items: true },
  });
};

const updateTemplate = async (id, templateData) => {
  const { items, ...data } = templateData;
  return await prisma.checklistTemplate.update({
    where: { id },
    data: {
      ...data,
      items: {
        deleteMany: {},
        create: items,
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

const applyTemplateToEvent = async (eventId, eventType, eventStartDate) => {
  const template = await getTemplateByEventType(eventType);

  if (!template) {
    console.log(`⚠️ Nenhum template encontrado para o tipo de evento: ${eventType}`);
    return [];
  }

  const checklistItemsData = template.items.map((item) => {
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

  const createdItems = [];
  for (const itemData of checklistItemsData) {
    createdItems.push(await createChecklistItem(itemData));
  }
  console.log(`✅ ${createdItems.length} itens de checklist criados a partir do template "${template.name}" para o evento ${eventId}`);
  return createdItems;
};

const createDefaultTemplates = async () => {
  try {
    const existingTemplates = await prisma.checklistTemplate.count();

    if (existingTemplates === 0) {
      console.log("🔄 Criando templates padrão de checklist...");

      const templates = [
        {
          eventType: "Conferência",
          name: "Checklist de Conferência",
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
          name: "Checklist de Workshop",
          description: "Tarefas para organizar um workshop interativo.",
          items: [
            { text: "Definir tema e conteúdo", daysOffset: -20 },
            { text: "Preparar material didático", daysOffset: -10 },
            { text: "Configurar ambiente (online/físico)", daysOffset: -5 },
            { text: "Enviar lembretes aos participantes", daysOffset: -2 },
          ],
        },
        {
          eventType: "Reunião",
          name: "Checklist de Reunião",
          description: "Tarefas para uma reunião produtiva.",
          items: [
            { text: "Definir pauta", daysOffset: -1 },
            { text: "Enviar convites", daysOffset: -1 },
            { text: "Preparar apresentação", daysOffset: -0 },
            { text: "Registrar ata", daysOffset: 1 },
          ],
        },
        {
          eventType: "Treinamento",
          name: "Checklist de Treinamento",
          description: "Tarefas para um programa de treinamento.",
          items: [
            { text: "Definir objetivos de aprendizado", daysOffset: -30 },
            { text: "Desenvolver módulos de treinamento", daysOffset: -20 },
            { text: "Selecionar instrutores", daysOffset: -15 },
            { text: "Avaliar resultados", daysOffset: 7 },
          ],
        },
        {
          eventType: "Evento Social",
          name: "Checklist de Evento Social",
          description: "Tarefas para um evento descontraído.",
          items: [
            { text: "Escolher tema da festa", daysOffset: -40 },
            { text: "Organizar buffet/bebidas", daysOffset: -25 },
            { text: "Contratar entretenimento", daysOffset: -20 },
            { text: "Enviar save the date", daysOffset: -30 },
            { text: "Confirmar lista de convidados", daysOffset: -10 },
          ],
        },
      ];

      for (const templateData of templates) {
        await createTemplate(templateData);
      }
      console.log(`✅ ${templates.length} templates padrão criados`);
    } else {
      console.log(
        `ℹ️ ${existingTemplates} templates de checklist já existem no sistema`
      );
    }
  } catch (error) {
    console.error("❌ Erro ao criar templates padrão:", error);
  }
};

module.exports = {
  getChecklistByEvent,
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
