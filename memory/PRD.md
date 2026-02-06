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
- Récupération de mot de passe (via Resend)
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
- **Silhouettes animées** pour les phases de marche

### Système de Paiement
- **Web** : Stripe (Carte bancaire + Apple Pay/Google Pay via Link)
- **iOS** : Apple In-App Purchases (service fonctionnel)
- Détection automatique de plateforme (PlatformService)
- Page de checkout complète
- Page de succès → redirection vers "Mon espace > Achats"

### Apple In-App Purchase (IAP) - NOUVEAU ✅
- Service `InAppPurchaseService.js` complet
- Plugin `cordova-plugin-purchase` v13.13.0
- Routes backend de vérification:
  - `POST /api/purchases/apple/verify`
  - `POST /api/purchases/apple/restore`
  - `GET /api/purchases/apple/status/{product_id}`
- Product ID: `com.beautyfit.amel.programme.ramadan`
- Guide d'implémentation: `/app/frontend/APPLE_IAP_GUIDE.md`

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

### Emails Transactionnels (Resend)
- Intégration Resend pour mot de passe oublié
- Template HTML stylisé
- **NOTE**: Domaine beautyfitbyamel.fr en attente de vérification DNS

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

### P0 - En attente utilisateur
- ⏳ **Vérification DNS Resend**: Les emails ne sont pas envoyés car le domaine beautyfitbyamel.fr n'est pas encore vérifié sur Resend. L'utilisateur doit attendre la propagation DNS.

### P1 - Validation Apple Server-to-Server
- L'IAP fonctionne en "trust mode" (suffisant pour TestFlight)
- Pour production, implémenter la validation avec l'API Apple StoreKit Server

### P2 - Notifications Push
- Simulation actuelle via setTimeout
- À remplacer par Firebase Cloud Messaging

### P2 - Page Conseils
- Structure créée, contenu à ajouter

## Architecture Technique

```
/app/
├── backend/
│   ├── server.py          # FastAPI - toutes les routes API + Apple IAP
│   ├── .env               # MONGO_URL, JWT_SECRET, STRIPE_API_KEY, EMERGENT_LLM_KEY, RESEND_API_KEY
│   └── tests/             # Tests pytest
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
│   │   │   ├── Login.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   └── TermsOfService.jsx
│   │   ├── services/
│   │   │   ├── InAppPurchaseService.js   # Apple IAP (mis à jour)
│   │   │   └── PlatformService.js        # Détection plateforme
│   │   └── lib/utils.js                  # API helper + traductions
│   ├── ios-assets/
│   │   ├── PrivacyInfo.xcprivacy         # Privacy Manifest iOS 17+
│   │   └── AppIcon.appiconset/           # Icônes
│   ├── APPLE_IAP_GUIDE.md                # Guide IAP (nouveau)
│   ├── APP_STORE_PUBLICATION.md          # Guide complet publication
│   └── capacitor.config.json             # Config Capacitor
```

## Intégrations Tierces
- **Emergent LLM Key** : GPT-4o pour l'analyse d'images/texte
- **MongoDB** : Base de données
- **Stripe** : Paiements web
- **Apple IAP** : Paiements iOS (implémenté)
- **Resend** : Emails transactionnels (en attente vérification DNS)
- **Capacitor** : Conversion web → iOS native

## API Endpoints Clés

### Authentification
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/google
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

### Paiements
- POST /api/payments/stripe/checkout
- GET /api/payments/stripe/status/{session_id}
- POST /api/purchases/apple/verify (NOUVEAU)
- POST /api/purchases/apple/restore (NOUVEAU)
- GET /api/purchases/apple/status/{product_id} (NOUVEAU)

### Calories
- POST /api/calories/analyze
- POST /api/calories/calculate-needs
- GET /api/calories/today
- GET /api/calories/history
- GET /api/calories/goal
- PUT /api/calories/goal

### Utilisateur
- GET /api/user/profile
- PUT /api/user/profile
- GET /api/user/purchases
- GET /api/user/courses

## Comptes de Test
- **Demo**: demo@beautyfit.com / Demo2025!
- **Test**: test@amelfit.com / test123
- **Apple Sandbox**: test.beautyfit@gmail.com / Test1234!

## Notes Techniques
- Le cours "prog_ramadan" doit être initialisé via `/api/init-ramadan-course`
- Apple Pay/Google Pay via Stripe Link sur web
- Messages d'erreur traduits automatiquement via HTTP status codes
- Wake Lock API pour garder l'écran allumé pendant l'exercice

## Préparation App Store
- ✅ Bundle ID : com.beautyfit.amel
- ✅ Privacy Manifest iOS 17+
- ✅ Pages légales accessibles
- ✅ Service IAP implémenté
- ✅ Guide de publication complet
- ⏳ Vérification Apple en cours

## Dernière mise à jour
6 février 2026 - Implémentation complète Apple IAP et correction des bugs
