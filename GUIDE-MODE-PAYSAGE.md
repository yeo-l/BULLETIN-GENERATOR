# 📄 Guide du Mode Paysage - Templates Word

## 🎯 **Configuration Automatique du Mode Paysage**

Le système configure automatiquement tous les bulletins générés en **mode paysage** pour une meilleure présentation des données.

### ✅ **Ce qui est automatiquement appliqué :**

- **Orientation** : Paysage (landscape)
- **Dimensions** : 29.7cm × 21cm (A4 paysage)
- **Marges** : Optimisées pour le mode paysage
- **Mise en page** : Adaptée pour les tableaux et graphiques

## 📋 **Création de Templates en Mode Paysage**

### **1. Créer votre template Word**

1. **Ouvrez Microsoft Word**
2. **Allez dans "Mise en page" → "Orientation" → "Paysage"**
3. **Créez votre contenu** avec les placeholders
4. **Sauvegardez** avec le nom approprié

### **2. Nommage des Templates**

```
header_PEV21-09-251305.docx        # Template Header en paysage
rubrique_PEV21-09-251305.docx      # Template Rubrique en paysage  
sousrubrique_PEV21-09-251305.docx  # Template Sous-rubrique en paysage
```

### **3. Structure Recommandée pour le Mode Paysage**

#### **Template Header :**
```
RAPPORT DE {programme_name}
==========================================

Établissement : {etablissement}    |    Région : {region}
District : {district}              |    Période : {periode_start} au {periode_end}

Date de génération : {date_generation} à {heure_generation}

==========================================
```

#### **Template Rubrique :**
```
RUBRIQUE {rubrique_number} : {rubrique_title}
================================================

{rubrique_description}

INDICATEURS DE PERFORMANCE
==========================

┌─────────────────────────────────────────────────────────────────┐
│ Indicateur                │ Valeur    │ Cible   │ Réalisation  │
├─────────────────────────────────────────────────────────────────┤
│ {indicateur_1_name}       │ {indicateur_1_value} {indicateur_1_unit} │ {indicateur_1_target} │ {indicateur_1_achievement} │
│ {indicateur_2_name}       │ {indicateur_2_value} {indicateur_2_unit} │ {indicateur_2_target} │ {indicateur_2_achievement} │
│ {indicateur_3_name}       │ {indicateur_3_value} {indicateur_3_unit} │ {indicateur_3_target} │ {indicateur_3_achievement} │
└─────────────────────────────────────────────────────────────────┘

---
```

#### **Template Sous-rubrique :**
```
SOUS-RUBRIQUE {rubrique_number}.{sous_rubrique_number} : {sous_rubrique_title}
================================================================

{sous_rubrique_description}

DÉTAILS SPÉCIFIQUES
===================

┌─────────────────────────────────────────────────────────────────┐
│ Indicateur                │ Valeur    │ Cible   │ Réalisation  │
├─────────────────────────────────────────────────────────────────┤
│ {indicateur_1_name}       │ {indicateur_1_value} {indicateur_1_unit} │ {indicateur_1_target} │ {indicateur_1_achievement} │
│ {indicateur_2_name}       │ {indicateur_2_value} {indicateur_2_unit} │ {indicateur_2_target} │ {indicateur_2_achievement} │
└─────────────────────────────────────────────────────────────────┘

---
```

## 🎨 **Conseils de Mise en Page pour le Mode Paysage**

### **Avantages du Mode Paysage :**
- ✅ **Plus d'espace horizontal** pour les tableaux
- ✅ **Meilleure lisibilité** des données
- ✅ **Graphiques plus larges** et détaillés
- ✅ **Tableaux multi-colonnes** possibles
- ✅ **Présentation professionnelle**

### **Recommandations :**
1. **Utilisez des tableaux** pour organiser les indicateurs
2. **Créez des sections** bien délimitées
3. **Ajoutez des bordures** pour structurer le contenu
4. **Utilisez la largeur** disponible pour les graphiques
5. **Organisez en colonnes** quand c'est pertinent

## 🔧 **Configuration Technique**

### **Dimensions Automatiques :**
- **Largeur** : 16838 twips (29.7 cm)
- **Hauteur** : 11906 twips (21.0 cm)
- **Orientation** : Landscape
- **Marges** : Optimisées pour l'impression

### **Variables Disponibles :**
Toutes les variables standard sont disponibles :
- `{programme_name}`, `{etablissement}`, `{region}`, `{district}`
- `{periode_start}`, `{periode_end}`, `{date_generation}`, `{heure_generation}`
- `{rubrique_number}`, `{rubrique_title}`, `{rubrique_description}`
- `{sous_rubrique_number}`, `{sous_rubrique_title}`, `{sous_rubrique_description}`
- `{indicateur_1_name}`, `{indicateur_1_value}`, etc.

## 🚀 **Processus de Génération**

1. **Créer les templates** en mode paysage dans Word
2. **Uploadez-les** via "Importer Documents"
3. **Sélectionnez la clé** dans "Générer Bulletin"
4. **Cliquez "Générer le Bulletin Complet"**
5. **Le bulletin est automatiquement** en mode paysage !

## 📊 **Exemple de Résultat**

```
┌─────────────────────────────────────────────────────────────────┐
│                    RAPPORT DE PROGRAMME PEV                    │
│                                                                 │
│ Établissement : CHU de Test    │    Région : Région Test       │
│ District : District Test       │    Période : 01/01/2024 au    │
│                                │             31/01/2024        │
├─────────────────────────────────────────────────────────────────┤
│ RUBRIQUE 1 : VACCINATION                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Nombre d'enfants vaccinés    │ 850 enfants │ 800 │ 106%   │ │
│ │ Taux de couverture          │ 95%         │ 90% │ 106%   │ │
│ │ Nombre de séances           │ 18 séances  │ 20  │ 90%    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ SOUS-RUBRIQUE 1.1 : VACCINATION BCG                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Couverture BCG              │ 95%         │ 90% │ 106%   │ │
│ │ Enfants vaccinés BCG        │ 780 enfants │ 750 │ 104%   │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎉 **Résultat Final**

Vous obtenez un **bulletin professionnel en mode paysage** avec :
- ✅ **Orientation paysage** automatique
- ✅ **Tableaux optimisés** pour la largeur
- ✅ **Présentation claire** des données
- ✅ **Mise en page professionnelle**
- ✅ **Impression optimisée** en A4 paysage

**Vos bulletins sont maintenant parfaitement adaptés au mode paysage ! 🎉**
