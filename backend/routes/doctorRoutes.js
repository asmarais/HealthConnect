const express = require('express');
const doctorController = require('../controllers/doctorController');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');


router.post('/register', doctorController.registerDoctor);
router.get('/pending', authorize("admin") , doctorController.getPendingDoctors);
router.put('/validate/:user_id',   doctorController.validateDoctor);

router.get('/patients/:id', doctorController.getPatientsByDoctor);
router.get('/rendez-vous/:id', doctorController.getRendezVousByDoctor);
router.get('/:id', doctorController.getDoctorById);



router.get('/', doctorController.getAllDoctors);
router.delete('/:id', doctorController.deleteDoctorById);

module.exports = router;
