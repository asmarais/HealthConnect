const express = require('express');
const cors = require('cors');
require('dotenv').config();
const session = require("express-session");
const passport = require("./oauth/google");

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes'); // 📌 Ajouter route Patient
const rendezVousRoutes = require('./routes/rendezVousRoutes'); // 📌 Ajouter route RendezVous
const notificationRoutes = require('./routes/notificationRoutes'); // 📌 Ajouter route Patient

const { User, Role } = require('./models/userModel'); 
const { Doctor } = require('./models/doctorModel'); // 📌 Déclaration unique
const { RendezVous } = require('./models/rendezVousModel'); // 📌 Déclaration unique
const { Notification } = require('./models/notificationModel'); // 📌 Déclaration unique

const { Patient } = require('./models/patientModel'); // 📌 Importer Patient
const { scheduleRappels } = require("./controllers/rendezVousController");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MySQL
connectDB();

// Function to create admin if not exists
const createAdmin = async () => {
  try {
    await User.sync();
    const adminExists = await User.findOne({ where: { role: Role.ADMIN } });

    if (!adminExists) {
      await User.create({
        nom: 'Admin',
        prenom: 'User',
        email: 'admin@gmail.com',
        mot_de_passe: 'admin123', 
        numero_de_telephone: '1234567890',
        adresse: '123 Admin St., Admin City',
        cin: '123456789',
        role: Role.ADMIN,
      });

      console.log('✅ Admin user created successfully.');
    } else {
      console.log('✅ Admin user already exists.');
    }
  } catch (err) {
    console.error('❌ Error creating admin:', err);
  }
};

// 📌 **Synchronisation complète de la base de données**
const syncDatabase = async () => {
  try {
    await User.sync();
    await Doctor.sync();
    await Patient.sync();
    await RendezVous.sync();
    await Notification.sync();
    console.log('✅ Database tables synced successfully.');
  } catch (err) {
    console.error('❌ Error syncing database:', err);
  }
};

// Exécuter la synchronisation puis créer l'admin
syncDatabase().then(() => createAdmin());
// Lancer la planification des rappels lors du démarrage du serveur
scheduleRappels();
// Configuration de la session
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// Initialisation de Passport
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes); // 📌 Ajouter la route Patient
app.use('/api/rendezvous', rendezVousRoutes); // 📌 Ajouter la route RendezVous
app.use('/api/notification', notificationRoutes); // 📌 Ajouter la route RendezVous

// Gestion des erreurs
app.use(errorHandler);



const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
