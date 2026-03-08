// backend/routes/events.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const upload = require('../config/multer');
const {
  requestEvent,
  generatePDF,
  uploadApproval,
  approveEvent,
  getEvents,
  getEventById,
} = require('../controllers/eventController');

router.post('/request', authenticateToken, requestEvent);
router.get('/pdf/:id', authenticateToken, generatePDF);
router.post('/upload-approval/:id', authenticateToken, upload.upload.single('file'), uploadApproval);
router.put('/approve/:id', authenticateToken, approveEvent);
router.get('/', authenticateToken, getEvents);
router.get('/:id', authenticateToken, getEventById);

module.exports = router;