const { User } = require('../models/userModel');
const { Doctor } = require('../models/doctorModel');
const bcrypt = require('bcryptjs');
const{ sendEmail} = require('../utils/emailService');
const { Patient } = require('../models/patientModel');
const { RendezVous } = require('../models/rendezVousModel');

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

// Mettre à jour les informations d'un docteur
const updateDoctor = async (req, res) => {
  try {
    const { user_id } = req.params;
    const {
      specialite,
      datedebut,
      datefin,
      image_url,
      rating,
    } = req.body;

    // Récupérer le docteur existant
    const doctor = await Doctor.findOne({ where: { user_id } });

    if (!doctor) {
      return res.status(404).json({ error: 'Docteur non trouvé' });
    }

    // Mettre à jour les champs fournis
    if (specialite !== undefined) doctor.specialite = specialite;
    if (datedebut !== undefined) doctor.datedebut = datedebut;
    if (datefin !== undefined) doctor.datefin = datefin;
    if (image_url !== undefined) doctor.image_url = image_url;
    if (rating !== undefined) doctor.rating = rating;

    await doctor.save();

    res.status(200).json({ message: 'Informations du docteur mises à jour', doctor });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du docteur', details: err.message });
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
  // Vérifier si le hash en base est bien celui généré
  const savedUser = await User.findOne({ where: { email } });
  console.log('Stored hashed password in DB:', savedUser.mot_de_passe);

  user.mot_de_passe = hashedPassword;
  await user.save();
console.log(user.mot_de_passe)  
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


const getPatientsByDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    const rendezVousList = await RendezVous.findAll({
      where: { medecin_id: doctorId },
      include: [{
        model: Patient,
        include: [User] // Pour inclure les données du compte utilisateur (nom, email, etc.)
      }]
    });

    // Extraire les patients uniques via leur user_id
    const patients = rendezVousList
      .map(rdv => rdv.Patient)
      .filter(patient => patient); // filtrer les nulls au cas où

    const uniquePatientsMap = new Map();
    patients.forEach(patient => {
      uniquePatientsMap.set(patient.user_id, patient);
    });

    const uniquePatients = Array.from(uniquePatientsMap.values());

    res.status(200).json({ patients: uniquePatients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des patients', details: err.message });
  }
};
const getRendezVousByDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    const rendezVous = await RendezVous.findAll({
      where: { medecin_id: doctorId },
      include: [
        {
          model: Patient,
          include: [User]
        },
        {
          model: Doctor,
          include: [User]
        }
      ]
    });

    res.status(200).json({ rendezVous });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des rendez-vous', details: err.message });
  }
};


const getApprovedDoctors = async (req, res) => {
  try {
    const approvedDoctors = await Doctor.findAll({
      where: { status: 'APPROVED' },
      include: {
        model: User,
        attributes: { exclude: [] }, // Tu peux spécifier les attributs à inclure/exclure ici si besoin
      },
    });

    res.status(200).json({ doctors: approvedDoctors });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching approved doctors', error: err.message });
  }
};

module.exports = {
  updateDoctor,
  registerDoctor,
  getApprovedDoctors,
  validateDoctor,
   getPendingDoctors,
  getDoctorById,
  getAllDoctors,
  deleteDoctorById,
  getPatientsByDoctor,
  getRendezVousByDoctor
};

