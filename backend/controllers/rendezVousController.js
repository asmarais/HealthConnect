const { RendezVous } = require('../models/rendezVousModel');
const { Patient } = require('../models/patientModel');
const { Doctor } = require('../models/doctorModel');
const{ sendEmail} = require('../utils/emailService');
const { Op } = require("sequelize");
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


// // Créer un rendez-vous avec optimisation
// exports.createRendezVous = async (req, res) => {
//   try {
//     const { patient_id, medecin_id, date_debut, date_fin, statut, priorite } = req.body;

//     // Vérifier si le patient et le médecin existent
//     const patient = await Patient.findByPk(patient_id);
//     const doctor = await Doctor.findByPk(medecin_id);

//     if (!patient) return res.status(404).json({ message: "Patient non trouvé" });
//     if (!doctor) return res.status(404).json({ message: "Médecin non trouvé" });

//     // Vérifier si le créneau est disponible
//     const existingAppointment = await RendezVous.findOne({
//       where: {
//         medecin_id,
//         [Op.or]: [
//           { date_debut: { [Op.between]: [date_debut, date_fin] } },
//           { date_fin: { [Op.between]: [date_debut, date_fin] } },
//         ],
//       },
//     });

//     if (existingAppointment) {
//       // Si le créneau est pris, ajouter le patient en liste d'attente
//       await WaitingList.create({ patient_id, medecin_id, date_debut, date_fin, priorite });
//       return res.status(200).json({ message: "Créneau indisponible, ajouté en liste d'attente" });
//     }

//     // Création du rendez-vous si le créneau est libre
//     const rendezVous = await RendezVous.create({ patient_id, medecin_id, date_debut, date_fin, statut });

//     res.status(201).json(rendezVous);
//   } catch (error) {
//     res.status(500).json({ message: "Erreur lors de la création du rendez-vous", error });
//   }
// };

// Annuler un rendez-vous et envoyer une recommandation au patient prioritaire
exports.cancelRendezVous = async (req, res) => {
  try {
    const { id } = req.params;
    const rendezVous = await RendezVous.findByPk(id);

    if (!rendezVous) return res.status(404).json({ message: "Rendez-vous non trouvé" });

    const { medecin_id, date_debut, patient_id  } = rendezVous;
     // Récupérer le patient qui annule le rendez-vous
     const patient = await Patient.findByPk(patient_id);
     if (patient && patient.score > 1) {
       patient.score -= 1;
       await patient.save();
     }
    await rendezVous.destroy();

    // Trouver le patient avec la priorité la plus haute pour ce médecin
    const patientPrioritaire = await Patient.findOne({
      where: { medecin_id },
      order: [["score", "DESC"]], // Patient avec le meilleur score
    });

    if (patientPrioritaire) {
      // Envoyer un email de recommandation au patient prioritaire
      await sendEmail(
        patientPrioritaire.email,
        "Un créneau s'est libéré pour votre consultation",
        `Bonjour ${patientPrioritaire.nom},\n\nUn créneau s'est libéré le ${date_debut}. Vous avez la priorité pour le réserver.\n\nVeuillez prendre contact avec le médecin pour confirmer votre rendez-vous.`
      );

      return res.status(200).json({ message: "Rendez-vous annulé, notification envoyée au patient prioritaire" });
    }

    res.status(200).json({ message: "Rendez-vous annulé, aucun patient prioritaire trouvé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'annulation du rendez-vous", error });
  }
};
// Fonction pour envoyer des rappels aux patients ayant un rendez-vous dans 24h
const envoyerRappelsRendezVous = async () => {
  try {
    const dateActuelle = new Date();
    const dateDemain = new Date(dateActuelle);
    dateDemain.setDate(dateDemain.getDate() + 1); // Ajouter 1 jour

    // Récupérer les rendez-vous prévus pour demain
    const rendezVousDemain = await RendezVous.findAll({
      where: {
        date_debut: {
          [Op.between]: [dateDemain.setHours(0, 0, 0, 0), dateDemain.setHours(23, 59, 59, 999)],
        },
      },
      include: [{ model: Patient, attributes: ["email", "nom"] }],
    });

    // Parcourir chaque rendez-vous et envoyer un email au patient
    for (const rdv of rendezVousDemain) {
      if (rdv.Patient && rdv.Patient.email) {
        await sendEmail(
          rdv.Patient.email,
          "Rappel de votre rendez-vous médical",
          `Bonjour ${rdv.Patient.nom},\n\nCeci est un rappel pour votre rendez-vous prévu le ${rdv.date_debut}.\n\nMerci de vous présenter à l'heure.\n\nCordialement,`
        );
      }
    }

    console.log(`✅ Rappels envoyés pour ${rendezVousDemain.length} rendez-vous.`);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi des rappels :", error);
  }
};

// Planification de la fonction pour qu'elle s'exécute toutes les 24h
exports.scheduleRappels = () => {
  setInterval(envoyerRappelsRendezVous, 24 * 60 * 60 * 1000); // Toutes les 24h
};

