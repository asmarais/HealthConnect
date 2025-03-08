const bcrypt = require('bcryptjs');
const { User } = require('../models/userModel');

// Create User
const createUser = async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, numero_de_telephone, adresse, cin, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    // Hasher le mot de passe avant de l'enregistrer
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const user = await User.create({
      nom,
      prenom,
      email,
      mot_de_passe: hashedPassword,
      numero_de_telephone,
      adresse,
      cin,
      role,
    });

    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get User by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.user_id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update User by ID
const updateUserById = async (req, res) => {
  try {
    const { nom, prenom, mot_de_passe, numero_de_telephone, adresse, cin } = req.body;
    const user = await User.findByPk(req.params.user_id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (mot_de_passe) {
      const salt = await bcrypt.genSalt(10);
      user.mot_de_passe = await bcrypt.hash(mot_de_passe, salt);
    }

    await user.update({
      nom: nom || user.nom,
      prenom: prenom || user.prenom,
      numero_de_telephone: numero_de_telephone || user.numero_de_telephone,
      adresse: adresse || user.adresse,
      cin: cin || user.cin,
    });

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete User by ID
const deleteUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.user_id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await user.destroy();
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
  updateUserById,
  deleteUserById,
};
