const { signup, login, logout } = require('../services/authService');

const signupController = async (req, res) => {
  try {
    const { user, token } = await signup(req.body);
    res.status(201).json({ message: 'User created successfully', user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginController = async (req, res) => {
  try {
    const token = await login(req.body);
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutController = (req, res) => {
  const message = logout();
  res.status(200).json(message);
};



module.exports = {
  signupController,
  loginController,
  logoutController,
};