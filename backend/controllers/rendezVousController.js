const { RendezVous } = require('../models/rendezVousModel');
const { Patient } = require('../models/patientModel');
const { Doctor } = require('../models/doctorModel');

// Créer un rendez-vous
exports.createRendezVous = async (req, res) => {
  try {
    const { patient_id, medecin_id, date_debut, date_fin, statut } = req.body;

    // Vérifier si le patient et le médecin existent
    const patient = await Patient.findByPk(patient_id);
    const doctor = await Doctor.findByPk(medecin_id);

    if (!patient) return res.status(404).json({ message: "Patient non trouvé" });
    if (!doctor) return res.status(404).json({ message: "Médecin non trouvé" });

    // Créer le rendez-vous
    const rendezVous = await RendezVous.create({ patient_id, medecin_id, date_debut, date_fin, statut });
    res.status(201).json(rendezVous);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du rendez-vous", error });
  }
};

// Récupérer tous les rendez-vous
exports.getAllRendezVous = async (req, res) => {
  try {
    const rendezVous = await RendezVous.findAll({ include: [Patient, Doctor] });
    res.status(200).json(rendezVous);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des rendez-vous", error });
  }
};

// Récupérer un rendez-vous par ID
exports.getRendezVousById = async (req, res) => {
  try {
    const { id } = req.params;
    const rendezVous = await RendezVous.findByPk(id, { include: [Patient, Doctor] });

    if (!rendezVous) return res.status(404).json({ message: "Rendez-vous non trouvé" });

    res.status(200).json(rendezVous);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du rendez-vous", error });
  }
};

// Mettre à jour un rendez-vous
exports.updateRendezVous = async (req, res) => {
  try {
    const { id } = req.params;
    const { date_debut, date_fin, statut } = req.body;

    const rendezVous = await RendezVous.findByPk(id);
    if (!rendezVous) return res.status(404).json({ message: "Rendez-vous non trouvé" });

    await rendezVous.update({ date_debut, date_fin, statut });
    res.status(200).json(rendezVous);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du rendez-vous", error });
  }
};

// Supprimer un rendez-vous
exports.deleteRendezVous = async (req, res) => {
  try {
    const { id } = req.params;
    const rendezVous = await RendezVous.findByPk(id);

    if (!rendezVous) return res.status(404).json({ message: "Rendez-vous non trouvé" });

    await rendezVous.destroy();
    res.status(200).json({ message: "Rendez-vous supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du rendez-vous", error });
  }
};
