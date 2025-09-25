# 📄 Guide des Templates Word pour la Génération de Bulletins

## 🎯 **Principe de Fonctionnement**

Votre fichier `header_PEV21-09-251305.docx` contient des **placeholders** qui seront remplacés par les vraies données du DataStore.

### 🔑 **Correspondance Clé DataStore ↔ Template**

Le suffixe du nom du fichier (`PEV21-09-251305`) correspond à la **clé** dans le DataStore :
- **Fichier** : `header_PEV21-09-251305.docx`
- **Clé DataStore** : `PEV21-09-251305`
- **Données** : Récupérées depuis `/api/dataStore/GENERATE-BULLETIN/PEV21-09-251305`

## 📝 **Variables Disponibles dans le Template**

### **Variables Générales**
```
{programme_name}        - Nom du programme
{programme_code}        - Code du programme  
{periode_start}         - Date de début
{periode_end}           - Date de fin
{date_generation}       - Date de génération
{heure_generation}      - Heure de génération
```

### **Variables Établissement**
```
{etablissement}         - Nom de l'établissement
{region}               - Région
{district}             - District
```

### **Variables Indicateurs**
```
{indicateur_1_name}     - Nom du 1er indicateur
{indicateur_1_value}    - Valeur du 1er indicateur
{indicateur_1_unit}     - Unité du 1er indicateur
{indicateur_1_target}   - Cible du 1er indicateur
{indicateur_1_achievement} - Réalisation du 1er indicateur

{indicateur_2_name}     - Nom du 2ème indicateur
{indicateur_2_value}    - Valeur du 2ème indicateur
{indicateur_2_unit}     - Unité du 2ème indicateur
{indicateur_2_target}   - Cible du 2ème indicateur
{indicateur_2_achievement} - Réalisation du 2ème indicateur

... et ainsi de suite pour tous les indicateurs
```

## 📋 **Exemple de Template Word**

Créez votre fichier Word avec ce contenu :

```
RAPPORT DE {programme_name}
================================

Établissement : {etablissement}
Région : {region}
District : {district}

Période du rapport : {periode_start} au {periode_end}
Date de génération : {date_generation} à {heure_generation}

INDICATEURS DE PERFORMANCE
==========================

1. {indicateur_1_name}
   Valeur : {indicateur_1_value} {indicateur_1_unit}
   Cible : {indicateur_1_target} {indicateur_1_unit}
   Réalisation : {indicateur_1_achievement}

2. {indicateur_2_name}
   Valeur : {indicateur_2_value} {indicateur_2_unit}
   Cible : {indicateur_2_target} {indicateur_2_unit}
   Réalisation : {indicateur_2_achievement}

3. {indicateur_3_name}
   Valeur : {indicateur_3_value} {indicateur_3_unit}
   Cible : {indicateur_3_target} {indicateur_3_unit}
   Réalisation : {indicateur_3_achievement}

---
Généré automatiquement par le système de bulletins
```

## 🔄 **Processus de Génération**

1. **Sélection du Template** : `header_PEV21-09-251305.docx`
2. **Extraction de la Clé** : `PEV21-09-251305`
3. **Récupération des Données** : `/api/dataStore/GENERATE-BULLETIN/PEV21-09-251305`
4. **Remplacement des Variables** : `{programme_name}` → `"Programme PEV"`
5. **Génération du Fichier Final** : `Bulletin_PEV_2024-01-01_2024-01-31.docx`

## 🎨 **Personnalisation du Template**

Vous pouvez :
- ✅ **Ajouter des images** (logos, graphiques)
- ✅ **Modifier la mise en forme** (couleurs, polices)
- ✅ **Ajouter des tableaux** avec des données dynamiques
- ✅ **Insérer des graphiques** (si supporté)

## 📁 **Structure des Fichiers**

```
public/upload/
├── header_PEV21-09-251305.docx     # Template avec placeholders
├── rubrique_PEV21-09-251305.docx   # Autre template
└── sousrubrique_PEV21-09-251305.docx # Autre template
```

Chaque fichier correspond à une **clé DataStore** différente et peut contenir des variables spécifiques.

## 🚀 **Test du Template**

1. **Créez** votre fichier Word avec les placeholders
2. **Sauvegardez-le** comme `header_PEV21-09-251305.docx`
3. **Uploadez-le** via l'interface d'importation
4. **Testez** la génération de bulletin
5. **Vérifiez** que les variables sont remplacées correctement

---

## 🎯 **Génération de Bulletin Complet**

### **Nouvelle Fonctionnalité : Combinaison Multi-Templates**

Le système peut maintenant combiner **plusieurs templates** en un seul bulletin complet :

#### **Structure du Bulletin Final :**
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

#### **Variables Spécifiques par Type :**

**Template Rubrique :**
```
{rubrique_number}       - Numéro de la rubrique (1, 2, 3...)
{rubrique_title}        - Titre de la rubrique
{rubrique_description}  - Description de la rubrique
```

**Template Sous-rubrique :**
```
{rubrique_number}              - Numéro de la rubrique parente
{sous_rubrique_number}         - Numéro de la sous-rubrique
{sous_rubrique_title}          - Titre de la sous-rubrique
{sous_rubrique_description}    - Description de la sous-rubrique
```

#### **Nommage des Fichiers :**
- `header_PEV21-09-251305.docx` → Template Header
- `rubrique_PEV21-09-251305.docx` → Template Rubrique
- `sousrubrique_PEV21-09-251305.docx` → Template Sous-rubrique

Le suffixe `PEV21-09-251305` correspond à la clé DataStore qui contient les données.

---

**Votre template est maintenant prêt pour la génération automatique de bulletins ! 🎉**
