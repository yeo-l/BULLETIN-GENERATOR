# 📄 Guide du Bulletin Complet - Génération Multi-Templates

## 🎯 **Principe de Fonctionnement**

Le système génère maintenant un **bulletin complet** qui combine automatiquement tous les templates disponibles pour une clé DataStore donnée, en respectant l'ordre spécifique demandé.

## 📋 **Structure du Bulletin Final**

### **Ordre de Génération :**
```
📄 PAGE 1: Header (une seule fois)
📄 PAGE 2: Rubrique 1
📄 PAGE 3: Sous-rubrique 1.1
📄 PAGE 4: Sous-rubrique 1.2
📄 PAGE 5: Rubrique 2
📄 PAGE 6: Sous-rubrique 2.1
📄 PAGE 7: Sous-rubrique 2.2
... etc.
```

### **Logique de Combinaison :**
1. **Header** → Une seule page au début
2. **Pour chaque Rubrique** → Nouvelle page + toutes ses sous-rubriques
3. **Nouvelle page** pour chaque rubrique et sous-rubrique

## 🔑 **Correspondance Clé DataStore ↔ Templates**

### **Exemple avec la clé `PEV21-09-251305` :**

**Fichiers Templates :**
```
public/upload/
├── header_PEV21-09-251305.docx        # Template Header
├── rubrique_PEV21-09-251305.docx      # Template Rubrique
└── sousrubrique_PEV21-09-251305.docx  # Template Sous-rubrique
```

**Clé DataStore :** `PEV21-09-251305`
**API :** `/api/dataStore/GENERATE-BULLETIN/PEV21-09-251305`

## 📝 **Variables Disponibles par Type de Template**

### **Variables Communes (tous les templates) :**
```
{programme_name}        - Nom du programme
{etablissement}         - Nom de l'établissement
{region}               - Région
{district}             - District
{periode_start}        - Date de début
{periode_end}          - Date de fin
{date_generation}      - Date de génération
{heure_generation}     - Heure de génération
```

### **Variables Spécifiques Header :**
```
{programme_name}        - Titre principal
{etablissement}         - Nom de l'établissement
{region}               - Région
{district}             - District
{periode_start}        - Période de début
{periode_end}          - Période de fin
```

### **Variables Spécifiques Rubrique :**
```
{rubrique_number}       - Numéro de la rubrique (1, 2, 3...)
{rubrique_title}        - Titre de la rubrique
{rubrique_description}  - Description de la rubrique
{indicateur_1_name}    - Nom du 1er indicateur de cette rubrique
{indicateur_1_value}   - Valeur du 1er indicateur
{indicateur_1_unit}    - Unité du 1er indicateur
{indicateur_1_target}  - Cible du 1er indicateur
{indicateur_1_achievement} - Réalisation du 1er indicateur
... et ainsi de suite pour tous les indicateurs de cette rubrique
```

### **Variables Spécifiques Sous-rubrique :**
```
{rubrique_number}              - Numéro de la rubrique parente
{sous_rubrique_number}         - Numéro de la sous-rubrique
{sous_rubrique_title}          - Titre de la sous-rubrique
{sous_rubrique_description}    - Description de la sous-rubrique
{indicateur_1_name}           - Nom du 1er indicateur de cette sous-rubrique
{indicateur_1_value}          - Valeur du 1er indicateur
{indicateur_1_unit}           - Unité du 1er indicateur
{indicateur_1_target}         - Cible du 1er indicateur
{indicateur_1_achievement}    - Réalisation du 1er indicateur
... et ainsi de suite pour tous les indicateurs de cette sous-rubrique
```

## 🔄 **Processus de Génération Automatique**

### **Étape 1 : Détection des Templates**
```
1. Récupération de tous les fichiers .docx dans public/upload/
2. Filtrage par clé DataStore (suffixe du nom de fichier)
3. Organisation par type : header, rubrique, sous-rubrique
```

### **Étape 2 : Récupération des Données**
```
1. Appel API : /api/dataStore/GENERATE-BULLETIN/{clé}
2. Récupération des sections et sous-sections
3. Récupération des indicateurs pour chaque section
```

### **Étape 3 : Génération du Document**
```
1. Traitement du Header (une seule fois)
2. Pour chaque rubrique :
   a. Traitement de la rubrique
   b. Traitement de toutes ses sous-rubriques
3. Combinaison de tous les documents en un seul fichier
4. Téléchargement automatique
```

## 📋 **Exemples de Templates**

### **Template Header (`header_PEV21-09-251305.docx`) :**
```
RAPPORT DE {programme_name}
================================

Établissement : {etablissement}
Région : {region}
District : {district}

Période : {periode_start} au {periode_end}
Date de génération : {date_generation} à {heure_generation}

---
```

### **Template Rubrique (`rubrique_PEV21-09-251305.docx`) :**
```
RUBRIQUE {rubrique_number} : {rubrique_title}
=============================================

{rubrique_description}

INDICATEURS :
- {indicateur_1_name} : {indicateur_1_value} {indicateur_1_unit}
- {indicateur_2_name} : {indicateur_2_value} {indicateur_2_unit}

---
```

### **Template Sous-rubrique (`sousrubrique_PEV21-09-251305.docx`) :**
```
SOUS-RUBRIQUE {rubrique_number}.{sous_rubrique_number} : {sous_rubrique_title}
======================================================

{sous_rubrique_description}

DÉTAILS :
- {indicateur_1_name} : {indicateur_1_value} {indicateur_1_unit}
- {indicateur_2_name} : {indicateur_2_value} {indicateur_2_unit}

---
```

## 🎯 **Structure des Données DataStore**

### **Format attendu dans le DataStore :**
```json
{
  "name": "Programme PEV",
  "etablissement": "CHU de Test",
  "region": "Région Test",
  "district": "District Test",
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

## 🚀 **Utilisation**

### **1. Préparation des Templates**
- Créez vos templates Word avec les placeholders appropriés
- Nommez-les selon le format : `type_clé.docx`
- Uploadez-les via "Importer Documents"

### **2. Génération du Bulletin**
- Allez dans "Générer Bulletin"
- Sélectionnez n'importe quel template (la clé sera automatiquement détectée)
- Définissez la période
- Cliquez "Générer le Bulletin Complet"

### **3. Résultat**
- Le système combine automatiquement tous les templates de la même clé
- Chaque rubrique et sous-rubrique est sur une nouvelle page
- Le fichier final est téléchargé automatiquement

## ⚠️ **Points Importants**

### **Nommage des Fichiers :**
- ✅ `header_PEV21-09-251305.docx`
- ✅ `rubrique_PEV21-09-251305.docx`
- ✅ `sousrubrique_PEV21-09-251305.docx`
- ❌ `header.docx` (pas de clé DataStore)
- ❌ `rubrique_PEV.docx` (clé différente)

### **Structure DataStore :**
- Les `sections` correspondent aux rubriques
- Les `subsections` correspondent aux sous-rubriques
- Chaque section peut avoir plusieurs indicateurs
- Chaque sous-section peut avoir ses propres indicateurs

### **Ordre de Génération :**
- Header → Rubrique 1 → Sous-rubriques 1.x → Rubrique 2 → Sous-rubriques 2.x → etc.
- Une nouvelle page pour chaque élément
- Les données sont automatiquement injectées depuis le DataStore

---

## 🎉 **Résultat Final**

Vous obtenez un **bulletin complet** avec :
- ✅ **Header** avec informations générales
- ✅ **Rubriques** avec leurs indicateurs spécifiques
- ✅ **Sous-rubriques** avec leurs indicateurs détaillés
- ✅ **Nouvelles pages** pour chaque section
- ✅ **Données réelles** du DataStore
- ✅ **Mise en forme** préservée des templates

**Le système génère automatiquement un bulletin professionnel complet ! 🎉**
