# Mini-Projet Full Stack (Rattrapage Fil Rouge Mobile)

Application simple d'authentification et de consultation d'utilisateurs avec un backend Node.js / Express / PostgreSQL et un mobile React Native / Expo.

---

## 1. Démarrage du Backend

### Étape 1 : Se placer dans le dossier backend
```bash
cd backend
```

### Étape 2 : Installer les dépendances
```bash
npm install
```

### Étape 3 : Configurer la base de données PostgreSQL et le `.env`
Assurez-vous que PostgreSQL est lancé sur votre machine et qu'une base de données existe (par exemple nommée `postgres`).
Le fichier `.env` à la racine de `backend/` doit contenir vos identifiants :
```env
PORT=5000
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=ma_cle_secrete_jwt
```

### Étape 4 : Lancer le serveur backend
```bash
npm run dev
```
Le serveur s'exécute sur `http://localhost:5000`.

---

## 2. Démarrage de l'Application Mobile

### Étape 1 : Se placer dans le dossier mobile
```bash
cd mobile
```

### Étape 2 : Installer les dépendances
```bash
npm install
```

### Étape 3 : Configurer l'adresse IP du Backend
Ouvrez le fichier **`mobile/src/config.js`** :
```javascript
export const API_URL = "http://192.168.1.35:5000";
```
- **Émulateur Android** : laissez `http://10.0.2.2:5000`
- **Simulateur iOS ou Web** : mettez `http://localhost:5000`
- **Téléphone réel (Expo Go)** : remplacez par l'adresse IP locale de votre ordinateur (ex: `http://192.168.1.XX:5000`). Pour trouver votre adresse IP sur Windows, tapez `ipconfig` dans un terminal.

### Étape 4 : Lancer Expo
```bash
npx expo start
```
Scannez le QR code avec l'application **Expo Go** sur votre téléphone ou appuyez sur `a` pour lancer l'émulateur Android.
