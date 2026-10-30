const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

// Route pour s'inscrire
router.post("/register", register);

// Route pour se connecter
router.post("/login", login);

module.exports = router;
