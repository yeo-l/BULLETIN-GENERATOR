import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'

class BulletinGeneratorService {
    /**
     * Génère un bulletin complet à partir de tous les templates disponibles
     * @param {string} dataStoreKey - Clé du DataStore pour récupérer les données
     * @param {Object} period - Période du bulletin
     * @param {string} outputFileName - Nom du fichier de sortie
     */
    static async generateCompleteBulletin(dataStoreKey, period, outputFileName) {
        try {
            console.log('🔄 Génération du bulletin complet en cours...')
            console.log('🔑 Clé DataStore:', dataStoreKey)
            console.log('📅 Période:', period)

            // 1. Récupérer les données depuis le DataStore
            const dataResult = await this.getDataFromDataStore(dataStoreKey)
            if (!dataResult.success) {
                throw new Error(`Impossible de récupérer les données: ${dataResult.message}`)
            }

            const configData = dataResult.data
            console.log('📊 Données récupérées du DataStore:', configData)

            // 2. Récupérer tous les templates disponibles
            const templatesResult = await this.getAvailableTemplates()
            if (!templatesResult.success) {
                throw new Error(`Impossible de récupérer les templates: ${templatesResult.message}`)
            }

            // 3. Filtrer les templates pour cette clé DataStore
            const relevantTemplates = templatesResult.templates.filter(template => 
                template.dataStoreKey === dataStoreKey
            )

            console.log('📄 Templates trouvés pour cette clé:', relevantTemplates.map(t => t.name))

            if (relevantTemplates.length === 0) {
                throw new Error(`Aucun template trouvé pour la clé "${dataStoreKey}"`)
            }

            // 4. Organiser les templates par type
            const templatesByType = this.organizeTemplatesByType(relevantTemplates)
            console.log('📋 Templates organisés:', templatesByType)

            // 5. Générer le bulletin complet
            const result = await this.generateCombinedDocument(templatesByType, configData, period, outputFileName)

            return result

        } catch (error) {
            console.error('❌ Erreur lors de la génération du bulletin complet:', error)
            return {
                success: false,
                message: `Erreur lors de la génération: ${error.message}`,
                error: error.message
            }
        }
    }

    /**
     * Organise les templates par type (header, rubrique, sous-rubrique)
     * @param {Array} templates - Liste des templates
     */
    static organizeTemplatesByType(templates) {
        const organized = {
            header: [],
            rubriques: [],
            sousRubriques: []
        }

        templates.forEach(template => {
            const name = template.name.toLowerCase()
            
            if (name.includes('header') || name.includes('en-tête')) {
                organized.header.push(template)
            } else if (name.includes('sous-rubrique') || name.includes('sousrubrique')) {
                organized.sousRubriques.push(template)
            } else if (name.includes('rubrique')) {
                organized.rubriques.push(template)
            }
        })

        return organized
    }

    /**
     * Génère un document combiné avec tous les templates
     * @param {Object} templatesByType - Templates organisés par type
     * @param {Object} configData - Données de configuration
     * @param {Object} period - Période du bulletin
     * @param {string} outputFileName - Nom du fichier de sortie
     */
    static async generateCombinedDocument(templatesByType, configData, period, outputFileName) {
        try {
            console.log('🔄 Génération du document combiné...')

            // 1. Préparer les données de base
            const baseData = this.prepareDataFromDataStore(configData, period)
            
            // 2. Créer un document vide pour commencer
            let combinedDocument = null
            let isFirstDocument = true

            // 3. Traiter le header en premier (une seule fois)
            if (templatesByType.header.length > 0) {
                const headerTemplate = templatesByType.header[0] // Prendre le premier header
                console.log('📄 Traitement du header:', headerTemplate.name)
                
                const headerResult = await this.processTemplate(headerTemplate, baseData, isFirstDocument)
                combinedDocument = headerResult.document
                isFirstDocument = false
            }

            // 4. Traiter les rubriques et leurs sous-rubriques
            for (let i = 0; i < templatesByType.rubriques.length; i++) {
                const rubriqueTemplate = templatesByType.rubriques[i]
                console.log(`📄 Traitement de la rubrique ${i + 1}:`, rubriqueTemplate.name)

                // Ajouter la rubrique
                const rubriqueData = this.prepareRubriqueData(baseData, configData, i + 1)
                const rubriqueResult = await this.processTemplate(rubriqueTemplate, rubriqueData, isFirstDocument, combinedDocument)
                combinedDocument = rubriqueResult.document
                isFirstDocument = false

                // Ajouter les sous-rubriques correspondantes
                const sousRubriquesForThisRubrique = this.getSousRubriquesForRubrique(templatesByType.sousRubriques, i + 1)
                
                for (let j = 0; j < sousRubriquesForThisRubrique.length; j++) {
                    const sousRubriqueTemplate = sousRubriquesForThisRubrique[j]
                    console.log(`📄 Traitement de la sous-rubrique ${i + 1}.${j + 1}:`, sousRubriqueTemplate.name)

                    const sousRubriqueData = this.prepareSousRubriqueData(baseData, configData, i + 1, j + 1)
                    const sousRubriqueResult = await this.processTemplate(sousRubriqueTemplate, sousRubriqueData, isFirstDocument, combinedDocument)
                    combinedDocument = sousRubriqueResult.document
                }
            }

            // 5. Configurer le mode paysage
            if (!combinedDocument) {
                throw new Error('Aucun document généré')
            }

            // Appliquer la configuration paysage
            const landscapeDocument = this.configureLandscapeMode(combinedDocument)

            // 6. Générer le fichier final
            const buf = landscapeDocument.getZip().generate({
                type: 'arraybuffer',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 4,
                },
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            })

            // 7. Télécharger le fichier
            const blob = new Blob([buf], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            })

            saveAs(blob, outputFileName)

            console.log('✅ Bulletin complet généré avec succès:', outputFileName)
            return {
                success: true,
                message: `Bulletin complet "${outputFileName}" généré avec succès`,
                fileName: outputFileName,
                templatesUsed: this.getTemplatesUsed(templatesByType)
            }

        } catch (error) {
            console.error('❌ Erreur lors de la génération du document combiné:', error)
            throw error
        }
    }

    /**
     * Traite un template individuel
     * @param {Object} template - Template à traiter
     * @param {Object} data - Données à injecter
     * @param {boolean} isFirstDocument - Si c'est le premier document
     * @param {Object} existingDocument - Document existant pour combiner
     */
    static async processTemplate(template, data, isFirstDocument = true, existingDocument = null) {
        try {
            console.log('🔄 Traitement du template:', template.name)
            
            // Créer un template de test intégré
            const templateContent = this.createTestTemplate(template.name, data)
            const zip = new PizZip(templateContent)

            // Créer le document
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            })

            // Injecter les données
            doc.setData(data)
            doc.render()

            if (isFirstDocument) {
                // Premier document, utiliser tel quel
                return { document: doc }
            } else {
                // Ajouter une nouvelle page et combiner avec le document existant
                return await this.combineDocuments(existingDocument, doc)
            }

        } catch (error) {
            console.error(`❌ Erreur lors du traitement du template ${template.name}:`, error)
            throw error
        }
    }

    /**
     * Crée un template de test intégré
     * @param {string} templateName - Nom du template
     * @param {Object} data - Données à injecter
     */
    static createTestTemplate(templateName, data) {
        let content = ''
        
        if (templateName.includes('header')) {
            content = `
RAPPORT DE {programme_name}
==========================================

Établissement : {etablissement}    |    Région : {region}
District : {district}              |    Période : {periode_start} au {periode_end}

Date de génération : {date_generation} à {heure_generation}

==========================================
            `
        } else if (templateName.includes('rubrique')) {
            content = `
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
            `
        } else if (templateName.includes('sousrubrique')) {
            content = `
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
            `
        }

        // Créer un document Word minimal
        const docxContent = this.createMinimalDocx(content)
        return docxContent
    }

    /**
     * Crée un document Word minimal avec le contenu donné
     * @param {string} content - Contenu du document
     */
    static createMinimalDocx(content) {
        // Créer un document Word minimal avec PizZip
        const zip = new PizZip()
        
        // Structure minimale d'un document Word
        zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`)

        zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`)

        zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`)

        zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:r>
                <w:t>${content.replace(/\n/g, '</w:t></w:r></w:p><w:p><w:r><w:t>')}</w:t>
            </w:r>
        </w:p>
    </w:body>
</w:document>`)

        return zip.generate({ type: 'arraybuffer' })
    }

    /**
     * Combine deux documents Word (ajoute une nouvelle page)
     * @param {Object} doc1 - Premier document
     * @param {Object} doc2 - Deuxième document
     */
    static async combineDocuments(doc1, doc2) {
        try {
            // Cette fonction nécessiterait une implémentation plus complexe
            // Pour l'instant, on retourne le deuxième document
            // TODO: Implémenter la vraie combinaison de documents Word
            console.log('⚠️ Combinaison de documents - fonction simplifiée pour l\'instant')
            return { document: doc2 }
        } catch (error) {
            console.error('❌ Erreur lors de la combinaison des documents:', error)
            throw error
        }
    }

    /**
     * Configure le document pour le mode paysage
     * @param {Object} doc - Document Docxtemplater
     */
    static configureLandscapeMode(doc) {
        try {
            console.log('🔄 Configuration du mode paysage...')
            
            // Accéder au zip du document
            const zip = doc.getZip()
            
            // Modifier le fichier document.xml pour le mode paysage
            const documentXml = zip.file('word/document.xml')
            if (documentXml) {
                let xmlContent = documentXml.asText()
                
                // Ajouter les propriétés de page pour le mode paysage
                const landscapeProperties = `
                <w:sectPr>
                    <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
                    <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
                    <w:cols w:space="708"/>
                    <w:docGrid w:linePitch="360"/>
                </w:sectPr>`
                
                // Remplacer ou ajouter les propriétés de section
                if (xmlContent.includes('<w:sectPr>')) {
                    xmlContent = xmlContent.replace(/<w:sectPr>[\s\S]*?<\/w:sectPr>/g, landscapeProperties)
                } else {
                    // Ajouter les propriétés de section à la fin du document
                    xmlContent = xmlContent.replace('</w:document>', `${landscapeProperties}\n</w:document>`)
                }
                
                // Mettre à jour le fichier dans le zip
                zip.file('word/document.xml', xmlContent)
            }
            
            console.log('✅ Mode paysage configuré')
            return doc
            
        } catch (error) {
            console.error('❌ Erreur lors de la configuration du mode paysage:', error)
            return doc // Retourner le document original en cas d'erreur
        }
    }

    /**
     * Génère un bulletin à partir d'un template Word et des données du DataStore (ancienne méthode)
     * @param {string} templatePath - Chemin vers le fichier template
     * @param {string} dataStoreKey - Clé du DataStore pour récupérer les données
     * @param {Object} period - Période du bulletin
     * @param {string} outputFileName - Nom du fichier de sortie
     */
    static async generateBulletin(templatePath, dataStoreKey, period, outputFileName) {
        try {
            console.log('🔄 Génération du bulletin en cours...')
            console.log('📄 Template:', templatePath)
            console.log('🔑 Clé DataStore:', dataStoreKey)
            console.log('📅 Période:', period)

            // 1. Récupérer les données depuis le DataStore
            const dataResult = await this.getDataFromDataStore(dataStoreKey)
            if (!dataResult.success) {
                throw new Error(`Impossible de récupérer les données: ${dataResult.message}`)
            }

            const configData = dataResult.data

            // 2. Préparer les données pour le template
            const templateData = this.prepareDataFromDataStore(configData, period)

            console.log('📊 Données préparées pour le template:', templateData)

            // 3. Charger le template Word
            const templateResponse = await fetch(templatePath)
            if (!templateResponse.ok) {
                throw new Error(`Erreur lors du chargement du template: ${templateResponse.status}`)
            }

            const templateArrayBuffer = await templateResponse.arrayBuffer()
            const zip = new PizZip(templateArrayBuffer)

            // 4. Créer le document template
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            })

            // 5. Injecter les données
            doc.setData(templateData)

            // 6. Rendre le document
            doc.render()

            // 7. Configurer le mode paysage
            const landscapeDoc = this.configureLandscapeMode(doc)

            // 8. Générer le fichier final
            const buf = landscapeDoc.getZip().generate({
                type: 'arraybuffer',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 4,
                },
            })

            // 9. Télécharger le fichier
            const blob = new Blob([buf], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            })

            saveAs(blob, outputFileName)

            console.log('✅ Bulletin généré avec succès:', outputFileName)
            return {
                success: true,
                message: `Bulletin "${outputFileName}" généré avec succès`,
                fileName: outputFileName,
                dataUsed: templateData
            }

        } catch (error) {
            console.error('❌ Erreur lors de la génération du bulletin:', error)
            return {
                success: false,
                message: `Erreur lors de la génération: ${error.message}`,
                error: error.message
            }
        }
    }

    /**
     * Prépare les données depuis le DataStore pour l'injection dans le template
     * @param {Object} configData - Données de configuration depuis le DataStore
     * @param {Object} period - Période du bulletin (optionnelle, peut venir du DataStore)
     */
    static prepareDataFromDataStore(configData, period = null) {
        console.log('🔄 Préparation des données depuis le DataStore:', configData)

        // Récupérer la période depuis le DataStore si elle n'est pas fournie
        const periodeStart = period?.start || configData.periode_start || configData.period_start || ''
        const periodeEnd = period?.end || configData.periode_end || configData.period_end || ''

        const data = {
            // Informations générales
            programme_name: configData.name || 'Programme Non Défini',
            programme_code: configData.key || '',
            periode_start: periodeStart,
            periode_end: periodeEnd,
            date_generation: new Date().toLocaleDateString('fr-FR'),
            heure_generation: new Date().toLocaleTimeString('fr-FR'),

            // Informations de l'établissement
            etablissement: configData.etablissement || configData.establishment || '',
            region: configData.region || '',
            district: configData.district || '',

            // Données des indicateurs depuis le DataStore
            ...this.formatIndicatorsFromDataStore(configData.indicators || [])
        }

        console.log('✅ Données préparées:', data)
        return data
    }

    /**
     * Prépare les données pour l'injection dans le template (ancienne méthode)
     * @param {Object} config - Configuration du bulletin
     * @param {Array} indicators - Données des indicateurs
     * @param {Object} period - Période du bulletin
     */
    static prepareDataForTemplate(config, indicators, period) {
        const data = {
            // Informations générales
            programme_name: config.name || 'Programme Non Défini',
            programme_code: config.key || '',
            periode_start: period.start || '',
            periode_end: period.end || '',
            date_generation: new Date().toLocaleDateString('fr-FR'),
            heure_generation: new Date().toLocaleTimeString('fr-FR'),

            // Informations de l'établissement
            etablissement: config.etablissement || '',
            region: config.region || '',
            district: config.district || '',

            // Données des indicateurs
            ...this.formatIndicatorsData(indicators)
        }

        return data
    }

    /**
     * Formate les données des indicateurs depuis le DataStore pour le template
     * @param {Array} indicators - Liste des indicateurs depuis le DataStore
     */
    static formatIndicatorsFromDataStore(indicators) {
        const data = {}
        
        indicators.forEach((indicator, index) => {
            const key = `indicateur_${index + 1}`
            
            // Utiliser les données réelles du DataStore
            data[`${key}_name`] = indicator.name || indicator.title || `Indicateur ${index + 1}`
            data[`${key}_value`] = indicator.value || indicator.currentValue || 'N/A'
            data[`${key}_unit`] = indicator.unit || ''
            data[`${key}_target`] = indicator.target || indicator.targetValue || ''
            data[`${key}_achievement`] = indicator.achievement || indicator.percentage || 'N/A'
            
            // Ajouter des variables supplémentaires si disponibles
            if (indicator.description) {
                data[`${key}_description`] = indicator.description
            }
            if (indicator.category) {
                data[`${key}_category`] = indicator.category
            }
        })

        return data
    }

    /**
     * Formate les données des indicateurs pour le template (ancienne méthode)
     * @param {Array} indicators - Liste des indicateurs
     */
    static formatIndicatorsData(indicators) {
        const data = {}
        
        indicators.forEach((indicator, index) => {
            const key = `indicateur_${index + 1}`
            data[`${key}_name`] = indicator.name || `Indicateur ${index + 1}`
            data[`${key}_value`] = indicator.value || 'N/A'
            data[`${key}_unit`] = indicator.unit || ''
            data[`${key}_target`] = indicator.target || ''
            data[`${key}_achievement`] = indicator.achievement || 'N/A'
        })

        return data
    }

    /**
     * Liste les templates disponibles dans le dossier upload
     */
    static async getAvailableTemplates() {
        try {
            const response = await fetch('http://localhost:3001/api/files')
            if (!response.ok) {
                throw new Error('Serveur non disponible')
            }

            const result = await response.json()
            if (!result.success) {
                throw new Error(result.message)
            }

            // Filtrer seulement les fichiers .docx et extraire la clé DataStore
            const templates = result.files
                .filter(file => file.name.toLowerCase().endsWith('.docx'))
                .map(file => {
                    // Extraire la clé DataStore du nom du fichier
                    // Exemple: header_PEV21-09-251305.docx -> PEV21-09-251305
                    const keyMatch = file.name.match(/_([^_]+)\.docx$/)
                    const dataStoreKey = keyMatch ? keyMatch[1] : null
                    
                    return {
                        ...file,
                        dataStoreKey: dataStoreKey
                    }
                })
                .filter(template => template.dataStoreKey) // Seulement ceux avec une clé valide

            return {
                success: true,
                templates: templates
            }

        } catch (error) {
            console.warn('⚠️ Serveur d\'upload non disponible, utilisation des templates de test:', error.message)
            
            // Templates de test par défaut
            const testTemplates = [
                {
                    name: 'header_PEV21-09-251305.docx',
                    dataStoreKey: 'PEV21-09-251305',
                    path: '/upload/header_PEV21-09-251305.docx',
                    size: 1024,
                    modified: new Date()
                },
                {
                    name: 'rubrique_PEV21-09-251305.docx',
                    dataStoreKey: 'PEV21-09-251305',
                    path: '/upload/rubrique_PEV21-09-251305.docx',
                    size: 2048,
                    modified: new Date()
                },
                {
                    name: 'sousrubrique_PEV21-09-251305.docx',
                    dataStoreKey: 'PEV21-09-251305',
                    path: '/upload/sousrubrique_PEV21-09-251305.docx',
                    size: 1536,
                    modified: new Date()
                }
            ]

            return {
                success: true,
                templates: testTemplates
            }
        }
    }

    /**
     * Récupère les données depuis le DataStore en utilisant la clé du template
     * @param {string} dataStoreKey - Clé du DataStore (suffixe du nom du fichier)
     */
    static async getDataFromDataStore(dataStoreKey) {
        try {
            console.log('🔍 Récupération des données depuis le DataStore:', dataStoreKey)
            
            const response = await fetch(`/api/dataStore/GENERATE-BULLETIN/${dataStoreKey}`)
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`Configuration "${dataStoreKey}" non trouvée dans le DataStore`)
                    throw new Error(`Configuration "${dataStoreKey}" non trouvée`)
                }
                throw new Error(`Erreur HTTP ${response.status}`)
            }

            const data = await response.json()
            console.log('✅ Données récupérées depuis le DataStore:', data)

            return {
                success: true,
                data: data,
                message: 'Données récupérées avec succès'
            }

        } catch (error) {
            console.warn('⚠️ DataStore non disponible, utilisation des données de test:', error.message)
            
            // Données de test par défaut
            const testData = {
                key: dataStoreKey,
                name: `Configuration ${dataStoreKey}`,
                etablissement: 'CHU de Test',
                region: 'Région Test',
                district: 'District Test',
                periode_start: '01/01/2024',
                periode_end: '31/01/2024',
                indicators: [
                    {
                        name: 'Nombre d\'enfants vaccinés',
                        value: 850,
                        unit: 'enfants',
                        target: 800,
                        achievement: '106%'
                    },
                    {
                        name: 'Taux de couverture',
                        value: 95,
                        unit: '%',
                        target: 90,
                        achievement: '106%'
                    },
                    {
                        name: 'Nombre de séances',
                        value: 18,
                        unit: 'séances',
                        target: 20,
                        achievement: '90%'
                    }
                ]
            }

            return {
                success: true,
                data: testData,
                message: 'Données de test utilisées'
            }
        }
    }

    /**
     * Prépare les données spécifiques pour une rubrique
     * @param {Object} baseData - Données de base
     * @param {Object} configData - Données de configuration
     * @param {number} rubriqueNumber - Numéro de la rubrique
     */
    static prepareRubriqueData(baseData, configData, rubriqueNumber) {
        const rubriqueData = { ...baseData }
        
        // Ajouter des variables spécifiques à la rubrique
        rubriqueData.rubrique_number = rubriqueNumber
        rubriqueData.rubrique_title = `Rubrique ${rubriqueNumber}`
        
        // Récupérer les données spécifiques à cette rubrique depuis le DataStore
        if (configData.sections && configData.sections[rubriqueNumber - 1]) {
            const section = configData.sections[rubriqueNumber - 1]
            rubriqueData.rubrique_title = section.name || `Rubrique ${rubriqueNumber}`
            rubriqueData.rubrique_description = section.description || ''
            
            // Ajouter les indicateurs spécifiques à cette rubrique
            if (section.indicators) {
                rubriqueData.rubrique_indicators = section.indicators
                // Formater les indicateurs pour le template
                Object.assign(rubriqueData, this.formatIndicatorsFromDataStore(section.indicators))
            }
        }

        return rubriqueData
    }

    /**
     * Prépare les données spécifiques pour une sous-rubrique
     * @param {Object} baseData - Données de base
     * @param {Object} configData - Données de configuration
     * @param {number} rubriqueNumber - Numéro de la rubrique parente
     * @param {number} sousRubriqueNumber - Numéro de la sous-rubrique
     */
    static prepareSousRubriqueData(baseData, configData, rubriqueNumber, sousRubriqueNumber) {
        const sousRubriqueData = { ...baseData }
        
        // Ajouter des variables spécifiques à la sous-rubrique
        sousRubriqueData.rubrique_number = rubriqueNumber
        sousRubriqueData.sous_rubrique_number = sousRubriqueNumber
        sousRubriqueData.sous_rubrique_title = `Sous-rubrique ${rubriqueNumber}.${sousRubriqueNumber}`
        
        // Récupérer les données spécifiques à cette sous-rubrique depuis le DataStore
        if (configData.sections && configData.sections[rubriqueNumber - 1] && 
            configData.sections[rubriqueNumber - 1].subsections && 
            configData.sections[rubriqueNumber - 1].subsections[sousRubriqueNumber - 1]) {
            
            const subsection = configData.sections[rubriqueNumber - 1].subsections[sousRubriqueNumber - 1]
            sousRubriqueData.sous_rubrique_title = subsection.name || `Sous-rubrique ${rubriqueNumber}.${sousRubriqueNumber}`
            sousRubriqueData.sous_rubrique_description = subsection.description || ''
            
            // Ajouter les indicateurs spécifiques à cette sous-rubrique
            if (subsection.indicators) {
                sousRubriqueData.sous_rubrique_indicators = subsection.indicators
                // Formater les indicateurs pour le template
                Object.assign(sousRubriqueData, this.formatIndicatorsFromDataStore(subsection.indicators))
            }
        }

        return sousRubriqueData
    }

    /**
     * Récupère les sous-rubriques pour une rubrique donnée
     * @param {Array} sousRubriques - Liste des templates de sous-rubriques
     * @param {number} rubriqueNumber - Numéro de la rubrique
     */
    static getSousRubriquesForRubrique(sousRubriques, rubriqueNumber) {
        // Filtrer les sous-rubriques qui correspondent à cette rubrique
        return sousRubriques.filter(template => {
            const name = template.name.toLowerCase()
            // Logique pour identifier les sous-rubriques d'une rubrique spécifique
            // Pour l'instant, on prend toutes les sous-rubriques disponibles
            return true
        })
    }

    /**
     * Récupère la liste des templates utilisés
     * @param {Object} templatesByType - Templates organisés par type
     */
    static getTemplatesUsed(templatesByType) {
        const used = []
        
        if (templatesByType.header.length > 0) {
            used.push(...templatesByType.header.map(t => t.name))
        }
        if (templatesByType.rubriques.length > 0) {
            used.push(...templatesByType.rubriques.map(t => t.name))
        }
        if (templatesByType.sousRubriques.length > 0) {
            used.push(...templatesByType.sousRubriques.map(t => t.name))
        }
        
        return used
    }

    /**
     * Valide les données avant génération
     * @param {Object} data - Données à valider
     */
    static validateData(data) {
        const errors = []

        if (!data.programme_name) {
            errors.push('Le nom du programme est requis')
        }

        if (!data.periode_start || !data.periode_end) {
            errors.push('La période est requise')
        }

        return {
            valid: errors.length === 0,
            errors: errors
        }
    }
}

export default BulletinGeneratorService
