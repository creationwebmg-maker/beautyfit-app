# 📱 Guide de Publication App Store - Beautyfit By Amel

## 🎯 Informations de l'Application

- **Nom**: Beautyfit By Amel
- **Bundle ID**: com.beautyfit.amel
- **Catégorie principale**: Santé et fitness
- **Catégorie secondaire**: Style de vie
- **Classification**: 4+ (Pas de contenu répréhensible)

---

## ✅ Checklist Complète

### 1. Compte Développeur Apple
- [ ] Créer un compte Apple Developer (https://developer.apple.com)
- [ ] Payer l'abonnement annuel (99€/an)
- [ ] Configurer les informations légales (entreprise ou individuel)

### 2. Certificats et Profils
- [ ] Générer un certificat de distribution iOS
- [ ] Créer un App ID dans le portail développeur
- [ ] Créer un profil de provisioning pour la distribution

### 3. App Store Connect
- [ ] Créer l'application dans App Store Connect
- [ ] Configurer les métadonnées (voir section ci-dessous)
- [ ] Configurer les achats in-app (voir section IAP)

### 4. Build de l'Application
```bash
# 1. Builder l'application React
cd /app/frontend
yarn build

# 2. Synchroniser avec Capacitor
npx cap sync ios

# 3. Ouvrir dans Xcode
npx cap open ios

# 4. Dans Xcode:
#    - Sélectionner l'équipe de développement
#    - Configurer les capacités (Notifications, In-App Purchase)
#    - Archiver et soumettre
```

---

## 📝 Métadonnées App Store

### Description courte (30 caractères max)
```
Coach fitness pour femmes
```

### Description complète
```
Beautyfit By Amel - Ton coach fitness personnel 💪

Découvre des programmes d'entraînement adaptés à ton rythme de vie, conçus spécialement pour les femmes actives.

🌙 PROGRAMME RAMADAN
"Aller bien, même à jeun" - Un programme de 4 semaines avec:
• Marche rapide & fractionnés
• 30 min par séance, 2-3x par semaine
• Timer guidé avec vibrations ou son
• Compteur de pas automatique
• Respect du jeûne et de la fatigue

✨ FONCTIONNALITÉS
• Programmes interactifs avec timer intégré
• Vibrations à chaque pas pour te motiver
• Choix entre feedback sonore ou haptique
• Suivi de progression
• Interface élégante et intuitive

👶 PROGRAMME MARCHE POUSSETTE (Bientôt)
Programme post-partum de 9 mois pour les jeunes mamans.

🎯 POURQUOI BEAUTY FIT BY AMEL ?
• Programmes adaptés aux femmes
• Pas besoin d'équipement
• Exercices accessibles à tous niveaux
• Coach virtuel disponible 24/7

Rejoins des milliers de femmes qui ont transformé leur quotidien avec Beautyfit By Amel !

Des questions ? Contact: support@beautyfitbyamel.com
```

### Mots-clés (100 caractères max)
```
fitness,femme,sport,ramadan,marche,coaching,santé,bien-être,programme,entrainement
```

### URL de support
```
https://beautyfitbyamel.com/support
```

### URL de politique de confidentialité
```
https://beautyfitbyamel.com/confidentialite
```

---

## 🖼️ Assets Visuels Requis

### Icône de l'Application
- **Taille**: 1024 x 1024 pixels
- **Format**: PNG (sans transparence)
- **Coins**: Arrondis automatiquement par Apple
- **URL générée**: https://static.prod-images.emergentagent.com/jobs/72e17ce7-42cb-41dc-be42-c9db9a237da2/images/de40f48a7d84e1a45f81e57bd023260c59727b18ae04d328b99f4c3353e91489.png

### Screenshots Requis

| Appareil | Dimensions | Quantité |
|----------|------------|----------|
| iPhone 6.7" (14 Pro Max) | 1290 x 2796 | 3-10 |
| iPhone 6.5" (11 Pro Max) | 1242 x 2688 | 3-10 |
| iPhone 5.5" (8 Plus) | 1242 x 2208 | 3-10 |
| iPad Pro 12.9" | 2048 x 2732 | 3-10 |

### Screenshots Recommandés
1. Écran d'accueil avec bannière
2. Liste des programmes
3. Timer en action
4. Sélection des semaines
5. Notification push

---

## 💰 Configuration des Achats In-App

### Dans App Store Connect > Mon App > Fonctionnalités > Achats intégrés

#### Produit 1: Programme Ramadan
- **Type**: Non-consommable
- **ID de référence**: com.beautyfit.amel.programme.ramadan
- **Prix**: Niveau 10 (9,99 €)
- **Nom affiché**: Programme Ramadan - Aller bien, même à jeun
- **Description**: Programme de 4 semaines de marche rapide adapté au jeûne

#### Produit 2: Programme Marche Poussette
- **Type**: Non-consommable
- **ID de référence**: com.beautyfit.amel.programme.marche
- **Prix**: Niveau 20 (19,99 €)
- **Nom affiché**: Programme Marche Poussette
- **Description**: Programme post-partum de 9 mois pour jeunes mamans

#### Abonnement Mensuel (optionnel)
- **Type**: Abonnement auto-renouvelable
- **ID de référence**: com.beautyfit.amel.subscription.monthly
- **Prix**: Niveau 5 (4,99 €/mois)
- **Groupe d'abonnement**: Beauty Fit Premium

#### Abonnement Annuel (optionnel)
- **Type**: Abonnement auto-renouvelable
- **ID de référence**: com.beautyfit.amel.subscription.yearly
- **Prix**: Niveau 36 (35,99 €/an)
- **Groupe d'abonnement**: Beauty Fit Premium

---

## 📋 Review Guidelines - Points d'Attention

### ✅ Conforme
- Contenu original et fonctionnel
- Politique de confidentialité accessible
- Fonctionnalité claire et utile
- Interface intuitive
- Pas de contenu pour adultes

### ⚠️ À Vérifier
- [ ] Tous les liens fonctionnent
- [ ] Les achats in-app sont correctement configurés
- [ ] L'app fonctionne hors ligne (mode avion)
- [ ] Les permissions sont justifiées (motion sensors pour les pas)

### Justification des Permissions
```
Accès aux capteurs de mouvement: Nécessaire pour le comptage automatique des pas pendant les séances d'entraînement.
```

---

## 🚀 Étapes de Soumission

### 1. Préparation Xcode
```bash
# Ouvrir le projet iOS
cd /app/frontend
npx cap open ios
```

Dans Xcode:
1. Sélectionner "Any iOS Device" comme cible
2. Product > Archive
3. Window > Organizer
4. Distribute App > App Store Connect

### 2. App Store Connect
1. Aller sur https://appstoreconnect.apple.com
2. Sélectionner l'app
3. Ajouter les métadonnées
4. Uploader les screenshots
5. Configurer les prix et disponibilité
6. Soumettre pour review

### 3. Temps de Review
- **Première soumission**: 24-48h généralement
- **Mises à jour**: 24h en moyenne

---

## 📞 Support

Pour toute question sur la publication:
- Documentation Apple: https://developer.apple.com/documentation/
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Contact support Apple Developer: https://developer.apple.com/contact/

---

## 🔄 Mise à Jour Future

Pour mettre à jour l'application:
1. Modifier le code source
2. Incrémenter le numéro de version dans capacitor.config.json
3. `yarn build && npx cap sync ios`
4. Archiver dans Xcode
5. Soumettre la nouvelle version

---

*Document généré le 4 février 2025*
*Beautyfit By Amel - Version 1.0.0*
