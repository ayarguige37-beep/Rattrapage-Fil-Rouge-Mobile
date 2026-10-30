# Guide Ultime de Révision pour le Jury

Ce document est conçu pour toi, débutante. Il t'explique chaque concept avec des mots simples du quotidien, détaille les trajets complets des requêtes et te donne les fiches pratiques pour modifier le code en direct devant le jury si on te le demande.

---

## 1. Trajets complets des flux (Data Flow)

### 🔵 Trajet 1 : REGISTER (Inscription)

1. **`TextInput`** : L'utilisateur tape son nom, son email et son mot de passe dans les champs à l'écran.
2. **`handleRegister`** : Quand l'utilisateur clique sur "S'inscrire", cette fonction se déclenche et vérifie d'abord avec un `if` que les champs ne sont pas vides.
3. **`Axios POST /register`** : Axios envoie les données par le réseau HTTP vers le serveur backend (`http://.../register`).
4. **`route Express` (`authRoutes.js`)** : Express intercepte la requête `POST /register` et l'envoie vers la fonction correspondante : le contrôleur.
5. **`controller` (`authController.js`)** : Le contrôleur vérifie que les données sont là et interroge la base de données.
6. **`User model / PostgreSQL`** : Le modèle `User.findOne({ where: { email } })` vérifie si l'email existe déjà. Si oui, erreur 400.
7. **`bcrypt`** : `bcrypt.hash(password, 10)` transforme le mot de passe clair en une chaîne indéchiffrable (hash). Puis `User.create(...)` enregistre l'utilisateur en base.
8. **`res.json`** : Le serveur renvoie une réponse JSON avec le code 201 (Créé) contenant le nouvel utilisateur (sans son mot de passe). Le mobile reçoit la réponse et affiche une `Alert` de succès avant de naviguer vers `Login`.

---

### 🟢 Trajet 2 : LOGIN (Connexion)

1. **`TextInput`** : L'utilisateur saisit son email et son mot de passe.
2. **`handleLogin`** : La fonction se déclenche lors du clic sur "Se connecter" et contrôle que les deux champs sont saisis.
3. **`Axios POST /login`** : Envoi de l'objet `{ email, password }` au backend.
4. **`route` (`authRoutes.js`)** : La route redirige vers la fonction `login` du contrôleur.
5. **`controller` (`authController.js`)** : Récupère les données envoyées dans `req.body`.
6. **`recherche utilisateur`** : `User.findOne({ where: { email } })` recherche l'utilisateur en base PostgreSQL. S'il n'existe pas -> erreur 404 "Utilisateur introuvable".
7. **`bcrypt.compare`** : Compare le mot de passe tapé avec le mot de passe hashé en base. Si faux -> erreur 400 "Mot de passe incorrect".
8. **`jwt.sign`** : Le mot de passe est bon ! Le serveur fabrique un jeton JWT contenant `{ id, email, role }` signé avec la clé secrète `JWT_SECRET`.
9. **`res.json`** : Le serveur renvoie `{ user, token }`.
10. **`Zustand`** : L'application mobile appelle `setUser(user)` pour mémoriser l'utilisateur dans l'état global.
11. **`SecureStore`** : L'application mobile fait `SecureStore.setItemAsync('userToken', token)` pour sauvegarder le token de manière chiffrée sur le téléphone.
12. **`navigation`** : `navigation.navigate('users')` bascule l'affichage sur la liste des utilisateurs.

---

### 🟣 Trajet 3 : USERS (Liste protégée)

1. **`useEffect`** : Dès que l'écran `UsersScreen` s'affiche, `useEffect` se déclenche une fois automatiquement.
2. **`fetchUsers`** : Fonction asynchrone appelée par le `useEffect`.
3. **`SecureStore` / `token`** : `SecureStore.getItemAsync('userToken')` lit le token stocké dans la mémoire sécurisée du téléphone.
4. **`Axios GET /users`** : Axios prépare la requête HTTP et ajoute l'en-tête :
   `Authorization: Bearer <token>`
5. **`middleware` (`authMiddleware.js`)** : Avant d'arriver au contrôleur, la requête passe par ce gardien.
6. **`jwt.verify`** : Le middleware extrait le token et appelle `jwt.verify(token, JWT_SECRET)`.
   - Si le token est absent ou invalide : il stoppe tout et renvoie 401 (Non autorisé).
   - Si le token est valide : il appelle `next()` pour laisser passer la requête vers le contrôleur.
7. **`controller` (`userController.js`)** : Reçoit la requête validée.
8. **`User.findAll`** : Sequelize exécute un `SELECT id, name, email, role FROM Users` pour récupérer tous les utilisateurs sans exposer les mots de passe.
9. **`réponse`** : Le serveur renvoie le tableau des utilisateurs au format JSON.
10. **`setUsers`** : Le mobile reçoit le tableau et met à jour l'état local : `setUsers(response.data)`.
11. **`FlatList`** : React Native re-dessine l'écran et affiche chaque utilisateur dans une jolie carte.

---

## 2. Le Lexique pour le Jury (Explications simples)

### 💻 JavaScript

- **`variable`** : Une boîte avec une étiquette dans laquelle on stocke une information pour la réutiliser.
- **`const`** : Une variable dont la valeur ne peut **pas** être réassignée (constante).
- **`let`** : Une variable dont la valeur **peut** être modifiée plus tard.
- **`fonction`** : Un bloc d'instructions réutilisable qui effectue une action précise (comme une recette).
- **`paramètre`** : Une valeur qu'on donne en entrée à une fonction pour qu'elle puisse travailler avec (ex: `req, res`).
- **`objet`** : Une structure qui regroupe des informations sous forme de paires clé / valeur, entourée d'accolades `{ name: "Alice", role: "user" }`.
- **`tableau`** : Une liste ordonnée d'éléments, entourée de crochets `[ "pomme", "banane" ]` ou `[ { id: 1 }, { id: 2 } ]`.
- **`if`** : Une condition : "SI cette condition est vraie, exécute ce code, SINON passe à la suite".
- **`map`** : Une méthode de tableau qui transforme chaque élément un par un pour créer un nouveau tableau.
- **`Promise`** : Une promesse en JavaScript représentant le résultat futur d'une opération asynchrone (en attente, réussie ou échouée).
- **`async`** : Mot-clé placé devant une fonction pour indiquer qu'elle contient des opérations asynchrones.
- **`await`** : Mot-clé qui met en pause l'exécution de la fonction jusqu'à ce que la promesse soit résolue (ex: attendre la réponse du serveur ou de la base).
- **`try / catch`** : `try` tente d'exécuter un code ; si une erreur survient, le programme ne plante pas et saute immédiatement dans le bloc `catch` pour traiter l'erreur proprement.

---

### 📱 React Native

- **`composant`** : Un morceau d'interface visuelle réutilisable (comme une fonction qui retourne du JSX).
- **`useState`** : Un hook React qui permet à un composant de mémoriser une donnée locale. Quand cette donnée change, l'écran se met à jour automatiquement.
- **`useEffect`** : Un hook qui permet d'exécuter du code au moment où le composant apparaît à l'écran (chargement initial).
- **`props`** : Les paramètres passés d'un composant parent à un composant enfant (ex: `navigation`).
- **`TextInput`** : Le champ de saisie permettant à l'utilisateur de taper du texte au clavier.
- **`FlatList`** : Le composant optimisé de React Native pour faire défiler une liste d'éléments de manière fluide.
- **`Alert`** : La boîte de dialogue native du téléphone qui affiche un message d'alerte ou d'erreur à l'utilisateur.
- **`navigation`** : Le mécanisme qui permet de basculer d'une vue à une autre dans l'application.

---

### ⚙️ Backend (Node.js & Express)

- **`Node.js`** : L'environnement d'exécution qui permet de faire tourner du code JavaScript côté serveur (en dehors du navigateur).
- **`Express`** : Un framework minimaliste pour Node.js permettant de créer facilement un serveur web et des routes HTTP.
- **`route`** : L'adresse URL et la méthode HTTP associées (ex: `POST /register`) qui définissent où envoyer une demande.
- **`controller`** : La fonction qui contient la logique métier (vérifier les données, appeler la base, calculer).
- **`middleware`** : Une fonction intermédiaire qui s'exécute **entre** la réception de la requête et le contrôleur (ex: vérifier le token de sécurité).
- **`model`** : La représentation en code de la table en base de données avec ses colonnes et ses types (avec Sequelize).
- **`req` (Request)** : L'objet représentant la requête envoyée par le client.
- **`req.body`** : Les données envoyées dans le corps de la requête (comme les identifiants envoyés en JSON).
- **`req.headers`** : Les en-têtes de la requête contenant les métadonnées (comme le token d'autorisation).
- **`res` (Response)** : L'objet utilisé par le serveur pour répondre au client.
- **`res.json(...)`** : La méthode qui renvoie des données au format JSON au client avec la réponse.
- **`GET`** : Méthode HTTP utilisée pour **récupérer** des données sans modifier le serveur.
- **`POST`** : Méthode HTTP utilisée pour **envoyer** de nouvelles données à enregistrer ou traiter.

---

### 🗄️ Base de données (PostgreSQL & Sequelize)

- **`table`** : Un tableau de la base de données composé de lignes (enregistrements) et de colonnes (champs).
- **`id`** : L'identifiant unique de chaque ligne.
- **`primaryKey`** : Clé primaire, garantit que cette colonne identifie de manière unique chaque enregistrement de la table.
- **`autoIncrement`** : Indique à la base de données d'incrémenter automatiquement le numéro d'ID à chaque nouvelle insertion (1, 2, 3...).
- **`allowNull`** : Définit si une colonne a le droit d'être vide (`true`) ou si elle est obligatoire (`false`).
- **`defaultValue`** : La valeur attribuée automatiquement par défaut si aucune valeur n'est fournie (ex: `"user"` pour le rôle).
- **`STRING`** : Type de données pour stocker du texte court (chaîne de caractères).
- **`unique`** : Règle garantissant qu'aucune valeur en double ne peut être insérée dans cette colonne (ex: deux comptes ne peuvent pas avoir le même email).
- **`foreign key`** : Clé étrangère, une colonne qui fait référence à la clé primaire d'une autre table pour relier deux tables entre elles.

---

### 🔒 Sécurité

- **`bcrypt`** : Une bibliothèque de hachage robuste conçue spécialement pour protéger les mots de passe.
- **`hash`** : Le résultat mathématique à sens unique du hachage. On ne peut pas "déchiffrer" un hash pour retrouver le mot de passe original.
- **`JWT` (JSON Web Token)** : Un jeton numérique sécurisé et signé permettant de prouver l'identité de l'utilisateur après sa connexion.
- **`token`** : La chaîne de caractères du JWT que le mobile envoie dans ses requêtes pour prouver qu'il est connecté.
- **Pourquoi le mot de passe n'est jamais stocké en clair ?** Si la base de données est piratée ou consultée par un administrateur malveillant, les vrais mots de passe des utilisateurs ne sont jamais exposés.
- **Pourquoi SecureStore pour le token sur mobile ?** Contrairement à un stockage classique (`AsyncStorage`), `SecureStore` utilise les puces matérielles sécurisées du téléphone (Keychain sur iOS, KeyStore sur Android) pour chiffrer le token et empêcher son vol par une autre application.

---

## 3. Fiches Pratiques : Modifications en Direct devant le Jury

Voici les 6 modifications classiques que le jury peut te demander de réaliser en direct :

---

### 🛠️ 1. Ajouter un champ `phone` au User

#### Fichier 1 : `backend/src/models/User.js`
Ajoute le champ dans la définition du modèle :
```javascript
  phone: {
    type: DataTypes.STRING,
    allowNull: true, // ou false si obligatoire
  },
```

#### Fichier 2 : `backend/src/controllers/authController.js`
Dans la fonction `register` :
1. Récupère le champ depuis `req.body` :
```javascript
const { name, email, password, phone } = req.body;
```
2. Ajoute-le dans la création de l'utilisateur :
```javascript
const newUser = await User.create({
  name: name,
  email: email,
  password: hashedPassword,
  phone: phone, // <-- Ajouté ici
});
```

---

### 🛠️ 2. Rendre `phone` obligatoire

#### Dans `backend/src/models/User.js` :
Passe `allowNull` à `false` :
```javascript
  phone: {
    type: DataTypes.STRING,
    allowNull: false, // <-- Obligatoire en base
  },
```

#### Dans `backend/src/controllers/authController.js` :
Ajoute `!phone` dans la vérification des champs :
```javascript
if (!name || !email || !password || !phone) {
  return res.status(400).json({ message: "Tous les champs sont obligatoires (nom, email, mot de passe, téléphone)" });
}
```

---

### 🛠️ 3. Ajouter `phone` dans l'écran Register Mobile

#### Fichier : `mobile/src/screens/RegisterScreen.js`
1. Ajoute un `useState` :
```javascript
const [phone, setPhone] = useState("");
```
2. Dans `handleRegister`, vérifie le champ et envoie-le avec Axios :
```javascript
if (!name || !email || !password || !phone) {
  Alert.alert("Erreur", "Tous les champs sont obligatoires");
  return;
}

await axios.post(`${API_URL}/register`, {
  name: name,
  email: email,
  password: password,
  phone: phone, // <-- Envoi à l'API
});
```
3. Ajoute le champ dans l'interface visuelle :
```javascript
<Text style={styles.label}>Téléphone</Text>
<TextInput
  style={styles.input}
  placeholder="Ex: 0612345678"
  value={phone}
  onChangeText={setPhone}
  keyboardType="phone-pad"
/>
```

---

### 🛠️ 4. Ajouter une nouvelle erreur personnalisée

Exemple : Vérifier que le mot de passe fait au moins 6 caractères.

#### Fichier : `backend/src/controllers/authController.js`
Dans `register` :
```javascript
if (password.length < 6) {
  return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
}
```

---

### 🛠️ 5. Protéger une nouvelle route avec `authMiddleware`

Exemple : Créer une route `GET /profile` protégée.

#### Fichier : `backend/src/routes/userRoutes.js`
Ajoute simplement la route en insérant `authMiddleware` en deuxième paramètre :
```javascript
router.get("/profile", authMiddleware, (req, res) => {
  // req.user a été ajouté par authMiddleware !
  return res.status(200).json({
    message: "Voici votre profil",
    user: req.user,
  });
});
```

---

### 🛠️ 6. Ajouter un champ dans la FlatList (ex: `role` ou `phone`)

#### Fichier 1 (Backend) : `backend/src/controllers/userController.js`
Assure-toi que l'attribut est bien sélectionné :
```javascript
const users = await User.findAll({
  attributes: ["id", "name", "email", "role", "phone"], // <-- phone ajouté
});
```

#### Fichier 2 (Mobile) : `mobile/src/screens/UsersScreen.js`
Dans la fonction `renderUserItem` :
```javascript
const renderUserItem = ({ item }) => (
  <View style={styles.card}>
    <Text style={styles.userName}>{item.name}</Text>
    <Text style={styles.userEmail}>Email : {item.email}</Text>
    <Text style={styles.userRole}>Rôle : {item.role}</Text>
    {item.phone && <Text style={styles.userEmail}>Tél : {item.phone}</Text>}
  </View>
);
```
