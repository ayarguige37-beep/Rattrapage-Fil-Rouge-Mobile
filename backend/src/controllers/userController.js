const User = require("../models/User");

// Récupérer la liste de tous les utilisateurs (sans mot de passe)
const getUsers = async (req, res) => {
  try {
    // On sélectionne uniquement id, name, email et role
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role"],
    });

    // Retourner la liste au format JSON
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = {
  getUsers,
};
