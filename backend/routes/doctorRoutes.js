const express = require('express');
const doctorController = require('../controllers/doctorController');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', doctorController.registerDoctor);
router.get('/pending', protect ,admin , doctorController.getPendingDoctors);
router.put('/validate/:user_id',   doctorController.validateDoctor);

router.post('/', doctorController.createDoctor);
router.get('/:user_id', doctorController.getDoctorById);
router.get('/', doctorController.getAllDoctors);
router.delete('/:user_id', doctorController.deleteDoctorById);

module.exports = router;
