const express = require('express');
const cors = require('cors');
require('dotenv').config();

const {connectDB} = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

const { User, Role } = require('./models/userModel'); 

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MySQL
connectDB();

// Function to create admin if not exists
const createAdmin = async () => {
  try {
    await User.sync(); // Ensure table exists
    const adminExists = await User.findOne({ where: { role: Role.ADMIN } });

    if (!adminExists) {
      const defaultAdmin = await User.create({
        nom: 'Admin',
        prenom: 'User',
        email: 'admin@gmail.com',
        mot_de_passe: 'admin123', 
        numero_de_telephone: '1234567890',
        adresse: '123 Admin St., Admin City',
        cin: '123456789',
        role: Role.ADMIN,
      });

      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (err) {
    console.error('Error creating admin:', err);
  }
};

const { Doctor } = require('./models/doctorModel');

const syncDatabase = async () => {
  try {
    await User.sync();
    await Doctor.sync();
    console.log('Database tables synced successfully.');
  } catch (err) {
    console.error('Error syncing database:', err);
  }
};

syncDatabase().then(() => createAdmin());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/doctor', doctorRoutes);


app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
