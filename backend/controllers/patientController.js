const { Patient } = require('../models/patientModel');
const { User } = require('../models/userModel');

// Créer un patient
exports.createPatient = async (req, res) => {
  try {
    const { user_id, numero_securite_sociale, allergies } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Créer le patient
    const patient = await Patient.create({ user_id, numero_securite_sociale, allergies });
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du patient", error });
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
