# Beautyfit By Amel - PRD

## Problème Original
Application de sport "Beautyfit By Amel" pour accompagner les utilisateurs dans leur parcours fitness, avec un focus particulier sur le programme Ramadan et le suivi nutritionnel.

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
- Option "Rester connectée"
- **Messages d'erreur en français** (Email ou mot de passe incorrect, etc.)

#### Programme Ramadan Interactif (22€)
- Programme de 4 semaines de marche
- Détection de pas via accéléromètre (DeviceMotionEvent)
- Timer intégré avec feedback vibration/son
- Suivi de progression par séance
- **Verrouillage du contenu** pour les non-acheteurs

#### Système de Paiement (Stripe) ✅ NOUVEAU
- Page de checkout complète (`/programme/checkout`)
- Intégration Stripe avec `emergentintegrations`
- **Méthodes de paiement** : Carte bancaire + Apple Pay/Google Pay via Link
- Gestion des achats et accès au contenu
- Page de succès de paiement
- Messages d'erreur traduits en français

#### Compteur de Calories (GPT-4o)
- Analyse de photo de repas par IA
- Analyse par texte (description du repas)
- Calcul automatique des calories et macros
- Historique des repas
- Objectifs journaliers personnalisables
- Questionnaire de profil calorique personnalisé

#### Suivi des Progrès
- Statistiques réelles (pas, sessions, calories)
- Compteur de calories du jour
- Historique des sessions de sport

#### Navigation & UI
- Barre de navigation inférieure (Accueil, Programme, Progrès, Mon espace)
- Design rosé/corail cohérent
- Logo Beautyfit intégré partout

### 🔄 À Venir / Backlog

#### P0 - Achats In-App (IAP) Apple
- Services factices créés (`InAppPurchaseService.js`)
- À implémenter avec plugin Capacitor pour version mobile

#### P1 - Notifications Push
- Simulation actuelle via setTimeout
- À remplacer par Firebase Cloud Messaging

#### P2 - Page Conseils
- Structure créée, contenu à ajouter

#### P2 - Corrections techniques
- Bugs mineurs du rapport de test `iteration_1.json` (code HTTP 403→401, data-testid manquants)
- Plugin Babel `visual-edits` désactivé

## Architecture Technique

```
/app/
├── backend/
│   ├── server.py        # FastAPI - toutes les routes API
│   └── .env             # MONGO_URL, JWT_SECRET, STRIPE_API_KEY, EMERGENT_LLM_KEY
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CalorieTracker.jsx
│   │   │   ├── CalorieProfile.jsx
│   │   │   ├── ProgrammeRamadan.jsx
│   │   │   ├── ProgrammeCheckout.jsx  # Page de paiement
│   │   │   ├── PaymentSuccess.jsx
│   │   │   ├── Progres.jsx
│   │   │   └── Account.jsx
│   │   ├── lib/utils.js              # API helper avec traduction d'erreurs
│   │   └── components/
│   │       └── BottomNavBar.jsx
│   └── capacitor.config.json
```

## Intégrations Tierces
- **Emergent LLM Key** : GPT-4o pour l'analyse d'images/texte alimentaires
- **MongoDB** : Base de données
- **Stripe** : Paiements web (Carte + Link pour Apple Pay/Google Pay)
- **Capacitor** : Conversion web → iOS native

## API Endpoints Clés

### Paiements
- POST /api/payments/stripe/checkout - Créer session Stripe
- GET /api/payments/stripe/status/{session_id} - Vérifier statut
- POST /api/webhook/stripe - Webhook Stripe

### Programmes
- POST /api/init-ramadan-course - Initialiser le cours Ramadan
- GET /api/courses/{course_id}/access - Vérifier accès

### Authentification
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/google

### Calories
- POST /api/calories/analyze - Analyse repas (photo ou texte)
- POST /api/calories/calculate-needs - Calcul besoins personnalisés
- GET /api/calories/today
- GET /api/calories/history

## Notes Techniques
- Le cours "prog_ramadan" doit être initialisé via `/api/init-ramadan-course`
- PayPal n'est pas activé sur le compte Stripe de test
- Apple Pay/Google Pay disponibles via Stripe Link
- Messages d'erreur traduits automatiquement en français via HTTP status codes

## Dernière mise à jour
5 février 2026 - Intégration paiement Stripe complète + Mode arrière-plan

## Changelog récent
### 5 février 2026
- ✅ Mode arrière-plan pour comptage des pas (Wake Lock API + visibilitychange)
- ✅ Redirection après paiement vers "Mon espace > Achats" au lieu de la vidéo
- ✅ Bouton "Accéder au programme Ramadan" dans les achats
- ✅ Messages d'erreur traduits en français
- ✅ Stripe Checkout fonctionnel avec Carte bancaire + Apple Pay/Google Pay
