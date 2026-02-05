# 🚀 GUIDE ULTRA-SIMPLE - Publier Beauty Fit sur l'App Store

## Ce dont vous avez besoin
- ✅ Un Mac (obligatoire pour Xcode)
- ✅ Xcode installé (gratuit sur l'App Store)
- ✅ Votre compte développeur Apple (déjà fait !)

---

## ÉTAPE 1 : Télécharger le projet (2 min)

1. Sur Emergent, cliquez sur **"Télécharger le code"**
2. Décompressez le fichier ZIP sur votre Mac

---

## ÉTAPE 2 : Préparer le projet (5 min)

Ouvrez **Terminal** sur votre Mac et tapez ces commandes :

```bash
# Aller dans le dossier du projet
cd ~/Downloads/votre-projet/frontend

# Installer les dépendances
yarn install

# Construire l'application
yarn build

# Ajouter iOS
npx cap add ios

# Synchroniser
npx cap sync ios

# Ouvrir Xcode
npx cap open ios
```

---

## ÉTAPE 3 : Configurer dans Xcode (3 min)

1. **Cliquez sur "Beautyfit By Amel"** dans la barre latérale gauche
2. **Onglet "Signing & Capabilities"**
3. **Cochez "Automatically manage signing"**
4. **Team** : Sélectionnez votre compte développeur
5. **Bundle Identifier** : Vérifiez que c'est `com.beautyfit.amel`

---

## ÉTAPE 4 : Créer l'app sur App Store Connect (5 min)

1. Allez sur https://appstoreconnect.apple.com
2. **Mes apps** → **+** → **Nouvelle app**
3. Remplissez :

| Champ | Valeur à copier |
|-------|-----------------|
| Plateformes | ✅ iOS |
| Nom | `Beautyfit By Amel` |
| Langue principale | Français |
| Bundle ID | `com.beautyfit.amel` |
| SKU | `beautyfitbyamel2025` |
| Accès utilisateur | Accès complet |

4. Cliquez **"Créer"**

---

## ÉTAPE 5 : Remplir les informations (10 min)

### Dans l'onglet "Informations sur l'app"

**Sous-titre** (copier) :
```
Ton coach fitness personnel
```

**Catégorie** : Santé et forme

**Classification du contenu** : 4+

---

### Dans l'onglet "Version iOS"

**Description** (copier tout) :
```
Beautyfit By Amel - Ton coach fitness personnel 💪

Découvre des programmes d'entraînement adaptés à ton rythme de vie, conçus spécialement pour les femmes actives.

🌙 PROGRAMME RAMADAN - "Aller bien, même à jeun"
Un programme de 4 semaines avec :
• Marche rapide & fractionnés
• 30 min par séance, 2-3x par semaine
• Timer guidé avec vibrations ou son
• Compteur de pas automatique
• Respect du jeûne et de la fatigue

✨ FONCTIONNALITÉS
• Programmes interactifs avec timer intégré
• Vibrations à chaque pas pour te motiver
• Choix entre feedback sonore ou vibrations
• Suivi de progression
• Interface élégante et intuitive

🎯 POURQUOI BEAUTY FIT BY AMEL ?
• Programmes adaptés aux femmes
• Pas besoin d'équipement
• Exercices accessibles à tous niveaux
• Coach virtuel disponible 24/7

Rejoins des milliers de femmes qui ont transformé leur quotidien !
```

**Mots-clés** (copier) :
```
fitness,femme,sport,ramadan,marche,coaching,santé,bien-être,programme,maman
```

**URL de support** :
```
https://beautyfitbyamel.com/support
```

**URL marketing** :
```
https://beautyfitbyamel.com
```

---

## ÉTAPE 6 : Ajouter les captures d'écran

Je les ai préparées pour vous ! Utilisez les screenshots de l'app.

**Dimensions requises** :
- iPhone 6.7" : 1290 x 2796 pixels
- iPhone 6.5" : 1242 x 2688 pixels

💡 **Astuce** : Prenez des captures d'écran depuis le simulateur Xcode (iPhone 15 Pro Max)

---

## ÉTAPE 7 : Ajouter l'icône

L'icône 1024x1024 est ici :
```
https://static.prod-images.emergentagent.com/jobs/72e17ce7-42cb-41dc-be42-c9db9a237da2/images/de40f48a7d84e1a45f81e57bd023260c59727b18ae04d328b99f4c3353e91489.png
```

Téléchargez-la et uploadez-la dans App Store Connect.

---

## ÉTAPE 8 : Archiver et envoyer (5 min)

Dans Xcode :

1. **En haut** : Sélectionnez "Any iOS Device (arm64)"
2. **Menu** : Product → Archive
3. Attendez la compilation (2-3 min)
4. Dans la fenêtre Organizer : **Distribute App**
5. Choisissez **App Store Connect**
6. Cliquez **Next** → **Next** → **Upload**

---

## ÉTAPE 9 : Soumettre pour review

1. Retournez sur **App Store Connect**
2. Votre build apparaîtra sous "Build"
3. Sélectionnez-le
4. Cliquez **"Soumettre pour examen"**

---

## ⏱️ Temps d'attente

- **Review Apple** : 24-48h en général
- Vous recevrez un email quand c'est approuvé !

---

## ❓ Problèmes courants

### "No signing certificate"
→ Xcode > Preferences > Accounts > Télécharger les certificats

### "Bundle ID already exists"
→ Changez le SKU ou utilisez un Bundle ID différent

### Build rejected
→ Lisez le message d'Apple et corrigez le problème indiqué

---

## 🎉 C'est tout !

Une fois approuvée, votre app sera disponible sur l'App Store !

Besoin d'aide ? Contactez le support Apple Developer.
