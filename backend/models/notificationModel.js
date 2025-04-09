const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// models/notification.model.js
    const Notification = sequelize.define('Notification', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      userType: {
        type: DataTypes.ENUM('doctor', 'patient'),
        allowNull: false
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'notifications',
      timestamps: false
    });
  
    module.exports = { Notification };
  