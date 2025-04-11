const { signup, login, logout } = require('../services/authService');
const bcrypt = require('bcryptjs');
const { User } = require('../models/userModel');
const { generateToken } = require('../utils/tokenService');
const { sendEmail } = require('../utils/emailService');
const crypto = require("crypto");

const signupController = async (req, res) => {
  try {
    const { user, token } = await signup(req.body);
    res.status(201).json({ message: 'User created successfully', user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginController = async (req, res) => {
  try {
    const { token, user } = await login(req.body);
    res.status(200).json({ 
      message: 'Login successful', 
      token:token, 
      user:user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const logoutController = (req, res) => {
  const message = logout();
  res.status(200).json(message);
};



  // const googleCallback= (req, res) => {
  //   if (!req.user) {
  //     console.log(req.user,res)
  //     return res.status(401).json({ message: "Authentication failed" });
  //   }
    
  const googleCallback = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Échec de l'authentification" });
      }
  
      // ✅ Extraction correcte des données
      const email = req.user.emails?.[0]?.value;
      const given_name = req.user.name?.givenName;
      const family_name = req.user.name?.familyName;
  
      if (!email) {
        return res.status(400).json({ message: "Aucun e-mail récupéré depuis Google" });
      }
      console.log(email,given_name,family_name)
  
      // Recherche de l'utilisateur
      let user = await User.findOne({ where: { email } });
  
      if (!user) {
        // Mot de passe temporaire
        const tempPassword = crypto.randomBytes(6).toString("hex");
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
  console.log(hashedPassword)
        // Création de l'utilisateur
        user = await User.create({
          email,
          nom: given_name,
          prenom: family_name,
          mot_de_passe: hashedPassword,
          role: 'patient',
          
        });
    // Vérifier si le hash en base est bien celui généré
    const savedUser = await User.findOne({ where: { email } });
    console.log('Stored hashed password in DB:', savedUser.mot_de_passe);
  
    user.mot_de_passe = hashedPassword;
    await user.save();
  console.log(user.mot_de_passe)  
        await sendEmail(email, "google_signup", given_name, tempPassword);

      }
  
      // Redirection vers le dashboard
      res.redirect("http://localhost:4200/login");
  
    } catch (error) {
      console.error("Erreur lors de l'authentification Google:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
 const getDashboard= (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.json({ user: req.user });
  };



module.exports = {
  signupController,
  loginController,
  logoutController,
  googleCallback,
  getDashboard
};