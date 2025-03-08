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
}, {
  tableName: 'doctors',
  timestamps: false,
});

// Associer le docteur à l'utilisateur
Doctor.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { Doctor };
