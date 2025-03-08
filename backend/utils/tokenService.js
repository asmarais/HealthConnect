const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// // Fonction pour générer un token JWT à partir de voitureId, userId, reservationId
// function generateQR( reservationId, userId,voitureId) {
//   // On crée l'objet contenant les informations à encoder dans le JWT
//   const payload = {
//     reservationId,
//     userId,
//     voitureId,

//     exp: Math.floor(Date.now() / 1000) + (60 * 60) // Le token expire dans 1 heure
//   };

//   // Clé secrète pour signer le JWT (à changer pour une clé plus sécurisée en production)
//   const secretKey = '09b2c5bbec5cf8c62e8380d466838ab12cc1e81e36ed100fb3db9a53f446551ce4ed42d8f6f79112d0b4ebfc124e3865b7f1bb9d150a49e2782f8f79eddf4be2bf88cecd0fa41a4b07310bba531002b63c0aa873d7cb97a83e4870aaf26b852bd6dc980c4913b42eed219e9b4ce683c440b9ee02a933e3a1954b89520ddddf6b9475b59c5eed97e9afa2df14e2f6dcbfd9a96d7b469b085871b5f04647a73a02b1717a1209275cfc1e07d33f6185c7669d664da89a81298a051564ade9547aef88e4f86a3e3c1cf5dbbf95736669fa6a91ea214e0f1f594c96da2b1067dd834ca1ce6f5f6d5bf7e69f123bc1d1d147bd9c5ab90142b88a7bec202dc2149755d5';

//   // Générer le token JWT
//   const token = jwt.sign(payload, secretKey);

//   return token;
// }
module.exports = { generateToken, verifyToken };
