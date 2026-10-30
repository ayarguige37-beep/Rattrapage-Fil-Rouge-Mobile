const express = require("express");
const router = express.Router();
const { getUsers } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// Route GET /users protégée par le middleware d'authentification
router.get("/users", authMiddleware, getUsers);

module.exports = router;
