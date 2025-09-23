# 📁 Guide d'Upload Automatique des Documents

## 🎯 Objectif

Ce système permet d'uploader automatiquement des fichiers `.docx` dans le dossier `public/upload/` de votre projet **sans intervention manuelle**.

## 🚀 Démarrage du Système

### Option 1 : Démarrage Automatique (Recommandé)
```bash
npm run start:dev
```
Cette commande démarre :
- ✅ Le serveur d'upload (port 3001)
- ✅ L'application DHIS2 (port 8080)

### Option 2 : Démarrage Manuel
```bash
# Terminal 1 - Serveur d'upload
npm run start:server

# Terminal 2 - Application DHIS2
npm start
```

## 📋 Fonctionnement

### 1. Sélection de Configuration
- Allez dans **"Importer Documents"** dans le menu
- Sélectionnez une configuration de bulletin existante
- Le système charge automatiquement les configurations depuis le DataStore

### 2. Upload Automatique
- Glissez-déposez ou sélectionnez un fichier `.docx`
- Le fichier est **automatiquement renommé** : `nomoriginal_configkey.docx`
- Le fichier est **automatiquement sauvegardé** dans `public/upload/`

### 3. Processus Automatique
```
Fichier sélectionné → Renommage → Upload automatique → Sauvegarde dans public/upload/
```

## 🔧 API du Serveur d'Upload

### Endpoints Disponibles

#### `POST /api/upload-docx`
- **Fonction** : Upload automatique de fichiers .docx
- **Paramètres** : `file` (FormData)
- **Réponse** : 
```json
{
  "success": true,
  "message": "Fichier sauvegardé automatiquement",
  "filename": "document_PEV171224-1430.docx",
  "path": "/upload/document_PEV171224-1430.docx",
  "size": 12345
}
```

#### `GET /api/status`
- **Fonction** : Vérifier le statut du serveur
- **Réponse** :
```json
{
  "success": true,
  "message": "Serveur d'upload actif",
  "port": 3001,
  "uploadDir": "C:\\PROJETS-2025\\bulletin-generator\\public\\upload",
  "timestamp": "2025-09-22T23:31:47.755Z"
}
```

#### `GET /api/files`
- **Fonction** : Lister tous les fichiers uploadés
- **Réponse** :
```json
{
  "success": true,
  "files": [
    {
      "name": "document_PEV171224-1430.docx",
      "size": 12345,
      "modified": "2025-09-22T23:31:47.755Z",
      "path": "/upload/document_PEV171224-1430.docx"
    }
  ]
}
```

## 📁 Structure des Fichiers

```
bulletin-generator/
├── public/
│   └── upload/                    # 📁 Dossier d'upload automatique
│       ├── document1_PEV171224-1430.docx
│       ├── document2_PEV171224-1430.docx
│       └── document3_PEV171224-1430.docx
├── upload-server.js              # 🚀 Serveur d'upload automatique
└── src/
    └── components/
        └── DocumentImport/
            └── DocumentImport.jsx # 🎯 Interface d'upload
```

## 🔄 Processus de Renommage

### Règle de Nommage
```
Nom original : "Rapport_Mensuel.docx"
Clé config   : "PEV171224-1430"
Résultat     : "Rapport_Mensuel_PEV171224-1430.docx"
```

### Exemple Complet
```javascript
// Fichier original
const originalFile = "Rapport_PEV_Mars.docx"

// Configuration sélectionnée
const configKey = "PEV171224-1430"

// Résultat automatique
const finalName = "Rapport_PEV_Mars_PEV171224-1430.docx"
// Sauvegardé dans : public/upload/Rapport_PEV_Mars_PEV171224-1430.docx
```

## ⚡ Avantages du Système

### ✅ Automatisation Complète
- ❌ **Plus besoin** de copier manuellement les fichiers
- ✅ **Upload automatique** dans `public/upload/`
- ✅ **Renommage automatique** avec la clé de configuration

### ✅ Gestion des Erreurs
- 🔄 **Fallback automatique** si le serveur n'est pas disponible
- 📥 **Téléchargement local** en cas de problème réseau
- 🛡️ **Validation des fichiers** (.docx uniquement)

### ✅ Interface Utilisateur
- 🎨 **Interface moderne** avec drag & drop
- 📊 **Barre de progression** en temps réel
- ✅ **Messages de confirmation** clairs

## 🛠️ Dépannage

### Problème : Serveur non accessible
```bash
# Vérifier que le serveur fonctionne
curl http://localhost:3001/api/status

# Redémarrer le serveur
npm run start:server
```

### Problème : Port 3001 occupé
```bash
# Changer le port dans upload-server.js
const PORT = 3002; // Au lieu de 3001
```

### Problème : Dossier upload inexistant
```bash
# Créer le dossier manuellement
mkdir -p public/upload
```

## 📊 Monitoring

### Logs du Serveur
Le serveur affiche en temps réel :
```
🚀 Serveur d'upload démarré sur le port 3001
📁 Dossier d'upload: C:\PROJETS-2025\bulletin-generator\public\upload
✅ Fichier uploadé: Rapport_PEV_Mars_PEV171224-1430.docx
📁 Sauvegardé dans: C:\PROJETS-2025\bulletin-generator\public\upload\Rapport_PEV_Mars_PEV171224-1430.docx
```

### Vérification des Fichiers
```bash
# Lister les fichiers uploadés
curl http://localhost:3001/api/files
```

## 🎯 Utilisation Typique

1. **Démarrez** le système : `npm run start:dev`
2. **Ouvrez** l'application dans le navigateur
3. **Allez** dans "Importer Documents"
4. **Sélectionnez** une configuration de bulletin
5. **Glissez-déposez** vos fichiers .docx
6. **Vérifiez** que les fichiers apparaissent dans `public/upload/`

## 🔐 Sécurité

- ✅ **Validation des types** de fichiers (.docx uniquement)
- ✅ **Limitation de taille** (10MB maximum)
- ✅ **CORS configuré** pour les domaines autorisés
- ✅ **Gestion d'erreurs** robuste

---

## 📞 Support

En cas de problème :
1. Vérifiez les logs du serveur
2. Testez l'API : `curl http://localhost:3001/api/status`
3. Redémarrez le système : `npm run start:dev`

**Le système d'upload automatique est maintenant opérationnel ! 🎉**
