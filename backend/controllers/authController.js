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
    const { token, user } = await login(req.body);
    res.status(200).json({ 
      message: 'Login successful', 
      token:token, 
      user:user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const logoutController = (req, res) => {
  const message = logout();
  res.status(200).json(message);
};



  const googleCallback= (req, res) => {
    if (!req.user) {
      console.log(req.user,res)
      return res.status(401).json({ message: "Authentication failed" });
    }
    
    // Redirection après connexion
    res.redirect("/dashboard");
  };

 const getDashboard= (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.json({ user: req.user });
  };



module.exports = {
  signupController,
  loginController,
  logoutController,
  googleCallback,
  getDashboard
};