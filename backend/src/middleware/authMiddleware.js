const jwt = require("jsonwebtoken");

// Middleware pour protéger les routes avec un token JWT
const authMiddleware = (req, res, next) => {
  // 1. Récupérer le header Authorization
  const authHeader = req.headers["authorization"];

  // Si aucun header Authorization n'est envoyé
  if (!authHeader) {
    return res.status(401).json({ message: "Token absent : accès non autorisé" });
  }

  // 2. Extraire le token (format attendu : "Bearer TOKEN")
  const token = authHeader.split(" ")[1];

  // Si le token n'existe pas après "Bearer"
  if (!token) {
    return res.status(401).json({ message: "Token invalide : format incorrect" });
  }

  // 3. Vérifier le token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // On stocke les infos du token dans req.user

    // 4. Le token est bon, on continue vers le contrôleur
    next();
  } catch (error) {
    // 5. Token invalide ou expiré
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

module.exports = authMiddleware;
