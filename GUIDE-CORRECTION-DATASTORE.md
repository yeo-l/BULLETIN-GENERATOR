# Guide de Correction - Erreur 404 DataStore

## Problème Identifié

L'erreur 404 "Détail configuration" était causée par plusieurs problèmes dans le composant `DataStoreTest` :

### 1. **Incohérence dans la structure des données**
- Le code supposait que `configsData` était un objet avec des clés
- En réalité, l'API DataStore DHIS2 retourne généralement un tableau de clés
- Cela causait des erreurs lors de l'accès aux propriétés

### 2. **Gestion d'erreur insuffisante**
- L'erreur 404 n'était pas suffisamment détaillée
- Pas de distinction entre différents types d'erreurs

## Solutions Implémentées

### 1. **Gestion Flexible des Données**
```javascript
// Avant
const keys = Object.keys(configsData)

// Après
const keys = Array.isArray(configsData) ? configsData : Object.keys(configsData)
```

### 2. **Amélioration des Messages d'Erreur**
```javascript
// Avant
message: `Erreur récupération détail: ${detailResponse.status}`

// Après
message: `Erreur récupération détail: ${detailResponse.status} - ${detailResponse.statusText}`
```

### 3. **Test Alternatif avec useDataQuery**
- Ajout d'un test utilisant `useDataQuery` pour récupérer une configuration spécifique
- Permet de comparer les deux méthodes d'accès aux données

### 4. **Interface Utilisateur Améliorée**
- Sélecteur pour choisir une configuration spécifique à tester
- Statuts visuels améliorés (success, error, warning, info)
- Meilleure gestion des états de chargement

## Fonctionnalités Ajoutées

### 1. **Test de Configuration Spécifique**
- Dropdown pour sélectionner une configuration
- Bouton pour tester la récupération via `useDataQuery`
- Comparaison entre fetch() et useDataQuery

### 2. **Statuts Visuels Étendus**
- ✅ Success (vert)
- ❌ Error (rouge)
- ⚠️ Warning (orange)
- ℹ️ Info (bleu)

### 3. **Gestion Robuste des Données**
- Support des tableaux et objets
- Vérifications de sécurité avant accès aux propriétés
- Messages d'erreur plus informatifs

## Comment Utiliser

1. **Test Automatique** : Cliquez sur "Lancer les tests" pour tester l'accès général au DataStore
2. **Test Spécifique** : Sélectionnez une configuration dans le dropdown et cliquez sur "Tester cette configuration"
3. **Analyse des Résultats** : Consultez les résultats détaillés avec les données JSON

## Diagnostic des Erreurs 404

### Causes Possibles
1. **Clé inexistante** : La configuration demandée n'existe pas
2. **Permissions insuffisantes** : L'utilisateur n'a pas accès à cette configuration
3. **Namespace incorrect** : Le namespace "GENERATE-BULLETIN" n'existe pas
4. **Problème de configuration DHIS2** : Le DataStore n'est pas activé

### Solutions
1. Vérifiez que le namespace existe
2. Vérifiez les permissions de l'utilisateur
3. Créez une configuration de test si nécessaire
4. Contactez l'administrateur DHIS2 si le problème persiste

## Tests Recommandés

1. **Test de base** : Vérifier l'accès au namespace
2. **Test de permissions** : Vérifier les droits d'accès
3. **Test de création** : Créer une configuration de test
4. **Test de récupération** : Récupérer la configuration créée
5. **Test de modification** : Modifier la configuration
6. **Test de suppression** : Supprimer la configuration de test
