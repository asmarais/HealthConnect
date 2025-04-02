const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Patient } = require('./patientModel');
const { Doctor } = require('./doctorModel');

const RendezVous = sequelize.define('RendezVous', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  date_debut: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  date_fin: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'rendezvous',
  timestamps: false,
});

// Associations
RendezVous.belongsTo(Patient, { foreignKey: 'patient_id' });
RendezVous.belongsTo(Doctor, { foreignKey: 'medecin_id' });


module.exports = { RendezVous };
