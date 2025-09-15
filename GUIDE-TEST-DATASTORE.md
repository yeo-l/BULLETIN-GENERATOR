# 🧪 Guide de Test du DataStore DHIS2

Ce guide vous explique comment vérifier que le datastore récupère bien tous les paramétrages et les crée dans votre DHIS2.

## 📋 Méthodes de Test

### 1. **Test via l'Interface Utilisateur**

1. **Démarrez l'application** :
   ```bash
   yarn start
   ```

2. **Accédez au menu "Test DataStore"** dans la sidebar

3. **Cliquez sur "Lancer les tests"** pour exécuter automatiquement :
   - ✅ Test de connexion au datastore
   - ✅ Création d'une configuration de test
   - ✅ Récupération de la configuration
   - ✅ Vérification de l'intégrité des données
   - ✅ Liste de toutes les configurations

### 2. **Test via la Console du Navigateur**

1. **Ouvrez l'application** dans votre navigateur
2. **Ouvrez la console** (F12 → Console)
3. **Copiez et collez** le contenu du fichier `test-datastore.js`
4. **Appuyez sur Entrée** pour exécuter les tests

### 3. **Test Manuel via l'API**

Vous pouvez tester directement l'API DHIS2 :

```javascript
// 1. Lister toutes les configurations
fetch('/api/dataStore/GENERATE-BULLETIN')
  .then(response => response.json())
  .then(data => console.log('Configurations:', data));

// 2. Créer une configuration
const testConfig = {
  program: 'TEST',
  coverTitle: 'Test manuel',
  sections: []
};

fetch('/api/dataStore/GENERATE-BULLETIN/TEST-MANUAL', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testConfig)
})
.then(response => response.json())
.then(data => console.log('Configuration créée:', data));

// 3. Récupérer une configuration
fetch('/api/dataStore/GENERATE-BULLETIN/TEST-MANUAL')
  .then(response => response.json())
  .then(data => console.log('Configuration récupérée:', data));
```

## 🔍 Vérifications à Effectuer

### ✅ **Test de Connexion**
- [ ] L'API `/api/dataStore/GENERATE-BULLETIN` répond
- [ ] Aucune erreur 401 (Unauthorized)
- [ ] Aucune erreur 403 (Forbidden)

### ✅ **Test de Création**
- [ ] Une configuration de test est créée avec succès
- [ ] La clé unique est générée correctement
- [ ] Toutes les données sont sauvegardées

### ✅ **Test de Récupération**
- [ ] La configuration créée peut être récupérée
- [ ] Toutes les données sont intactes
- [ ] L'intégrité des données est préservée

### ✅ **Test d'Intégrité des Données**
- [ ] Programme : `program` est sauvegardé
- [ ] Titre : `coverTitle` est sauvegardé
- [ ] Périodicité : `periodicity` et `periodValue` sont sauvegardés
- [ ] Sections : `sections` avec sous-sections sont sauvegardées
- [ ] Groupes d'indicateurs : `indicatorGroups` sont sauvegardés
- [ ] Indicateurs sélectionnés : `selectedIndicators` sont sauvegardés
- [ ] Unités d'organisation : `selectedOrgUnits` sont sauvegardées
- [ ] Automatisation : `autoGenerate` est sauvegardé

## 🚨 Problèmes Courants et Solutions

### **Erreur 401 - Unauthorized**
```
❌ Erreur HTTP: 401 - Unauthorized
```
**Solution** : Vérifiez que vous êtes connecté à DHIS2 et que votre session est active.

### **Erreur 403 - Forbidden**
```
❌ Erreur HTTP: 403 - Forbidden
```
**Solution** : Vérifiez que votre utilisateur a les permissions pour accéder au datastore.

### **Erreur de Connexion**
```
❌ Erreur de connexion: Failed to fetch
```
**Solution** : Vérifiez votre connexion internet et l'accessibilité de votre instance DHIS2.

### **Données Corrompues**
```
⚠️ Intégrité des données: 5/7 tests réussis
```
**Solution** : Vérifiez la structure des données dans le code de sauvegarde.

## 📊 Structure des Données Sauvegardées

```json
{
  "program": "PEV",
  "coverTitle": "Bulletin PEV - Semaine 15, 2024",
  "periodicity": "WEEKLY",
  "periodValue": {
    "year": 2024,
    "week": 15
  },
  "sections": [
    {
      "id": "uuid-section-1",
      "title": "Rubrique 1",
      "subsections": [
        {
          "id": "uuid-subsection-1",
          "title": "Sous-rubrique 1",
          "presentation": "table",
          "indicatorGroups": [
            {
              "id": "uuid-group-1",
              "name": "Groupe d'indicateurs 1",
              "selectedIndicators": [
                {
                  "id": "indicator-id-1",
                  "name": "Nom de l'indicateur 1"
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "selectedOrgUnits": [
    {
      "id": "org-unit-id-1",
      "name": "Nom de l'unité d'organisation"
    }
  ],
  "autoGenerate": true,
  "lastModified": "2024-01-15T10:30:00.000Z",
  "version": "1.0",
  "createdDate": "2024-01-15T10:30:00.000Z"
}
```

## 🎯 Résultats Attendus

### **Test Réussi** ✅
```
🎉 Tous les tests sont passés avec succès!
✅ Le datastore DHIS2 fonctionne correctement
```

### **Test Partiellement Réussi** ⚠️
```
⚠️ Certains tests ont échoué
🔧 Vérifiez la configuration de votre instance DHIS2
```

### **Test Échoué** ❌
```
💥 Erreur lors de l'exécution des tests
🔧 Vérifiez la connexion et les permissions
```

## 🔧 Nettoyage

Après les tests, vous pouvez supprimer les configurations de test :

```javascript
// Supprimer une configuration de test
fetch('/api/dataStore/GENERATE-BULLETIN/TEST-15-01-24-1030', {
  method: 'DELETE'
})
.then(response => {
  if (response.ok) {
    console.log('Configuration de test supprimée');
  }
});
```

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** de la console du navigateur
2. **Vérifiez les permissions** de votre utilisateur DHIS2
3. **Vérifiez la configuration** de votre instance DHIS2
4. **Contactez l'administrateur** DHIS2 si nécessaire

---

**Note** : Ce guide de test est temporaire et sera supprimé une fois les tests validés.

