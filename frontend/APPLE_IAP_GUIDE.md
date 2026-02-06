# Guide d'Implémentation Apple In-App Purchase (IAP)

## Configuration Actuelle

L'application Beautyfit est maintenant configurée pour gérer les achats in-app Apple. Voici les étapes pour finaliser l'intégration :

## Étapes Déjà Complétées ✅

1. **Plugin cordova-plugin-purchase** installé (v13.13.0)
2. **Service InAppPurchaseService.js** mis à jour avec :
   - Gestion des achats réels via StoreKit
   - Vérification backend des transactions
   - Restauration des achats
   - Mode mock pour le développement web

3. **Routes backend** créées :
   - `POST /api/purchases/apple/verify` - Vérification des achats
   - `POST /api/purchases/apple/restore` - Restauration des achats
   - `GET /api/purchases/apple/status/{product_id}` - Statut d'un achat

## Configuration Requise dans App Store Connect

### 1. Créer le produit In-App Purchase

1. Connectez-vous à [App Store Connect](https://appstoreconnect.apple.com)
2. Sélectionnez votre app "Beautyfit By Amel"
3. Dans le menu latéral, cliquez sur **Monétisation > Achats intégrés**
4. Cliquez sur **+** pour créer un nouvel achat
5. Sélectionnez **Non-consommable**
6. Remplissez les informations :

| Champ | Valeur |
|-------|--------|
| Nom de référence | Programme Ramadan Marche |
| Identifiant du produit | `com.beautyfit.amel.programme.ramadan` |
| Prix | Niveau de prix 17 (≈ 21,99 €) |

7. Ajoutez une localisation (Français) :
   - **Nom affiché** : Programme Ramadan Marche
   - **Description** : Accès complet au programme de marche Ramadan avec 4 semaines de contenu, compteur de pas automatique et suivi de progression.

8. **Important** : Attendez que le statut passe à "Prêt à soumettre" (peut prendre 1h)

### 2. Créer un compte Sandbox Testeur

1. Dans App Store Connect, allez dans **Utilisateurs et accès > Testeurs Sandbox**
2. Cliquez sur **+** pour créer un nouveau testeur
3. Remplissez avec :
   - Email : Une nouvelle adresse email (ex: `test.beautyfit@gmail.com`)
   - Mot de passe : Un mot de passe sécurisé
   - Pays : France

⚠️ **Important** : L'email ne doit PAS être déjà associé à un Apple ID existant !

### 3. Configurer le testeur sur votre iPhone

1. Sur votre iPhone, allez dans **Réglages > App Store**
2. Descendez jusqu'à **Compte Sandbox**
3. Connectez-vous avec le compte testeur créé

### 4. Compiler et tester l'application

```bash
# Sur votre Mac, dans le dossier du projet :
cd ~/beautyfit-app

# Synchroniser avec Capacitor
npx cap sync ios

# Ouvrir dans Xcode
npx cap open ios
```

Dans Xcode :
1. Sélectionnez votre iPhone connecté comme destination
2. Compilez et lancez l'application (⌘+R)
3. Testez l'achat - vous serez invité à vous connecter avec le compte Sandbox

## Test du Flux d'Achat

1. Lancez l'app sur votre iPhone via Xcode
2. Allez sur **Programme** puis **Acheter**
3. Cliquez sur **Payer 22,00 €**
4. Le système affichera la boîte de dialogue Apple
5. Confirmez avec le compte Sandbox
6. L'achat sera vérifié avec le backend
7. Vérifiez l'accès dans **Mon espace > Achats**

## Structure du Code

```
frontend/
├── src/
│   ├── services/
│   │   ├── InAppPurchaseService.js  # Service IAP principal
│   │   └── PlatformService.js        # Détection plateforme
│   └── pages/
│       └── ProgrammeCheckout.jsx     # Page de paiement

backend/
└── server.py                         # Routes /api/purchases/apple/*
```

## Notes Importantes

### Différence Web vs iOS

| Plateforme | Méthode de paiement |
|------------|---------------------|
| Web (navigateur) | Stripe (carte bancaire) |
| iOS (app native) | Apple In-App Purchase |

Le service `PlatformService.js` détecte automatiquement la plateforme et sélectionne la bonne méthode de paiement.

### Validation Production

Pour une validation complète en production, vous devrez :

1. Obtenir une **clé API App Store Connect** dans :
   - App Store Connect > Utilisateurs et accès > Clés API d'intégration

2. Implémenter la vérification serveur-à-serveur avec l'API Apple :
   - Endpoint: `https://api.storekit.itunes.apple.com/inApps/v1/transactions/{transactionId}`
   - Authentification: JWT signé avec votre clé privée

Pour l'instant, la vérification fait confiance à la transaction (suffisant pour TestFlight et les premiers tests).

## Problèmes Courants

### "Produit introuvable"
- Vérifiez que l'identifiant produit est exactement `com.beautyfit.amel.programme.ramadan`
- Attendez 1h après la création du produit dans App Store Connect
- Vérifiez que la capacité "In-App Purchase" est activée dans Xcode

### "Achat impossible"
- Connectez-vous avec un compte Sandbox (pas votre vrai Apple ID)
- Vérifiez les "Agreements, Tax, and Banking" dans App Store Connect

### L'achat réussit mais pas d'accès
- Vérifiez que le token d'authentification est valide
- Consultez les logs backend : `tail -f /var/log/supervisor/backend.err.log`
