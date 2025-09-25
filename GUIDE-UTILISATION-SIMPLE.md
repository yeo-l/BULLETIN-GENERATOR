# 🎯 Guide d'Utilisation Simple - Générateur de Bulletins

## 🚀 **Utilisation Ultra-Simple**

L'interface a été conçue pour être **extrêmement simple** : l'utilisateur n'a besoin que de **sélectionner une clé** !

### **Étapes pour l'utilisateur :**

1. **Allez dans "Générer Bulletin"**
2. **Sélectionnez une configuration** dans la liste déroulante
3. **Cliquez "Générer le Bulletin Complet"**
4. **C'est tout !** Le bulletin est automatiquement téléchargé

## 🔄 **Processus Automatique (Invisible pour l'utilisateur)**

### **Étape 1 : Récupération des Données**
```
✅ Période → Depuis le DataStore (periode_start, periode_end)
✅ Établissement → Depuis le DataStore (etablissement, region, district)
✅ Indicateurs → Depuis le DataStore (sections[].indicators[])
✅ Configuration → Depuis le DataStore (name, programme, etc.)
```

### **Étape 2 : Détection des Templates**
```
✅ Header → header_{clé}.docx
✅ Rubriques → rubrique_{clé}.docx
✅ Sous-rubriques → sousrubrique_{clé}.docx
```

### **Étape 3 : Génération Multi-Pages**
```
📄 PAGE 1: Header (une seule fois)
📄 PAGE 2: Rubrique 1 + ses indicateurs
📄 PAGE 3: Sous-rubrique 1.1 + ses indicateurs
📄 PAGE 4: Sous-rubrique 1.2 + ses indicateurs
📄 PAGE 5: Rubrique 2 + ses indicateurs
📄 PAGE 6: Sous-rubrique 2.1 + ses indicateurs
... etc.
```

## 📋 **Structure des Données DataStore**

### **Format attendu :**
```json
{
  "name": "Programme PEV",
  "etablissement": "CHU de Test",
  "region": "Région Test",
  "district": "District Test",
  "periode_start": "2024-01-01",
  "periode_end": "2024-01-31",
  "sections": [
    {
      "name": "Vaccination",
      "description": "Section dédiée à la vaccination",
      "indicators": [
        {
          "name": "Nombre d'enfants vaccinés",
          "value": 850,
          "unit": "enfants",
          "target": 800,
          "achievement": "106%"
        }
      ],
      "subsections": [
        {
          "name": "Vaccination BCG",
          "description": "Sous-section BCG",
          "indicators": [
            {
              "name": "Couverture BCG",
              "value": 95,
              "unit": "%",
              "target": 90,
              "achievement": "106%"
            }
          ]
        }
      ]
    }
  ]
}
```

## 📄 **Nommage des Templates**

### **Format obligatoire :**
```
header_{clé}.docx        # Template Header
rubrique_{clé}.docx      # Template Rubrique
sousrubrique_{clé}.docx  # Template Sous-rubrique
```

### **Exemple avec clé `PEV21-09-251305` :**
```
header_PEV21-09-251305.docx
rubrique_PEV21-09-251305.docx
sousrubrique_PEV21-09-251305.docx
```

## 🎯 **Variables Disponibles dans les Templates**

### **Variables Communes (tous les templates) :**
```
{programme_name}        - Nom du programme
{etablissement}         - Nom de l'établissement
{region}               - Région
{district}             - District
{periode_start}        - Date de début (depuis DataStore)
{periode_end}          - Date de fin (depuis DataStore)
{date_generation}      - Date de génération
{heure_generation}     - Heure de génération
```

### **Variables Spécifiques Rubrique :**
```
{rubrique_number}       - Numéro de la rubrique (1, 2, 3...)
{rubrique_title}        - Titre de la rubrique
{rubrique_description}  - Description de la rubrique
{indicateur_1_name}    - Nom du 1er indicateur
{indicateur_1_value}   - Valeur du 1er indicateur
{indicateur_1_unit}    - Unité du 1er indicateur
{indicateur_1_target}  - Cible du 1er indicateur
{indicateur_1_achievement} - Réalisation du 1er indicateur
```

### **Variables Spécifiques Sous-rubrique :**
```
{rubrique_number}              - Numéro de la rubrique parente
{sous_rubrique_number}         - Numéro de la sous-rubrique
{sous_rubrique_title}          - Titre de la sous-rubrique
{sous_rubrique_description}    - Description de la sous-rubrique
{indicateur_1_name}           - Nom du 1er indicateur
{indicateur_1_value}          - Valeur du 1er indicateur
{indicateur_1_unit}           - Unité du 1er indicateur
{indicateur_1_target}         - Cible du 1er indicateur
{indicateur_1_achievement}    - Réalisation du 1er indicateur
```

## ✅ **Avantages de cette Approche**

### **Pour l'utilisateur :**
- ✅ **Ultra-simple** : Un seul clic pour générer un bulletin complet
- ✅ **Aucune saisie** : Tout vient automatiquement du DataStore
- ✅ **Résultat professionnel** : Bulletin multi-pages avec toutes les données
- ✅ **Pas d'erreur possible** : Le système gère tout automatiquement

### **Pour l'administrateur :**
- ✅ **Configuration centralisée** : Tout dans le DataStore
- ✅ **Templates réutilisables** : Même structure pour toutes les clés
- ✅ **Maintenance facile** : Modification des données sans toucher aux templates
- ✅ **Évolutif** : Ajout facile de nouvelles rubriques/sous-rubriques

## 🎉 **Résultat Final**

L'utilisateur obtient un **bulletin professionnel complet** avec :
- ✅ **Header** avec informations générales
- ✅ **Rubriques** avec leurs indicateurs spécifiques
- ✅ **Sous-rubriques** avec leurs indicateurs détaillés
- ✅ **Nouvelles pages** pour chaque section
- ✅ **Données réelles** du DataStore
- ✅ **Mise en forme** préservée des templates
- ✅ **Période automatique** depuis le DataStore

---

## 🚀 **Interface Utilisateur**

```
┌─────────────────────────────────────────────────────────────┐
│                    Génération de Bulletin                   │
├─────────────────────────────────────────────────────────────┤
│  Configuration du Bulletin                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Sélectionner une configuration: [PEV21-09-251305 ▼]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ✅ Configuration sélectionnée : PEV21-09-251305           │
│  📊 Données: Toutes les informations seront récupérées     │
│  📄 Templates: Fichiers .docx automatiquement détectés     │
│  🎯 Résultat: Bulletin complet multi-pages                 │
│                                                             │
│  Processus Automatique                                      │
│  [1️⃣ Récupération] [2️⃣ Détection] [3️⃣ Génération]        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     [Générer le Bulletin Complet]                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**C'est tout ! L'utilisateur n'a qu'à choisir et cliquer ! 🎉**
