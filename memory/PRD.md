# Amel Fit Coach - PRD

## Problème Original
Application de sport "Amel Fit Coach" / "Beauty Fit by Amel" pour accompagner les utilisateurs dans leur parcours fitness, avec un focus particulier sur le programme Ramadan.

## Utilisateurs Cibles
- Femmes actives cherchant des programmes de fitness adaptés
- Personnes souhaitant rester actives pendant le Ramadan
- Utilisateurs désirant suivre leur alimentation et leurs calories

## Fonctionnalités Principales

### ✅ Implémentées

#### Authentification
- Inscription/Connexion par email
- Connexion Google (Emergent Auth)
- Mode invité
- Récupération de mot de passe

#### Programme Ramadan Interactif
- Programme de 4 semaines de marche
- Détection de pas via accéléromètre (DeviceMotionEvent)
- Timer intégré avec feedback vibration/son
- Suivi de progression par séance

#### Compteur de Calories (NOUVEAU - 4 février 2026)
- Analyse de photo de repas par IA (GPT-4o)
- Calcul automatique des calories et macros
- Historique des repas
- Objectifs journaliers personnalisables
- Résumé quotidien avec graphique

#### Navigation & UI
- Barre de navigation inférieure (Programme, Progrès, Mon espace)
- Design rosé/corail cohérent
- Bannière d'accueil personnalisée
- Page de progression

#### Préparation App Store
- Configuration Capacitor pour iOS
- Icône et splash screen
- Guides de publication détaillés

### 🔄 En Cours / À Venir

#### P1 - Achats In-App (IAP)
- Services factices créés, implémentation réelle à faire
- Plugin Capacitor pour achats Apple

#### P2 - Notifications Push
- Simulation actuelle via setTimeout
- À remplacer par Firebase Cloud Messaging

#### P2 - Page Conseils
- Structure créée, contenu à ajouter

## Architecture Technique

```
/app/
├── backend/
│   ├── server.py        # FastAPI - toutes les routes API
│   └── .env             # Configuration (MONGO_URL, JWT_SECRET, EMERGENT_LLM_KEY)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CalorieTracker.jsx    # NOUVEAU
│   │   │   ├── ProgrammeRamadan.jsx
│   │   │   ├── Progres.jsx
│   │   │   └── Account.jsx
│   │   └── components/
│   │       └── BottomNavBar.jsx
│   └── capacitor.config.json
```

## Intégrations Tierces
- **Emergent LLM Key** : GPT-4o pour l'analyse d'images alimentaires
- **MongoDB** : Base de données
- **Stripe** : Paiements (configuré, prêt pour production)
- **Capacitor** : Conversion web → iOS native

## API Endpoints Clés

### Authentification
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/google

### Compteur de Calories
- POST /api/calories/analyze - Analyse photo de repas
- GET /api/calories/today - Résumé du jour
- GET /api/calories/history - Historique des repas
- GET /api/calories/goal - Objectif journalier
- PUT /api/calories/goal - Modifier objectif

### Utilisateur
- GET /api/user/profile
- PUT /api/user/profile
- GET /api/user/purchases
- GET /api/user/courses

## Credentials de Test
- Email: test@amelfit.com
- Password: test123

## Notes Techniques
- Le plugin Babel `visual-edits` est désactivé dans `craco.config.js` (contournement d'un bug de compilation)
- L'application nécessite un déploiement backend pour les fonctionnalités cloud (Google Auth, sauvegarde données)
