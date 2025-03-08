const express = require('express');
const authController= require('../controllers/authController');
const router = express.Router();

// Sign up API
router.post('/signup', authController.signupController);

// Login API
router.post('/login', authController.loginController);

// Logout API
router.post('/logout', authController.logoutController);

module.exports = router;
