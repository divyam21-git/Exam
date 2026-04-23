// routes/auth.js
const express = require('express');
const { registerStudent, login } = require('../controllers/authController');
const router = express.Router();

// Public register endpoint for students
router.post('/register', registerStudent);

// Login for any role (admin, subadmin, student)
router.post('/login', login);

module.exports = router;
