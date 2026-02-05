# Beautyfit By Amel - PRD

## Problème Original
Application de sport "Beautyfit By Amel" pour accompagner les utilisateurs dans leur parcours fitness, avec un focus particulier sur le programme Ramadan et le suivi nutritionnel.

## Utilisateurs Cibles
- Femmes actives cherchant des programmes de fitness adaptés
- Personnes souhaitant rester actives pendant le Ramadan
- Utilisateurs désirant suivre leur alimentation et leurs calories

## ✅ FONCTIONNALITÉS IMPLÉMENTÉES

### Authentification
- Inscription/Connexion par email
- Connexion Google (Emergent Auth)
- Mode invité
- Récupération de mot de passe
- Option "Rester connectée"
- Messages d'erreur en français

### Programme Ramadan Interactif (22€)
- Programme de 4 semaines de marche
- Détection de pas via accéléromètre (DeviceMotionEvent)
- Timer intégré avec feedback vibration/son
- Suivi de progression par séance
- **MODE ARRIÈRE-PLAN** : Les pas continuent d'être comptés même écran verrouillé
- Wake Lock API pour garder l'écran allumé
- Verrouillage du contenu pour les non-acheteurs

### Système de Paiement
- **Web** : Stripe (Carte bancaire + Apple Pay/Google Pay via Link)
- **iOS** : Apple In-App Purchases (service préparé)
- Détection automatique de plateforme (PlatformService)
- Page de checkout complète
- Page de succès → redirection vers "Mon espace > Achats"

### Compteur de Calories (GPT-4o)
- Analyse de photo de repas par IA
- Analyse par texte (description du repas)
- Calcul automatique des calories et macros
- Historique des repas
- Objectifs journaliers personnalisables
- Questionnaire de profil calorique personnalisé

### Suivi des Progrès
- Statistiques réelles (pas, sessions, calories)
- Compteur de calories du jour
- Historique des sessions de sport

### Pages Légales (App Store Ready)
- Politique de confidentialité (`/confidentialite`)
- Conditions générales d'utilisation (`/conditions-generales`)
- Privacy Manifest iOS (`PrivacyInfo.xcprivacy`)

### Navigation & UI
- Barre de navigation inférieure (Accueil, Programme, Progrès, Mon espace)
- Design rosé/corail cohérent
- Logo Beautyfit intégré partout
- Liens légaux sur pages login/register

## 🔄 BACKLOG

### P1 - Achats In-App Apple (iOS)
- `InAppPurchaseService.js` préparé
- Produit IAP à créer dans App Store Connect : `com.beautyfit.amel.programme.ramadan`
- À activer lors du build iOS natif

### P2 - Notifications Push
- Simulation actuelle via setTimeout
- À remplacer par Firebase Cloud Messaging

### P2 - Page Conseils
- Structure créée, contenu à ajouter

## Architecture Technique

```
/app/
├── backend/
│   ├── server.py          # FastAPI - toutes les routes API
│   └── .env               # MONGO_URL, JWT_SECRET, STRIPE_API_KEY, EMERGENT_LLM_KEY
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CalorieTracker.jsx
│   │   │   ├── CalorieProfile.jsx
│   │   │   ├── ProgrammeRamadan.jsx
│   │   │   ├── ProgrammeCheckout.jsx
│   │   │   ├── PaymentSuccess.jsx
│   │   │   ├── Progres.jsx
│   │   │   ├── Account.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   └── TermsOfService.jsx
│   │   ├── services/
│   │   │   ├── InAppPurchaseService.js   # Apple IAP
│   │   │   └── PlatformService.js        # Détection plateforme
│   │   └── lib/utils.js                  # API helper + traductions
│   ├── ios-assets/
│   │   ├── PrivacyInfo.xcprivacy         # Privacy Manifest iOS 17+
│   │   └── AppIcon.appiconset/           # Icônes
│   ├── capacitor.config.json             # Config Capacitor
│   └── APP_STORE_PUBLICATION.md          # Guide complet publication
```

## Intégrations Tierces
- **Emergent LLM Key** : GPT-4o pour l'analyse d'images/texte
- **MongoDB** : Base de données
- **Stripe** : Paiements web
- **Apple IAP** : Paiements iOS (préparé)
- **Capacitor** : Conversion web → iOS native

## API Endpoints Clés

### Paiements
- POST /api/payments/stripe/checkout
- GET /api/payments/stripe/status/{session_id}
- POST /api/init-ramadan-course

### Authentification
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/google

### Calories
- POST /api/calories/analyze
- POST /api/calories/calculate-needs
- GET /api/calories/today

### Utilisateur
- GET /api/user/profile
- PUT /api/user/profile
- GET /api/user/purchases

## Notes Techniques
- Le cours "prog_ramadan" doit être initialisé via `/api/init-ramadan-course`
- PayPal non disponible (non activé sur compte Stripe)
- Apple Pay/Google Pay via Stripe Link sur web
- Messages d'erreur traduits automatiquement via HTTP status codes
- Wake Lock API pour garder l'écran allumé pendant l'exercice

## Préparation App Store
- ✅ Bundle ID : com.beautyfit.amel
- ✅ Privacy Manifest iOS 17+
- ✅ Pages légales accessibles
- ✅ Service IAP préparé
- ✅ Guide de publication complet

## Dernière mise à jour
5 février 2026 - Application prête pour l'App Store
