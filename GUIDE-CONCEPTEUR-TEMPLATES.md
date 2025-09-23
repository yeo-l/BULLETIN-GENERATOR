# 🎨 Guide du Concepteur de Templates - Bulletin Generator

## 🎯 **Vue d'Ensemble**

Le **Concepteur de Templates** permet aux utilisateurs de créer des templates personnalisés pour leurs bulletins sanitaires en utilisant **Docxtemplater**. Chaque sous-rubrique peut avoir sa propre représentation, période et commentaires.

## 🏗️ **Architecture du Concepteur**

### **Composants Principaux :**
- **TemplateDesigner** - Interface de conception
- **TemplateDesignerService** - Service de génération de templates
- **Intégration Docxtemplater** - Moteur de templates Word
- **Système de personnalisation** - Configuration par sous-rubrique

### **Fonctionnalités Clés :**
- ✅ **Récupération des configurations** depuis le DataStore DHIS2
- ✅ **Personnalisation par sous-rubrique** (nom, période, commentaires)
- ✅ **Génération de templates Word** avec Docxtemplater
- ✅ **Sauvegarde et chargement** de templates personnalisés
- ✅ **Interface en onglets** pour une navigation intuitive

## 📋 **Processus de Conception**

### **Étape 1 : Sélection de Configuration**
1. Accédez à **"Concepteur Templates"** dans la sidebar
2. Sélectionnez une configuration sauvegardée depuis le DataStore
3. Vérifiez les détails de la configuration
4. Cliquez sur **"Générer le Template"**

### **Étape 2 : Personnalisation**
1. Passez à l'onglet **"Personnalisation"**
2. Modifiez chaque section selon vos besoins :
   - **Nom personnalisé** de la section
   - **Description** de la section
3. Pour chaque sous-section :
   - **Nom personnalisé**
   - **Période spécifique** (différente de la période globale)
   - **Commentaire** personnalisé
4. Sauvegardez le template personnalisé

### **Étape 3 : Génération du Document**
1. Passez à l'onglet **"Génération"**
2. Vérifiez les informations du template
3. Cliquez sur **"Générer le Document Word"**
4. Le fichier .docx est automatiquement téléchargé

## 🎨 **Variables de Template Disponibles**

### **Variables Globales :**
```javascript
{
    title: "Titre du Bulletin",
    period: "Période globale",
    organization: "Organisation",
    date: "Date de génération",
    summary: "Résumé exécutif"
}
```

### **Variables de Section :**
```javascript
{
    sectionName: "Nom de la Section",
    sectionDescription: "Description de la Section"
}
```

### **Variables de Sous-section :**
```javascript
{
    subsectionName: "Nom de la Sous-section",
    subsectionPeriod: "Période spécifique",
    subsectionComment: "Commentaire personnalisé",
    indicators: [/* Tableau des indicateurs */]
}
```

### **Variables d'Indicateur :**
```javascript
{
    indicatorName: "Nom de l'Indicateur",
    indicatorValue: "Valeur",
    indicatorUnit: "Unité",
    indicatorTrend: "Tendance",
    indicatorTarget: "Objectif",
    indicatorResult: "Résultat",
    indicatorComment: "Commentaire"
}
```

## 🔧 **Personnalisation Avancée**

### **Personnalisation par Sous-rubrique :**

#### **Périodes Spécifiques :**
- Chaque sous-rubrique peut avoir sa propre période
- Format supporté : `2024-01`, `2024Q1`, `2024`, etc.
- Utile pour comparer différentes périodes dans le même bulletin

#### **Commentaires Personnalisés :**
- Ajoutez des commentaires explicatifs pour chaque sous-rubrique
- Utile pour fournir du contexte ou des explications
- Affiché dans le document généré

#### **Noms Personnalisés :**
- Modifiez les noms des sections et sous-sections
- Adaptez la terminologie à votre organisation
- Maintient la cohérence avec vos standards

### **Structure du Template Word :**

#### **En-tête :**
```xml
<w:p>
    <w:r>
        <w:rPr>
            <w:b/>
            <w:sz w:val="28"/>
            <w:color w:val="2563eb"/>
        </w:rPr>
        <w:t>{title}</w:t>
    </w:r>
</w:p>
```

#### **Sections avec Personnalisation :**
```xml
{#sections}
<w:p>
    <w:r>
        <w:rPr>
            <w:b/>
            <w:sz w:val="20"/>
        </w:rPr>
        <w:t>{sectionName}</w:t>
    </w:r>
</w:p>

{#sectionDescription}
<w:p>
    <w:r>
        <w:t>{sectionDescription}</w:t>
    </w:r>
</w:p>
{/sectionDescription}
```

#### **Sous-sections avec Période et Commentaires :**
```xml
{#subsections}
<w:p>
    <w:r>
        <w:rPr>
            <w:b/>
        </w:rPr>
        <w:t>{subsectionName}</w:t>
    </w:r>
</w:p>

{#subsectionPeriod}
<w:p>
    <w:r>
        <w:rPr>
            <w:i/>
        </w:rPr>
        <w:t>Période: {subsectionPeriod}</w:t>
    </w:r>
</w:p>
{/subsectionPeriod}

{#subsectionComment}
<w:p>
    <w:r>
        <w:t>Commentaire: {subsectionComment}</w:t>
    </w:r>
</w:p>
{/subsectionComment}
```

#### **Tableau des Indicateurs :**
```xml
<w:tbl>
    <w:tblPr>
        <w:tblStyle w:val="TableGrid"/>
    </w:tblPr>
    <w:tblGrid>
        <w:gridCol w:w="2000"/>
        <w:gridCol w:w="1000"/>
        <!-- ... autres colonnes ... -->
    </w:tblGrid>
    
    <!-- En-têtes -->
    <w:tr>
        <w:tc>
            <w:p>
                <w:r>
                    <w:rPr><w:b/></w:rPr>
                    <w:t>Indicateur</w:t>
                </w:r>
            </w:p>
        </w:tc>
        <!-- ... autres en-têtes ... -->
    </w:tr>
    
    <!-- Données -->
    {#indicators}
    <w:tr>
        <w:tc>
            <w:p>
                <w:r>
                    <w:t>{indicatorName}</w:t>
                </w:r>
            </w:p>
        </w:tc>
        <!-- ... autres cellules ... -->
    </w:tr>
    {/indicators}
</w:tbl>
```

## 💾 **Gestion des Templates**

### **Sauvegarde de Templates :**
```javascript
// Sauvegarde automatique en JSON
const templateData = {
    name: "Mon_Template_Personnalise",
    description: "Template pour bulletins mensuels",
    created: "2025-01-XX",
    template: baseTemplate, // ArrayBuffer du template Word
    customizations: {
        sections: { /* personnalisations */ },
        subsections: { /* personnalisations */ },
        indicators: { /* personnalisations */ }
    },
    bulletinData: { /* données du bulletin */ }
};
```

### **Chargement de Templates :**
```javascript
// Chargement depuis un fichier JSON
const templateData = await TemplateDesignerService.loadTemplate(file);
```

### **Validation de Templates :**
```javascript
const validation = TemplateDesignerService.validateTemplate(templateData);
if (!validation.isValid) {
    console.error('Erreurs:', validation.errors);
}
```

## 🎯 **Cas d'Usage Avancés**

### **Bulletin Comparatif :**
- Utilisez des périodes différentes pour chaque sous-rubrique
- Comparez les performances entre trimestres
- Ajoutez des commentaires explicatifs

### **Bulletin Spécialisé :**
- Personnalisez les noms selon votre domaine
- Adaptez la terminologie médicale
- Ajoutez des sections spécifiques

### **Bulletin Multi-périodes :**
```javascript
// Exemple de personnalisation
const customizations = {
    subsections: {
        "0_0": { // Section 0, Sous-section 0
            period: "2024-01",
            comment: "Données du premier trimestre"
        },
        "0_1": { // Section 0, Sous-section 1
            period: "2024-02", 
            comment: "Données du deuxième trimestre"
        }
    }
};
```

## 🔍 **Débogage et Validation**

### **Validation des Données :**
```javascript
// Vérification des personnalisations
const validateCustomizations = (customizations) => {
    const errors = [];
    
    // Vérifier les sections
    Object.keys(customizations.sections || {}).forEach(key => {
        const section = customizations.sections[key];
        if (!section.name) {
            errors.push(`Section ${key}: nom manquant`);
        }
    });
    
    // Vérifier les sous-sections
    Object.keys(customizations.subsections || {}).forEach(key => {
        const subsection = customizations.subsections[key];
        if (subsection.period && !isValidPeriod(subsection.period)) {
            errors.push(`Sous-section ${key}: période invalide`);
        }
    });
    
    return errors;
};
```

### **Logs de Débogage :**
```javascript
// Activer les logs détaillés
console.log('Template généré:', templateData);
console.log('Personnalisations:', customizations);
console.log('Données du bulletin:', bulletinData);
```

## 📊 **Exemples de Personnalisation**

### **Exemple 1 : Bulletin Épidémiologique**
```javascript
const customizations = {
    sections: {
        0: {
            name: "Surveillance Épidémiologique",
            description: "Données de surveillance des maladies transmissibles"
        }
    },
    subsections: {
        "0_0": {
            name: "Maladies à Prévention Vaccinale",
            period: "2024-01",
            comment: "Couverture vaccinale du premier trimestre 2024"
        },
        "0_1": {
            name: "Maladies Diarrhéiques",
            period: "2024-01",
            comment: "Surveillance des cas de diarrhée aiguë"
        }
    }
};
```

### **Exemple 2 : Bulletin de Performance**
```javascript
const customizations = {
    sections: {
        0: {
            name: "Indicateurs de Performance",
            description: "Évaluation des performances du système de santé"
        }
    },
    subsections: {
        "0_0": {
            name: "Qualité des Soins",
            period: "2024Q1",
            comment: "Indicateurs de qualité du premier trimestre"
        },
        "0_1": {
            name: "Accessibilité",
            period: "2024Q1", 
            comment: "Mesures d'accessibilité aux soins"
        }
    }
};
```

## 🚀 **Optimisations et Bonnes Pratiques**

### **Performance :**
- **Cache des templates** : Évitez de régénérer les templates identiques
- **Validation préalable** : Vérifiez les données avant génération
- **Traitement asynchrone** : Générez les documents en arrière-plan

### **Sécurité :**
- **Validation des entrées** : Vérifiez tous les champs utilisateur
- **Sanitisation** : Nettoyez les données avant injection dans le template
- **Limites de taille** : Contrôlez la taille des templates et données

### **Maintenance :**
- **Versioning** : Gardez des versions des templates
- **Documentation** : Documentez les templates personnalisés
- **Tests** : Testez les templates avec différentes données

## 📞 **Support et Dépannage**

### **Problèmes Courants :**

#### **Erreur "Template invalide" :**
- Vérifiez que le template contient toutes les variables requises
- Assurez-vous que la syntaxe Docxtemplater est correcte
- Validez le format XML du document Word

#### **Erreur "Données manquantes" :**
- Vérifiez que la configuration est complète
- Assurez-vous que les indicateurs sont sélectionnés
- Vérifiez les permissions DHIS2

#### **Erreur "Génération échouée" :**
- Vérifiez la console pour les erreurs détaillées
- Testez avec des données plus simples
- Vérifiez la mémoire disponible

### **Logs Utiles :**
```javascript
// Activer le mode debug
localStorage.setItem('debug', 'true');

// Vérifier les données
console.log('Configuration sélectionnée:', selectedConfig);
console.log('Personnalisations:', customizations);
console.log('Template généré:', templateData);
```

---

**Guide du Concepteur de Templates** - Bulletin Generator v1.0  
**Date** : Janvier 2025  
**Compatible avec** : Docxtemplater 3.66+, DHIS2 2.35+
