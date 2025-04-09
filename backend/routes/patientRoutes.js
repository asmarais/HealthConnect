const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Définition des routes
router.post('/', patientController.createPatient);
router.get('/', patientController.getAllPatients);
router.get('/doctors/:id', patientController.getAllDoctorsByPatient);
router.get('/rendez-vous/:id', patientController.getRendezVousByPatient);


router.get('/:id', patientController.getPatientById);
router.put('/:id', patientController.updatePatient);
router.delete('/:id', patientController.deletePatient);

module.exports = router;
