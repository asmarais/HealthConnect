const { User } = require('../models/userModel');
const { Doctor } = require('../models/doctorModel');
const bcrypt = require('bcryptjs');
const{ sendEmail} = require('../utils/emailService');

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
    const doctor = await Doctor.findOne({
      where: { user_id: req.params.user_id },
      include: User
    });
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

// Register a new doctor (pending admin approval)
const registerDoctor = async (req, res) => {
  try {
    const { 
      nom, 
      prenom, 
      email, 
      mot_de_passe, 
      numero_de_telephone, 
      adresse, 
      cin, 
      specialite, 
      datedebut, 
      datefin ,
      image_url
    } = req.body;

    // // Validate if 'datedebut' is provided and is a valid date
    // if (!datedebut || isNaN(Date.parse(datedebut))) {
    //   return res.status(400).json({ error: 'Invalid or missing start date (datedebut)' });
    // }

    // // 'datefin' can be optional, validate if it's provided and is a valid date
    // if (datefin && isNaN(Date.parse(datefin))) {
    //   return res.status(400).json({ error: 'Invalid end date (datefin)' });
    // }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);

    // Create the user (Doctor user)
    const user = await User.create({
      nom,
      prenom,
      email,
      mot_de_passe: hashedPassword,
      numero_de_telephone,
      adresse,
      cin,
      role: 'doctor',
      image_url,
    });

    // Create the doctor record associated with the user
    const doctor = await Doctor.create({
      user_id: user.user_id,
      specialite,
      status: 'PENDING', // Default status as pending until admin approval
      datedebut: typeof datedebut === 'string' ? datedebut : null, // Ensure it's a string
  datefin: typeof datefin === 'string' ? datefin : null, // Ensure it's a string or null
  image_url,
    });

    res.status(201).json({
      message: 'Doctor registration request submitted. Awaiting admin approval.',
      doctor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error registering doctor',
      error: err.message,
    });
  }
};

// Approve or reject a doctor's registration
const validateDoctor = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be APPROVED or REJECTED.' });
    }

    const doctor = await Doctor.findOne({ where: { user_id } });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    if (doctor.status !== 'PENDING') {
      return res.status(400).json({ message: 'Doctor has already been validated.' });
    }

    doctor.status = status;
    await doctor.save();

    const user =await User.findOne({ where: { user_id } });

     // Envoyer un email de confirmation au docteur
     if (status === "APPROVED") {
      await sendEmail(user.email, "account_approved", user.nom);
    } else if (status === "REJECTED") {
      await sendEmail(user.email, "account_rejected", user.nom);
    }

    res.status(200).json({ message: `Doctor ${status.toLowerCase()} successfully.`, doctor });
  } catch (err) {
    res.status(500).json({ message: 'Error validating doctor', error: err.message });
  }
};

// Get all pending doctors
const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await Doctor.findAll({
      where: { status: 'PENDING' },
      include: [{ model: User, attributes: ['nom', 'prenom', 'email'] }],
    });

    res.status(200).json(pendingDoctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending doctors', error: err.message });
  }
};

module.exports = {
  registerDoctor,
  validateDoctor,
   getPendingDoctors,
  getDoctorById,
  getAllDoctors,
  deleteDoctorById,
};
