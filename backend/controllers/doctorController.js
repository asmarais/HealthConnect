const { User } = require('../models/userModel');
const { Doctor } = require('../models/doctorModel');
const bcrypt = require('bcryptjs');

// Créer un utilisateur de type docteur
const createDoctor = async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, numero_de_telephone, adresse, cin, specialite } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    // Créer l'utilisateur avec le rôle 'doctor'
    const user = await User.create({
      nom,
      prenom,
      email,
      mot_de_passe: hashedPassword,
      numero_de_telephone,
      adresse,
      cin,
      role: 'doctor', // Spécifier le rôle 'doctor'
    });

    // Créer l'entrée doctor avec l'ID utilisateur
    const doctor = await Doctor.create({
      user_id: user.user_id, // Utiliser l'ID de l'utilisateur
      specialite,
    });

    res.status(201).json({ user, doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtenir un docteur par ID
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, { include: User });
    if (!doctor) {
      return res.status(404).json({ error: 'Docteur non trouvé' });
    }
    res.status(200).json({ doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtenir tous les docteurs
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({ include: User });
    res.status(200).json({ doctors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprimer un docteur
const deleteDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Docteur non trouvé' });
    }

    await doctor.destroy();
    res.status(200).json({ message: 'Docteur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createDoctor,
  getDoctorById,
  getAllDoctors,
  deleteDoctorById,
};
