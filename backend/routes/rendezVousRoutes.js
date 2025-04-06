const express = require('express');
const router = express.Router();
const rendezVousController = require('../controllers/rendezVousController');

// Routes pour les rendez-vous
router.post('/', rendezVousController.createRendezVous);
router.get('/', rendezVousController.getAllRendezVous);
router.get('/dispo', rendezVousController.getOptimizedRendezVous);

router.get('/:id', rendezVousController.getRendezVousById);

router.put('/:id', rendezVousController.updateRendezVous);
router.put('/cancel/:id', rendezVousController.cancelRendezVous);

router.delete('/:id', rendezVousController.deleteRendezVous);

// Récupérer tous les rendez-vous par ID de patient
router.get('/patient/:patient_id', rendezVousController.getRendezVousByPatientId);

// Récupérer tous les rendez-vous par ID de médecin
router.get('/doctor/:medecin_id', rendezVousController.getRendezVousByDoctorId);

module.exports = router;
