const { Patient } = require('../models/patientModel');
const { User } = require('../models/userModel');
const bcrypt = require('bcryptjs');



exports.createPatient = async (req, res) => {
  try {
    const {
      nom,
      prenom,
      email,
      mot_de_passe,
      numero_de_telephone,
      adresse,
      cin,
      numero_securite_sociale,
      allergies
    } = req.body;

    // Check if the email is already taken
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    // Create the user with the role 'Patient'
    const user = await User.create({
      nom,
      prenom,
      email,
      mot_de_passe: hashedPassword,
      numero_de_telephone,
      adresse,
      cin,
      role: 'user', // User role as 'patient'
    });

    // Create the patient associated with the user created
    const patient = await Patient.create({
      user_id: user.user_id, // Reference the user ID
      numero_securite_sociale,
      allergies
    });

    // Respond with success message and patient data
    res.status(201).json({
      message: "Patient créé avec succès",
      patient,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      message: "Erreur lors de la création du patient",
      error: error.message,
    });
  }
};

// Obtenir tous les patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll({ include: User });
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des patients", error });
  }
};

// Obtenir un patient par ID
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id, { include: User });

    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du patient", error });
  }
};

// Mettre à jour un patient
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { numero_securite_sociale, allergies } = req.body;

    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    // Mise à jour des informations
    await patient.update({ numero_securite_sociale, allergies });
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du patient", error });
  }
};

// Supprimer un patient
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    await patient.destroy();
    res.status(200).json({ message: "Patient supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du patient", error });
  }
};
