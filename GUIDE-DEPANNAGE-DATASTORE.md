# 🔧 Guide de Dépannage - DataStore DHIS2

## 🎯 **Problème Identifié**

Le message **"⚠️ Aucune configuration trouvée"** apparaît alors que les configurations existent dans le DataStore DHIS2.

## 🔍 **Diagnostic du Problème**

### **Cause Principale :**
- **Namespace incorrect** : Les composants cherchaient dans `dataStore/bulletin-configs` au lieu de `dataStore/GENERATE-BULLETIN`
- **Structure des données** : Les configurations sont stockées avec une structure spécifique

### **Solution Appliquée :**
✅ **Correction du namespace** dans tous les composants
✅ **Ajout de logs de débogage** pour tracer les données
✅ **Création d'un composant de test** pour diagnostiquer les problèmes

## 🛠️ **Corrections Apportées**

### **1. TemplateDesigner.jsx**
```javascript
// AVANT (incorrect)
const { data: configsData } = useDataQuery({
    configs: {
        resource: 'dataStore/bulletin-configs',
    },
})

// APRÈS (correct)
const { data: configsData } = useDataQuery({
    configs: {
        resource: 'dataStore/GENERATE-BULLETIN',
    },
})
```

### **2. BulletinGenerator.jsx**
```javascript
// Même correction appliquée
const { data: configsData } = useDataQuery({
    configs: {
        resource: 'dataStore/GENERATE-BULLETIN',
    },
})
```

### **3. Amélioration du Traitement des Données**
```javascript
useEffect(() => {
    if (configsData) {
        const configs = Object.keys(configsData).map(key => ({
            id: key,
            name: configsData[key].name || `Configuration ${key}`,
            data: configsData[key]
        }))
        setConfigurations(configs)
        console.log('Configurations chargées:', configs) // Log de débogage
    }
}, [configsData])
```

## 🧪 **Composant de Test Ajouté**

### **DataStoreTest.jsx**
- **Test automatique** de l'accès au DataStore
- **Affichage des configurations** disponibles
- **Diagnostic des erreurs** de connexion
- **Interface de test manuel** pour vérifier les permissions

### **Fonctionnalités du Test :**
1. **Vérification de l'accès** au namespace `GENERATE-BULLETIN`
2. **Liste des clés** disponibles dans le DataStore
3. **Récupération des détails** d'une configuration
4. **Affichage des métadonnées** (nom, programme, date de modification)

## 📋 **Structure des Données dans le DataStore**

### **Namespace :** `GENERATE-BULLETIN`

### **Structure d'une Configuration :**
```javascript
{
    "DEFAULT202501151430": {  // Clé unique générée
        "name": "Configuration DEFAULT - 15-01-25 1430",
        "program": "DEFAULT",
        "coverTitle": "Bulletin Sanitaire",
        "period": "2024-01",
        "periodicity": "monthly",
        "selectedOrgUnits": [...],
        "sections": [...],
        "lastModified": "2025-01-15T14:30:00.000Z",
        "version": "1.0",
        "key": "DEFAULT202501151430",
        "createdDate": "2025-01-15T14:30:00.000Z"
    }
}
```

### **Génération de la Clé Unique :**
```javascript
const now = new Date()
const dateStr = now.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: '2-digit' 
}).replace(/\//g, '-')
const timeStr = now.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
}).replace(/:/g, '')

const programKey = config.program || 'DEFAULT'
const uniqueKey = `${programKey}${dateStr}${timeStr}`
```

## 🔧 **Comment Utiliser le Composant de Test**

### **1. Accès au Test :**
- Cliquez sur **"Test DataStore"** dans la sidebar
- Le composant affiche automatiquement le statut du DataStore

### **2. Tests Automatiques :**
- **Vérification de l'accès** au DataStore
- **Comptage des configurations** disponibles
- **Affichage des erreurs** éventuelles

### **3. Tests Manuels :**
- Cliquez sur **"Lancer les tests"** pour des tests approfondis
- Vérification de la **liste des clés**
- Test de **récupération d'une configuration** spécifique

### **4. Affichage des Configurations :**
- **Liste complète** des configurations disponibles
- **Métadonnées** de chaque configuration
- **Informations de débogage** détaillées

## 🚨 **Problèmes Courants et Solutions**

### **Problème 1 : "Aucune configuration trouvée"**
**Causes possibles :**
- Namespace incorrect
- Permissions insuffisantes
- DataStore vide

**Solutions :**
1. Vérifiez le namespace dans le composant de test
2. Créez une configuration dans "Paramétrage"
3. Vérifiez les permissions DHIS2

### **Problème 2 : "Erreur 401 Unauthorized"**
**Causes possibles :**
- Session expirée
- Permissions insuffisantes
- Token invalide

**Solutions :**
1. Reconnectez-vous à DHIS2
2. Vérifiez les permissions sur le DataStore
3. Contactez l'administrateur DHIS2

### **Problème 3 : "Erreur 404 Not Found"**
**Causes possibles :**
- Namespace inexistant
- Clé de configuration introuvable

**Solutions :**
1. Créez d'abord une configuration
2. Vérifiez le nom du namespace
3. Utilisez le composant de test pour diagnostiquer

### **Problème 4 : "Données corrompues"**
**Causes possibles :**
- Structure JSON invalide
- Données partiellement sauvegardées

**Solutions :**
1. Supprimez la configuration corrompue
2. Recréez une nouvelle configuration
3. Vérifiez les logs de sauvegarde

## 📊 **Logs de Débogage**

### **Activer les Logs :**
```javascript
// Dans la console du navigateur
localStorage.setItem('debug', 'true');

// Ou directement dans le code
console.log('Configurations chargées:', configs);
console.log('Données du DataStore:', configsData);
```

### **Logs Utiles :**
- **Chargement des configurations** : Vérifie la récupération des données
- **Structure des données** : Valide le format des configurations
- **Erreurs de requête** : Identifie les problèmes de connexion

## 🔍 **Vérifications à Effectuer**

### **1. Vérification du DataStore :**
```bash
# Via l'API DHIS2
GET /api/dataStore/GENERATE-BULLETIN
```

### **2. Vérification d'une Configuration :**
```bash
# Via l'API DHIS2
GET /api/dataStore/GENERATE-BULLETIN/{key}
```

### **3. Vérification des Permissions :**
- L'utilisateur doit avoir les permissions **"Data Store"**
- L'utilisateur doit pouvoir **lire et écrire** dans le namespace

## 🎯 **Résolution du Problème**

### **Étapes de Résolution :**

1. **✅ Correction du namespace** - Appliquée
2. **✅ Ajout de logs de débogage** - Appliquée  
3. **✅ Création du composant de test** - Appliquée
4. **✅ Amélioration du traitement des données** - Appliquée

### **Résultat Attendu :**
- Les configurations existantes sont maintenant **visibles** dans le Concepteur de Templates
- Le composant de test permet de **diagnostiquer** les problèmes futurs
- Les logs de débogage facilitent le **troubleshooting**

## 🚀 **Prochaines Étapes**

### **Pour l'Utilisateur :**
1. **Testez le Concepteur de Templates** - Les configurations devraient maintenant être visibles
2. **Utilisez le composant de test** - Pour diagnostiquer tout problème futur
3. **Créez de nouvelles configurations** - Si nécessaire

### **Pour le Développement :**
1. **Surveillez les logs** - Pour identifier d'autres problèmes potentiels
2. **Améliorez la gestion d'erreurs** - Basé sur les retours utilisateurs
3. **Optimisez les performances** - Si le DataStore contient beaucoup de configurations

---

**Guide de Dépannage DataStore** - Bulletin Generator v1.0  
**Date** : Janvier 2025  
**Problème résolu** : Namespace incorrect dans la récupération des configurations

