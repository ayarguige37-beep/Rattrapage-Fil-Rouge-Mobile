const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

// Création de l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Déclaration des routes
app.use("/", authRoutes);
app.use("/", userRoutes);

// Route d'accueil simple pour tester
app.get("/", (req, res) => {
  res.send("API fonctionnelle !");
});

// Connexion à la base de données et démarrage du serveur
const startServer = async () => {
  try {
    await sequelize.sync();
    console.log("Base de données synchronisée avec succès.");

    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("Erreur de connexion à la base de données :", error.message);
  }
};

startServer();
