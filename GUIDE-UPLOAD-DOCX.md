# Guide d'utilisation - Upload de fichiers .docx

## Vue d'ensemble

La fonctionnalité d'upload de fichiers .docx permet aux utilisateurs d'importer des modèles Word dans l'application pour la génération de bulletins. Cette fonctionnalité est intégrée dans le composant "Rubriques & sous-rubriques" avec un design professionnel et une expérience utilisateur optimisée.

## Fonctionnalités

### ✅ Ce qui est inclus

1. **Modal d'upload professionnel** avec design moderne
2. **Drag & Drop** pour une utilisation intuitive
3. **Validation des fichiers** (.docx uniquement, taille max 10MB)
4. **Barre de progression** en temps réel
5. **Messages de statut** (succès, erreur, en cours)
6. **Service d'upload** avec gestion d'erreurs robuste
7. **API endpoint** prête à utiliser (Node.js/Express)

### 🎨 Interface utilisateur

- **Bouton d'import** : "Importer modèle .docx" avec icône Upload
- **Zone de drop** : Interface drag & drop avec animations
- **Validation visuelle** : Messages d'erreur et d'avertissement
- **Progress bar** : Suivi en temps réel de l'upload
- **Feedback utilisateur** : Messages de succès/erreur clairs

## Structure des fichiers

```
src/
├── components/BulletinConfig/
│   └── BulletinConfig.jsx           # Composant principal avec modal d'upload
├── services/
│   └── uploadService.js             # Service d'upload côté client
server/
└── api/
    └── upload-docx.js               # API endpoint côté serveur
public/
└── upload/                          # Dossier de destination des fichiers
```

## Utilisation

### 1. Interface utilisateur

1. **Ouvrir le modal** : Cliquer sur le bouton "Importer modèle .docx"
2. **Sélectionner le fichier** :
   - Glisser-déposer un fichier .docx dans la zone
   - Ou cliquer pour ouvrir le sélecteur de fichiers
3. **Suivi de l'upload** : Barre de progression en temps réel
4. **Confirmation** : Message de succès avec fermeture automatique

### 2. Validation des fichiers

- **Format accepté** : Fichiers .docx uniquement
- **Taille maximale** : 10MB
- **Validation en temps réel** : Messages d'erreur immédiats

### 3. Gestion des erreurs

- **Fichier invalide** : Message d'erreur spécifique
- **Taille dépassée** : Avertissement de limite
- **Erreur réseau** : Message d'erreur de connexion
- **Timeout** : Gestion des délais d'attente

## Configuration technique

### Côté client (React)

```jsx
// Import du service
import UploadService from '../../services/uploadService'

// Utilisation
const result = await UploadService.uploadDocx(file, (progress) => {
    setUploadProgress(progress)
})
```

### Côté serveur (Node.js)

```javascript
// Installation des dépendances
npm install express multer path fs-extra

// Intégration dans votre serveur
const uploadRoutes = require('./api/upload-docx');
app.use('/api', uploadRoutes);
```

## API Endpoints

### POST /api/upload-docx
**Upload un fichier .docx**

**Request:**
```
Content-Type: multipart/form-data
Body: FormData avec 'file' field
```

**Response (Succès):**
```json
{
  "success": true,
  "message": "Fichier uploadé avec succès",
  "filename": "document_2024-01-15_14-30-00.docx",
  "originalName": "document.docx",
  "path": "/upload/document_2024-01-15_14-30-00.docx",
  "size": 245760,
  "uploadedAt": "2024-01-15T14:30:00.000Z"
}
```

**Response (Erreur):**
```json
{
  "success": false,
  "message": "Le fichier ne doit pas dépasser 10MB"
}
```

### GET /api/uploaded-files
**Liste les fichiers uploadés**

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "filename": "document_2024-01-15_14-30-00.docx",
      "path": "/upload/document_2024-01-15_14-30-00.docx",
      "size": 245760,
      "uploadedAt": "2024-01-15T14:30:00.000Z",
      "modifiedAt": "2024-01-15T14:30:00.000Z"
    }
  ],
  "count": 1
}
```

### DELETE /api/uploaded-files/:filename
**Supprime un fichier uploadé**

## Sécurité

### Mesures implémentées

1. **Validation de type MIME** : Vérification du type de fichier
2. **Validation d'extension** : Seuls les .docx sont acceptés
3. **Limite de taille** : Maximum 10MB par fichier
4. **Noms de fichiers sécurisés** : Sanitisation automatique
5. **Protection path traversal** : Validation des chemins
6. **Timeout** : Limite de 30 secondes pour l'upload

### Recommandations

- Utiliser HTTPS en production
- Configurer CORS appropriément
- Limiter le nombre d'uploads par utilisateur
- Scanner les fichiers pour les virus (optionnel)
- Sauvegarder régulièrement le dossier upload

## Dépannage

### Erreurs courantes

1. **"Seuls les fichiers .docx sont acceptés"**
   - Vérifier l'extension du fichier
   - S'assurer que le fichier n'est pas corrompu

2. **"Le fichier ne doit pas dépasser 10MB"**
   - Compresser le document Word
   - Supprimer les images haute résolution

3. **"Erreur de connexion"**
   - Vérifier que le serveur backend fonctionne
   - Contrôler la configuration CORS

4. **"Timeout lors de l'upload"**
   - Vérifier la connexion internet
   - Réduire la taille du fichier

### Logs de débogage

```javascript
// Activer les logs détaillés
console.log('Validation:', UploadService.validateFile(file));
console.log('Taille formatée:', UploadService.formatFileSize(file.size));
```

## Personnalisation

### Modifier les limites

```javascript
// Dans uploadService.js
if (file.size > 20 * 1024 * 1024) { // Changer à 20MB
    errors.push('Le fichier ne doit pas dépasser 20MB');
}
```

### Ajouter d'autres formats

```javascript
// Dans la validation
const allowedExtensions = ['.docx', '.doc', '.pdf'];
if (!allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
    errors.push('Format de fichier non supporté');
}
```

### Personnaliser le design

Modifier les styles dans `BulletinConfig.jsx` :

```javascript
const customModalStyle = {
    ...modalStyle,
    width: '800px', // Plus large
    backgroundColor: '#f0f9ff' // Couleur personnalisée
};
```

## Améliorations futures

### Fonctionnalités suggérées

1. **Aperçu des fichiers** : Miniatures ou prévisualisation
2. **Gestion de versions** : Historique des modifications
3. **Compression automatique** : Réduction de taille
4. **Scan antivirus** : Sécurité renforcée
5. **Upload multiple** : Sélection de plusieurs fichiers
6. **Cloud storage** : Intégration AWS S3, Google Cloud
7. **Synchronisation** : Backup automatique

### Optimisations techniques

1. **Chunk upload** : Upload par morceaux pour gros fichiers
2. **Resume upload** : Reprise d'upload interrompu
3. **Compression côté client** : Réduction avant envoi
4. **Cache intelligent** : Éviter les re-uploads
5. **WebSocket** : Suivi temps réel amélioré

## Support

Pour toute question ou problème :

1. Vérifier ce guide en premier
2. Consulter les logs de la console
3. Tester avec un fichier .docx simple
4. Vérifier la configuration du serveur backend

---

**Note** : Cette fonctionnalité nécessite un serveur backend pour fonctionner. Assurez-vous d'avoir configuré l'API endpoint avant utilisation.
