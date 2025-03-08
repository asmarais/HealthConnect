const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST,
  dialect: 'mysql',
  logging: false, // Set to true to see SQL queries
});



const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected successfully');
    
    // Sync database models
    await sequelize.sync({ alter: true }); // Use { force: true } to reset tables
    console.log('Database synced');
    
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
