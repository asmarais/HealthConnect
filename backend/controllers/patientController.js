const { Patient } = require('../models/patientModel');
const { User } = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { RendezVous } = require('../models/rendezVousModel');

const { Doctor } = require('../models/doctorModel');

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
      role: 'patient', // User role as 'patient'
    });
  // Vérifier si le hash en base est bien celui généré
  const savedUser = await User.findOne({ where: { email } });
  console.log('Stored hashed password in DB:', savedUser.mot_de_passe);

  user.mot_de_passe = hashedPassword;
  await user.save();
console.log(user.mot_de_passe)  
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

// Récupérer tous les docteurs associés à un patient (via les rendez-vous)
exports.getAllDoctorsByPatient = async (req, res) => {
  try {
    const patientId = req.params.id;

    const rendezvous = await RendezVous.findAll({
      where: { patient_id: patientId },
      include: {
        model: Doctor,
        include: [{ model: User, attributes: ['nom', 'prenom', 'email'] }]
      }
    });

    // Extraire les docteurs uniques
    const doctorsMap = {};
    rendezvous.forEach(rdv => {
      const doctor = rdv.Doctor;
      if (doctor && !doctorsMap[doctor.user_id]) {
        doctorsMap[doctor.user_id] = doctor;
      }
    });

    const uniqueDoctors = Object.values(doctorsMap);

    res.status(200).json(uniqueDoctors);
  } catch (error) {
    console.error("Erreur lors de la récupération des docteurs par patient :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// Obtenir tous les rendez-vous d’un patient
exports.getRendezVousByPatient = async (req, res) => {
  try {
    const patientId = req.params.id;

    // Vérifie que le patient existe
    const patient = await Patient.findOne({ where: { user_id: patientId } });
    if (!patient) {
      return res.status(404).json({ error: 'Patient non trouvé' });
    }

    const rendezVousList = await RendezVous.findAll({
      where: { patient_id: patientId },
      include: [
        {
          model: Doctor,
          include: {
            model: User,
            attributes: ['nom', 'prenom', 'email']
          }
        }
      ],
      order: [['date_debut', 'DESC']]
    });

    res.status(200).json({ rendezVous: rendezVousList });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des rendez-vous', details: err.message });
  }
};
