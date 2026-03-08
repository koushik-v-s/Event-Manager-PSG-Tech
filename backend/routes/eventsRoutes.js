const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const upload = require('../config/multer');
const eventController = require('../controllers/eventController');

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

router.post('/update-dates/:event_id', authenticateToken, eventController.updateEventDates);
router.get('/my-events', authenticateToken, eventController.getMyEvents);
router.post('/request', authenticateToken, eventController.requestEvent);
router.get('/booked-dates', authenticateToken, eventController.getBookedDates);
router.post('/upload-approval/:event_id', authenticateToken, upload.single('file'), eventController.uploadApproval);
router.get('/details/:event_id', authenticateToken, eventController.getEventDetails);
router.get('/generate-pdf/:event_id', authenticateToken, eventController.generateEventPdf);
router.get('/pending', authenticateToken, requireAdmin, eventController.getPendingEvents);
router.get('/all', authenticateToken, requireAdmin, eventController.getAllEvents);
router.post('/cancel/:event_id', authenticateToken, eventController.cancelEvent);

module.exports = router;