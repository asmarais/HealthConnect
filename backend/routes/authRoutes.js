const express = require('express');
const authController= require('../controllers/authController');
const router = express.Router();
const passport = require("../oauth/google");
// Sign up API
router.post('/signup', authController.signupController);

// Login API
router.post('/login', authController.loginController);

// Logout API
router.post('/logout', authController.logoutController);

// Démarrer l'authentification Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback après l'auth Google
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  authController.googleCallback
);

// Dashboard
router.get("/dashboard", authController.getDashboard);



module.exports = router;
