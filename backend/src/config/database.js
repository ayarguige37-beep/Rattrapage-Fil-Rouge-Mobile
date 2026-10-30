const { Sequelize } = require("sequelize");
require("dotenv").config();

// Configuration de la connexion Sequelize
// Si DB_DIALECT est postgres, on se connecte à PostgreSQL.
// Sinon, on utilise SQLite local (database.sqlite) pour tester immédiatement le projet sans avoir besoin d'un serveur PostgreSQL allumé.
const sequelize =
  process.env.DB_DIALECT === "postgres"
    ? new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT || 5432,
          dialect: "postgres",
          logging: false,
        }
      )
    : new Sequelize({
        dialect: "sqlite",
        storage: "./database.sqlite",
        logging: false,
      });

module.exports = sequelize;
