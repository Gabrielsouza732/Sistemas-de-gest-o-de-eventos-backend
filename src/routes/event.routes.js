const express = require('express');
const router = express.Router();
const EventController = require('../controllers/event.controller');

router.get('/', EventController.getAllEvents);
router.get('/:id', EventController.getEventById);
router.post('/', EventController.createEvent);
router.put('/:id', EventController.updateEvent);
router.delete('/:id', EventController.deleteEvent);
router.patch('/:id/status', EventController.updateEventStatus);
router.put('/:id/status', EventController.updateEventStatus);


module.exports = router;
