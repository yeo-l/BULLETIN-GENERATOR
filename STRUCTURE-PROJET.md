# 📁 Structure du Projet Bulletin Generator

## 🎯 **Dossiers Principaux**

### **`src/` - Code de Production**
- **Contenu** : Fichiers JavaScript (`.jsx`, `.js`) pour le build DHIS2
- **Usage** : Utilisé par DHIS2 CLI pour générer l'application
- **État** : Fichiers de production, prêts pour le déploiement
- **Build** : `npm run build:original`

### **`src-typescript/` - Code de Développement**
- **Contenu** : Fichiers TypeScript (`.tsx`, `.ts`) pour le développement
- **Usage** : Fichiers de développement avec types TypeScript
- **État** : Fichiers de développement, non utilisés pour le build
- **Note** : Conserver pour le développement futur avec TypeScript

### **`build/` - Build de Production**
- **Contenu** : Application compilée prête pour DHIS2
- **Usage** : Déploiement sur serveur DHIS2
- **Archive** : `build/bundle/bulletin-generator-1.0.0.zip`

## 🔄 **Workflow de Développement**

### **Développement Normal**
1. Modifier les fichiers dans `src/` (JavaScript)
2. Tester avec `npm start`
3. Build avec `npm run build:original`

### **Développement TypeScript (Futur)**
1. Modifier les fichiers dans `src-typescript/` (TypeScript)
2. Convertir vers `src/` avec un script de conversion
3. Build avec `npm run build:original`

## 📋 **Fichiers de Configuration**

- **`d2.config.js`** : Configuration DHIS2 CLI
- **`tsconfig.json`** : Configuration TypeScript (pour développement futur)
- **`package.json`** : Dépendances et scripts

## 🚀 **Scripts Disponibles**

- **`npm start`** : Démarrage en mode développement
- **`npm run build:original`** : Build de production
- **`npm test`** : Tests unitaires
- **`npm run deploy`** : Déploiement sur DHIS2

## ⚠️ **Notes Importantes**

- Le dossier `src/` contient les fichiers JavaScript de production
- Le dossier `src-typescript/` est une sauvegarde pour le développement futur
- Ne pas modifier directement les fichiers dans `build/`
- Utiliser `npm run build:original` pour générer une nouvelle version
