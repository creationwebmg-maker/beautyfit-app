#!/bin/bash

# ============================================
# BEAUTYFIT BY AMEL - iOS Build Script
# ============================================
# Ce script automatise le build iOS pour TestFlight
# Exécuter dans le dossier ~/beautyfit-app/
# ============================================

echo "🏋️ BEAUTYFIT iOS Build Script"
echo "=============================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: package.json non trouvé. Êtes-vous dans le dossier beautyfit-app ?${NC}"
    exit 1
fi

echo -e "${YELLOW}📥 Étape 1/6: Récupération des modifications...${NC}"
git pull
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors du git pull${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Étape 2/6: Installation des dépendances npm...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de npm install${NC}"
    exit 1
fi

echo -e "${YELLOW}🔨 Étape 3/6: Build du frontend React...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors du build${NC}"
    exit 1
fi

echo -e "${YELLOW}📱 Étape 4/6: Synchronisation avec iOS...${NC}"
npx cap sync ios
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de cap sync${NC}"
    exit 1
fi

# Patch pour FileUtility.h (erreur connue)
echo -e "${YELLOW}🔧 Étape 5/6: Application des patches iOS...${NC}"
FILE_UTILITY="ios/App/Pods/Capacitor/ios/Capacitor/Capacitor/FileUtility.h"
if [ -f "$FILE_UTILITY" ]; then
    if ! grep -q "#import <Foundation/Foundation.h>" "$FILE_UTILITY"; then
        sed -i '' '1i\
#import <Foundation/Foundation.h>
' "$FILE_UTILITY"
        echo -e "${GREEN}✅ Patch FileUtility.h appliqué${NC}"
    else
        echo -e "${GREEN}✅ FileUtility.h déjà patché${NC}"
    fi
fi

# Pod install
echo -e "${YELLOW}🍎 Installation des CocoaPods...${NC}"
cd ios/App
pod install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de pod install${NC}"
    cd ../..
    exit 1
fi
cd ../..

echo -e "${YELLOW}🚀 Étape 6/6: Ouverture de Xcode...${NC}"
npx cap open ios

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ BUILD PRÊT !${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Dans Xcode:"
echo "1. Sélectionne le bon signing team"
echo "2. Product → Archive"
echo "3. Distribute App → TestFlight"
echo ""
echo -e "${YELLOW}Bonne chance ! 🎉${NC}"
