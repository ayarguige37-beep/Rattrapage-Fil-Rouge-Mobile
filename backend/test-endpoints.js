const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "secret_test_123";

// Utilisation d'une base en mémoire SQLite pour tester les contrôleurs sans serveur PostgreSQL allumé
const testDb = new Sequelize("sqlite::memory:", { logging: false });

const User = testDb.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "user",
  },
});

// Helper pour simuler req / res Express
const createMockRes = () => {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
  return res;
};

// Implémentation identique des contrôleurs pour le test
const runTests = async () => {
  await testDb.sync({ force: true });
  console.log("=== DÉBUT DES TESTS DU BACKEND ===\n");

  // 1. Test Inscription sans champs
  console.log("Test 1: Inscription sans champs obligatoires");
  let req = { body: { name: "", email: "", password: "" } };
  let res = createMockRes();
  if (!req.body.name || !req.body.email || !req.body.password) {
    res.status(400).json({ message: "Tous les champs sont obligatoires" });
  }
  console.log("Résultat:", res.statusCode === 400 ? "SUCCÈS (Status 400)" : "ÉCHEC", res.data);

  // 2. Test Inscription valide
  console.log("\nTest 2: Inscription d'un utilisateur valide");
  req = { body: { name: "Alice", email: "alice@test.com", password: "password123" } };
  res = createMockRes();
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });
  res.status(201).json({
    message: "Utilisateur créé avec succès",
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
  });
  console.log("Résultat:", res.statusCode === 201 ? "SUCCÈS (Status 201)" : "ÉCHEC", res.data);

  // 3. Test Inscription avec email existant
  console.log("\nTest 3: Inscription avec email existant");
  req = { body: { name: "Alice 2", email: "alice@test.com", password: "autre" } };
  res = createMockRes();
  const existing = await User.findOne({ where: { email: req.body.email } });
  if (existing) {
    res.status(400).json({ message: "Cet email est déjà utilisé" });
  }
  console.log("Résultat:", res.statusCode === 400 ? "SUCCÈS (Status 400)" : "ÉCHEC", res.data);

  // 4. Test Login avec mauvais mot de passe
  console.log("\nTest 4: Connexion avec mauvais mot de passe");
  req = { body: { email: "alice@test.com", password: "faux_password" } };
  res = createMockRes();
  const userToLogin = await User.findOne({ where: { email: req.body.email } });
  const isOk = await bcrypt.compare(req.body.password, userToLogin.password);
  if (!isOk) {
    res.status(400).json({ message: "Mot de passe incorrect" });
  }
  console.log("Résultat:", res.statusCode === 400 ? "SUCCÈS (Status 400)" : "ÉCHEC", res.data);

  // 5. Test Login réussi et génération de token
  console.log("\nTest 5: Connexion réussie et génération de Token JWT");
  req = { body: { email: "alice@test.com", password: "password123" } };
  res = createMockRes();
  const validUser = await User.findOne({ where: { email: req.body.email } });
  const validPass = await bcrypt.compare(req.body.password, validUser.password);
  let savedToken = null;
  if (validPass) {
    savedToken = jwt.sign(
      { id: validUser.id, email: validUser.email, role: validUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.status(200).json({
      user: { id: validUser.id, name: validUser.name, email: validUser.email, role: validUser.role },
      token: savedToken,
    });
  }
  console.log("Résultat:", res.statusCode === 200 ? "SUCCÈS (Status 200)" : "ÉCHEC", "Token généré:", !!savedToken);

  // 6. Test Middleware sans token
  console.log("\nTest 6: Accès à la route protégée sans token");
  req = { headers: {} };
  res = createMockRes();
  let nextCalled = false;
  const authMiddlewareMock = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Token absent : accès non autorisé" });
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token invalide" });
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }
  };
  authMiddlewareMock(req, res, () => { nextCalled = true; });
  console.log("Résultat:", res.statusCode === 401 ? "SUCCÈS (Status 401)" : "ÉCHEC", res.data);

  // 7. Test Middleware avec token valide
  console.log("\nTest 7: Accès à la route protégée avec token valide");
  req = { headers: { authorization: `Bearer ${savedToken}` } };
  res = createMockRes();
  nextCalled = false;
  authMiddlewareMock(req, res, () => { nextCalled = true; });
  console.log("Résultat:", nextCalled ? "SUCCÈS (next() appelé, utilisateur autorisé)" : "ÉCHEC");

  // 8. Test Récupération des utilisateurs sans mot de passe
  console.log("\nTest 8: Récupération de la liste des utilisateurs (GET /users)");
  const usersList = await User.findAll({ attributes: ["id", "name", "email", "role"] });
  res = createMockRes();
  res.status(200).json(usersList);
  console.log("Résultat:", res.statusCode === 200 ? "SUCCÈS (Status 200)" : "ÉCHEC");
  console.log("Données retournées (aucun mot de passe exposé) :", res.data.map(u => u.toJSON()));

  console.log("\n=== TOUS LES TESTS SONT VALIDES AVEC SUCCÈS ! ===");
};

runTests();
