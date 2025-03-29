const { verifyToken } = require('../utils/tokenService');

const protect = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
module.exports = { protect };

/**
 * Middleware pour vérifier si l'utilisateur a un rôle spécifique
 * @param {string} role - Le rôle requis pour accéder à la ressource
 */
const authorize = (role) => (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== role) {
      return res.status(403).json({ message: `Access denied. ${role} role required.` });
    }

    req.user = decoded; // Ajoute l'utilisateur à la requête
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};


const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

module.exports = { authorize,ensureAuthenticated };
