const EventService = require('../services/event.service');

const getAllEvents = async (req, res) => {
  try {
    // Extrair filtros da query string
    const filters = {
      status: req.query.status,
      eventType: req.query.eventType,
      eventFormat: req.query.eventFormat,
      responsible: req.query.responsible,
      organizer: req.query.organizer,
      location: req.query.location,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    
    // Remover filtros vazios/undefined
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });
    
    const events = await EventService.getAllEvents(filters);
    res.status(200).json(events);
  } catch (error) {
    console.error("❌ Erro ao buscar eventos:", error);
    res.status(500).json({ error: 'Erro ao buscar eventos.' });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await EventService.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento não encontrado.' });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar evento.' });
  }
};

const createEvent = async (req, res) => {
  try {
    console.log("📦 Corpo recebido no backend:", req.body); // <-- AJUDA MUITO!

    const newEvent = await EventService.createEvent(req.body);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("❌ Erro ao criar evento:", error);
    res.status(500).json({ error: "Erro ao criar evento." });
  }
};

const updateEvent = async (req, res) => {
  try {
    const updatedEvent = await EventService.updateEvent(req.params.id, req.body);
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar evento.' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    await EventService.deleteEvent(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar evento.' });
  }
};

const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedEvent = await EventService.updateEventStatus(id, status);
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status do evento.' });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
};