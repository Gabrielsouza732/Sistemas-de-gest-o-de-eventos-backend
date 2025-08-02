const { PrismaClient } = require("@prisma/client");
const ChecklistService = require("./checklist.service");
const prisma = new PrismaClient();

const getAllEvents = async (filters) => {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.priority) {
    where.priority = filters.priority;
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { location: { contains: filters.search, mode: "insensitive" } },
      { requester: { contains: filters.search, mode: "insensitive" } },
      { organizer: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return await prisma.event.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
};

const getEventById = async (id) => {
  return await prisma.event.findUnique({
    where: { id },
    include: {
      checklistItems: true,
      comments: true,
    },
  });
};

const createEvent = async (eventData) => {
  const newEvent = await prisma.event.create({
    data: eventData,
  });

  // Aplicar template de checklist automaticamente se eventType for fornecido
  if (newEvent.eventType && newEvent.startDate) {
    await ChecklistService.applyTemplateToEvent(
      newEvent.id,
      newEvent.eventType,
      newEvent.startDate
    );
  }

  return newEvent;
};

const updateEvent = async (id, eventData) => {
  return await prisma.event.update({
    where: { id },
    data: eventData,
  });
};

const updateEventStatus = async (id, status) => {
  return await prisma.event.update({
    where: { id },
    data: { status },
  });
};

const deleteEvent = async (id) => {
  return await prisma.event.delete({
    where: { id },
  });
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
};
