const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/username', userController.getProfile);
router.get('/profile/:email', userController.getUserProfile);

module.exports = router;