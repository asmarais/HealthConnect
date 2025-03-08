const express = require('express');
const doctorController = require('../controllers/doctorController');
const router = express.Router();

router.post('/', doctorController.createDoctor);
router.get('/:user_id', doctorController.getDoctorById);
router.get('/', doctorController.getAllDoctors);
router.delete('/:user_id', doctorController.deleteDoctorById);

module.exports = router;
