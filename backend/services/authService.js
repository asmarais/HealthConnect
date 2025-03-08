// services/authService.js
const bcrypt = require('bcryptjs');
const { User } = require('../models/userModel');
const { generateToken } = require('../utils/tokenService');
const { sendEmail } = require('../utils/emailService');

const signup = async (userData) => {
  const { nom, prenom, email, mot_de_passe, numero_de_telephone, adresse, cin } = userData;

  // Vérifier si l'email est déjà utilisé
  const userExists = await User.findOne({ where: { email } });
  if (userExists) throw new Error('Email déjà utilisé');

  // Chiffrer le mot de passe
  const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
  console.log('Hash before saving in DB:', hashedPassword);


  // Créer un nouvel utilisateur avec le bon hash
  let user = await User.create({
    nom,
    prenom,
    email,
    mot_de_passe: hashedPassword,
    numero_de_telephone,
    adresse,
    cin, 
  })
  // Vérifier si le hash en base est bien celui généré
  const savedUser = await User.findOne({ where: { email } });
  console.log('Stored hashed password in DB:', savedUser.mot_de_passe);

  user.mot_de_passe = hashedPassword;
  await user.save();
console.log(user.mot_de_passe)  

  // Envoyer un email de bienvenue
  // await sendEmail(email, 'Bienvenue sur Health Connect', prenom, mot_de_passe);
  
  return { user };
};

const login = async ({ email, mot_de_passe }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('User non trouvé');

  console.log('Stored hashed password:', user.mot_de_passe);
  console.log('Input password:', mot_de_passe);

  const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
  console.log('Password match:', isMatch);

  if (!isMatch) throw new Error('Incorrect password');

  // Générer un token JWT
  const token = generateToken(user);
  return token;
};


// Déconnexion
const logout = () => {
  return { message: 'Déconnexion réussie' };
};

module.exports = { signup, login, logout };
