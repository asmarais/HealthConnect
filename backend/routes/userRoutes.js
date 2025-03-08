const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

const protect = require('../middleware/authMiddleware');


router.post('/', userController.createUser);

router.get('/:user_id', userController.getUserById);

router.get('/', userController.getAllUsers);

router.put('/:user_id', userController.updateUserById);

router.delete('/:user_id', userController.deleteUserById);

module.exports = router;
