# 🚀 GUIDE DE PUBLICATION APP STORE - BEAUTYFIT BY AMEL

## ✅ CHECKLIST PRÉ-PUBLICATION

### 1. Compte Apple Developer
- [ ] Compte Apple Developer actif (99€/an) - [developer.apple.com](https://developer.apple.com)
- [ ] Certificat de distribution iOS créé
- [ ] Identifiant d'app (App ID) créé : `com.beautyfit.amel`
- [ ] Profil de provisioning de distribution créé

### 2. App Store Connect
- [ ] Nouvelle app créée dans App Store Connect
- [ ] Bundle ID : `com.beautyfit.amel`
- [ ] SKU : `beautyfitbyamel2025`

### 3. Achats In-App (IAP)
- [ ] Produit créé : `com.beautyfit.amel.programme.ramadan` (Non-consumable, 22€)
- [ ] Informations de localisation remplies (titre, description)
- [ ] Screenshot de l'achat In-App ajouté

---

## 📱 ÉTAPES DE BUILD

### Étape 1 : Télécharger le code
Cliquez sur **"Télécharger le code"** dans l'interface Emergent.

### Étape 2 : Préparer l'environnement (Mac requis)
```bash
# Installer les dépendances
cd ~/Downloads/votre-projet/frontend
yarn install

# Builder l'application
yarn build

# Ajouter iOS (première fois seulement)
npx cap add ios

# Synchroniser le code
npx cap sync ios
```

### Étape 3 : Copier les fichiers iOS requis
```bash
# Copier le Privacy Manifest (requis iOS 17+)
cp ios-assets/PrivacyInfo.xcprivacy ios/App/App/

# Copier les icônes (si pas déjà fait)
cp -r ios-assets/AppIcon.appiconset ios/App/App/Assets.xcassets/
```

### Étape 4 : Ouvrir dans Xcode
```bash
npx cap open ios
```

### Étape 5 : Configuration Xcode

1. **Sélectionner l'équipe de développement**
   - Cliquez sur le projet "App" dans le navigateur
   - Onglet "Signing & Capabilities"
   - Sélectionnez votre équipe Apple Developer

2. **Vérifier les permissions** (Info.plist)
   ```xml
   <key>NSMotionUsageDescription</key>
   <string>Beautyfit utilise les capteurs de mouvement pour compter vos pas pendant les séances de marche.</string>
   
   <key>NSCameraUsageDescription</key>
   <string>Beautyfit utilise l'appareil photo pour analyser vos repas et calculer les calories.</string>
   
   <key>NSPhotoLibraryUsageDescription</key>
   <string>Beautyfit accède à vos photos pour analyser vos repas.</string>
   ```

3. **Ajouter les Capabilities requises**
   - In-App Purchase ✅
   - Background Modes > Motion & Fitness ✅

4. **Ajouter le Privacy Manifest**
   - Glissez `PrivacyInfo.xcprivacy` dans le dossier App dans Xcode
   - Cochez "Copy items if needed"

### Étape 6 : Archiver et soumettre

1. **Sélectionner le bon schéma**
   - Sélectionnez "Any iOS Device (arm64)" comme destination

2. **Product → Archive**
   - Attendez la fin de l'archivage

3. **Distribute App**
   - Choisissez "App Store Connect"
   - Suivez les étapes de validation

---

## 📝 INFORMATIONS APP STORE CONNECT

### Informations générales
| Champ | Valeur |
|-------|--------|
| Nom | Beautyfit By Amel |
| Sous-titre | Ton coach fitness personnel |
| Catégorie | Santé et forme |
| Catégorie secondaire | Style de vie |
| Classification | 4+ |

### Description (copier-coller)
```
Beautyfit By Amel - Ton coach fitness personnel 💪

Découvre des programmes d'entraînement adaptés à ton rythme de vie, conçus spécialement pour les femmes actives qui veulent prendre soin d'elles.

🌙 PROGRAMME RAMADAN - "Aller bien, même à jeun"
Un programme unique de 4 semaines spécialement conçu pour rester en forme pendant le Ramadan :
• Marche rapide & fractionnés adaptés au jeûne
• 30 minutes par séance, 2-3x par semaine
• Timer guidé avec vibrations ou son
• Compteur de pas automatique
• Respect du jeûne et de la fatigue
• Intensité progressive sur 4 semaines

📸 COMPTEUR DE CALORIES INTELLIGENT
Révolutionne ta façon de suivre ton alimentation :
• Prends simplement une photo de ton repas
• L'IA analyse automatiquement les aliments
• Obtiens les calories et macros en quelques secondes
• Suis ta progression quotidienne
• Définis tes objectifs personnalisés

✨ FONCTIONNALITÉS INCLUSES
• Programmes interactifs avec timer intégré
• Vibrations motivantes à chaque pas
• Choix entre feedback sonore ou vibrations
• Suivi de progression détaillé
• Mode arrière-plan (les pas comptent même écran verrouillé)

Rejoins la communauté Beautyfit et transforme ton quotidien, un pas à la fois !

Chaque pas compte vers ta meilleure version ✨
```

### Mots-clés
```
fitness,femme,sport,ramadan,marche,coaching,santé,bien-être,calories,maman
```

### URLs
| Type | URL |
|------|-----|
| Support | https://beautyfitbyamel.com/support |
| Marketing | https://beautyfitbyamel.com |
| Confidentialité | https://beautyfitbyamel.com/confidentialite |

---

## 🖼️ CAPTURES D'ÉCRAN REQUISES

### Dimensions
- **iPhone 6.7"** (iPhone 15 Pro Max) : 1290 x 2796 px
- **iPhone 6.5"** (iPhone 11 Pro Max) : 1284 x 2778 px
- **iPhone 5.5"** (iPhone 8 Plus) : 1242 x 2208 px (optionnel)

### Écrans à capturer
1. **Page d'accueil** - Dashboard avec les programmes
2. **Programme Ramadan** - Écran avec les semaines
3. **Session en cours** - Timer avec compteur de pas
4. **Compteur de calories** - Interface d'analyse
5. **Page de résultats** - Analyse d'un repas

💡 **Astuce** : Utilisez le simulateur Xcode pour prendre des captures parfaites.

---

## 💰 CONFIGURATION ACHAT IN-APP

### Dans App Store Connect > Fonctionnalités > Achats In-App

| Champ | Valeur |
|-------|--------|
| Type | Non-consumable |
| ID de référence | programme_ramadan |
| ID produit | com.beautyfit.amel.programme.ramadan |
| Prix | Niveau 4 (22,99 €) |

### Localisations
**Français :**
- Nom : Programme Ramadan Marche
- Description : 4 semaines de marche adaptée au jeûne - Accès illimité à vie

---

## ⚠️ POINTS D'ATTENTION REVIEW

1. **Pas de mention de paiements externes**
   - Ne mentionnez pas Stripe ou PayPal dans l'app iOS
   - Utilisez uniquement les achats In-App d'Apple

2. **Privacy Manifest obligatoire**
   - Le fichier `PrivacyInfo.xcprivacy` doit être inclus

3. **Descriptions des permissions**
   - Toutes les permissions doivent avoir une description claire en français

4. **Test de l'app**
   - Testez sur un vrai appareil avant soumission
   - Vérifiez le comptage des pas
   - Testez l'achat In-App en sandbox

---

## 📞 SUPPORT

En cas de problème avec la review, contactez :
- **Email** : contact@beautyfitbyamel.com
- **Téléphone** : +33 X XX XX XX XX

---

Bonne publication ! 🎉 L'équipe Beautyfit By Amel
