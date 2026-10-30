const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Fonction pour inscrire un nouvel utilisateur
const register = async (req, res) => {
  try {
    // 1. Récupérer name, email et password depuis le corps de la requête
    const { name, email, password } = req.body;

    // 2. Vérifier les champs manquants avec un simple if
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    // 3. Chercher si l'utilisateur existe déjà avec cet email
    const existingUser = await User.findOne({ where: { email: email } });

    // 4. Retourner une erreur si l'email existe déjà
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // 5. Hasher le mot de passe avec bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Créer l'utilisateur dans la base de données
    const newUser = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    // 7. Retourner une réponse JSON sans le mot de passe
    return res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Fonction pour connecter un utilisateur existant
const login = async (req, res) => {
  try {
    // 1. Récupérer email et password depuis le corps de la requête
    const { email, password } = req.body;

    // 2. Vérifier les champs manquants
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe obligatoires" });
    }

    // 3. Chercher l'utilisateur avec son email
    const user = await User.findOne({ where: { email: email } });

    // 4. Si utilisateur introuvable -> retourner une erreur
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // 5. Comparer le mot de passe reçu avec le mot de passe hashé
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // 6. Si le mot de passe est incorrect -> retourner une erreur
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // 7. Créer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // 8. Retourner l'utilisateur (sans le mot de passe) et le token
    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = {
  register,
  login,
};
