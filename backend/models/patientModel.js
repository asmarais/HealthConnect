const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { User } = require('./userModel');


const Patient = sequelize.define('Patient', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: User,
      key: 'user_id',
    },
    onDelete: 'CASCADE', // Si l'utilisateur est supprimé, supprimer aussi le patient
  },
  numero_securite_sociale: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true, // Peut être null si aucune allergie
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  raison: {
    type: DataTypes.TEXT,
    allowNull:true  }
}, {
  tableName: 'patients',
  timestamps: false,
});

// Relation avec User
Patient.belongsTo(User, { foreignKey: 'user_id' });




module.exports = { Patient };
