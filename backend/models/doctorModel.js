const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { User } = require('./userModel');


const Doctor = sequelize.define('Doctor', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: User,
      key: 'user_id',
    },
    onDelete: 'CASCADE', // Si l'utilisateur est supprimé, supprimer aussi le docteur
  },
  specialite: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    allowNull: false,
    defaultValue: 'PENDING', // Default status is PENDING until admin approves
  },
  datedebut: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  datefin: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING, // Stockera l'URL de l'image
    allowNull: true,
    validate: {
      isUrl: true // Validation optionnelle pour s'assurer que c'est une URL valide
    }
  },
  rating: {
    type: DataTypes.STRING, // Stockera l'URL de l'image
    allowNull: true,
  },
  joined_at: {
    type: DataTypes.DATE, // Stockera l'URL de l'image
    allowNull: true,
   
  },
}, {
  tableName: 'doctors',
  timestamps: false,
});

// Associer le docteur à l'utilisateur
Doctor.belongsTo(User, { foreignKey: 'user_id' });



module.exports = { Doctor };
