import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

class BulletinGeneratorService {
    // Configuration DHIS2
    static DHIS2_CONFIG = {
        BASE_URL: window.location.origin.includes('dev.sigsante.ci') 
            ? 'https://dev.sigsante.ci' 
            : 'http://localhost:8080',
        API_PATH: '/api',
        CREDENTIALS: {
            username: 'admin',
            password: 'district'
        }
    }

    /**
     * 🎯 MÉTHODE DE TEST IMMÉDIATE POUR LES GRAPHIQUES
     */
    static async testGraphiqueImmediat(visualizationUID) {
        console.group('🚀 TEST IMMÉDIAT DU GRAPHIQUE');
        console.log(`📊 UID à tester: ${visualizationUID}`);
        
        if (!visualizationUID || visualizationUID.includes('REMPLACEZ')) {
            console.error('❌ ERREUR: UID non valide');
            console.groupEnd();
            return {
                success: false,
                message: 'UID non valide. Remplacez par le vrai UID de votre graphique.'
            };
        }

        try {
            // 1. Test de connexion DHIS2
            console.group('1. 🔐 TEST DE CONNEXION DHIS2');
            const testUrl = `${this.DHIS2_CONFIG.BASE_URL}/api/system/info.json`;
            const connectionResponse = await fetch(testUrl, {
                headers: this.getAuthHeaders()
            });
            
            if (!connectionResponse.ok) {
                console.error(`❌ CONNEXION ÉCHOUÉE: ${connectionResponse.status}`);
                console.groupEnd();
                return {
                    success: false,
                    message: `Connexion DHIS2 échouée: ${connectionResponse.status}`
                };
            }
            console.log('✅ CONNEXION RÉUSSIE');
            console.groupEnd();

            // 2. Test de la visualisation
            console.group('2. 📋 TEST DE LA VISUALISATION');
            const vizUrl = `${this.DHIS2_CONFIG.BASE_URL}/api/visualizations/${visualizationUID}.json?fields=id,name,type,title`;
            const vizResponse = await fetch(vizUrl, {
                headers: this.getAuthHeaders()
            });

            if (!vizResponse.ok) {
                console.error(`❌ VISUALISATION NON TROUVÉE: ${vizResponse.status}`);
                console.groupEnd();
                return {
                    success: false,
                    message: `Visualisation non trouvée: ${vizResponse.status}`
                };
            }
            const vizInfo = await vizResponse.json();
            console.log('✅ VISUALISATION TROUVÉE:', vizInfo.name);
            console.groupEnd();

            // 3. Test des endpoints d'image
            console.group('3. 🖼️ TEST DES ENDPOINTS D\'IMAGE');
            const imageResult = await this.fetchVisualizationImageWithDetailedLogs(visualizationUID);
            console.groupEnd();

            console.group('4. 🎯 SYNTHÈSE DU TEST');
            let finalResult;
            if (imageResult.success) {
                console.log('✅ SUCCÈS: Le graphique peut être récupéré');
                finalResult = {
                    success: true,
                    message: `Graphique récupéré avec succès! Taille: ${imageResult.size} bytes`,
                    size: imageResult.size,
                    endpointUsed: imageResult.endpointUsed,
                    isPng: imageResult.isPng,
                    visualizationInfo: vizInfo
                };
            } else {
                console.log('❌ ÉCHEC: Impossible de récupérer le graphique');
                finalResult = {
                    success: false,
                    message: imageResult.message
                };
            }
            console.groupEnd();
            console.groupEnd();
            
            return finalResult;

        } catch (error) {
            console.error('💥 ERREUR GLOBALE:', error);
            console.groupEnd();
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * 🎯 VERSION AVEC LOGS DÉTAILLÉS de fetchVisualizationImage
     */
    static async fetchVisualizationImageWithDetailedLogs(visualizationUID, period = null, orgUnit = null, width = 800, height = 500) {
        console.group(`🖼️🔄 RÉCUPÉRATION DÉTAILLÉE: ${visualizationUID}`);
        
        try {
            const { BASE_URL, CREDENTIALS } = this.DHIS2_CONFIG;
            const { username, password } = CREDENTIALS;

            // Construction des paramètres
            const params = new URLSearchParams({
                width: width.toString(),
                height: height.toString()
            });

            if (period) params.append('period', period);
            if (orgUnit) params.append('ou', orgUnit);

            // URLs à tester
            const possibleUrls = [
                `${BASE_URL}/api/visualizations/${visualizationUID}/data.png?${params}`,
                `${BASE_URL}/api/visualizations/${visualizationUID}/data?${params}&format=png`,
                `${BASE_URL}/api/visualizations/${visualizationUID}.png?${params}`,
                `${BASE_URL}/api/visualizations/${visualizationUID}?${params}&format=png`,
                `${BASE_URL}/api/visualizations/${visualizationUID}/data.png?width=${width}&height=${height}`,
                `${BASE_URL}/api/charts/${visualizationUID}.png?${params}`
            ];

            let attempt = 1;
            for (const url of possibleUrls) {
                console.log(`🔍 Tentative ${attempt}: ${url.replace(password, '***')}`);
                
                try {
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
                            'Accept': 'image/png,image/*;q=0.8,*/*;q=0.5'
                        },
                        credentials: 'include'
                    });

                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer();
                        
                        if (arrayBuffer.byteLength > 100) {
                            // Vérifier la signature PNG
                            const header = new Uint8Array(arrayBuffer, 0, 8);
                            const isPng = header[0] === 0x89 && header[1] === 0x50 && 
                                        header[2] === 0x4E && header[3] === 0x47;
                            
                            const base64Image = this.arrayBufferToBase64(arrayBuffer);
                            
                            console.groupEnd();
                            return {
                                success: true,
                                imageData: base64Image,
                                arrayBufferData: arrayBuffer,
                                imageType: 'png',
                                url: url.replace(password, '***'),
                                size: arrayBuffer.byteLength,
                                endpointUsed: `Tentative ${attempt}`,
                                isPng: isPng
                            };
                        }
                    }
                } catch (error) {
                    console.log(`💥 Erreur: ${error.message}`);
                }
                attempt++;
            }

            throw new Error(`Aucune des ${possibleUrls.length} URLs n'a fonctionné`);

        } catch (error) {
            console.error(`💥 Erreur globale: ${error.message}`);
            return {
                success: false,
                message: error.message,
                imageData: null,
                arrayBufferData: null
            };
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Récupère l'image d'une visualisation en ARRAYBUFFER - VERSION PRINCIPALE
     */
    static async fetchVisualizationImage(visualizationUID, period = null, orgUnit = null, width = 800, height = 500) {
        try {
            console.log(`🖼️ Récupération image: ${visualizationUID}`);
            
            const { BASE_URL, CREDENTIALS } = this.DHIS2_CONFIG;
            const { username, password } = CREDENTIALS;

            // Construction des paramètres
            const params = new URLSearchParams({
                width: width.toString(),
                height: height.toString()
            });

            if (period) params.append('period', period);
            if (orgUnit) params.append('ou', orgUnit);

            // URLs à tester
            const possibleUrls = [
                `${BASE_URL}/api/visualizations/${visualizationUID}/data.png?${params}`,
                `${BASE_URL}/api/visualizations/${visualizationUID}/data?${params}&format=png`,
                `${BASE_URL}/api/visualizations/${visualizationUID}.png?${params}`,
                `${BASE_URL}/api/visualizations/${visualizationUID}?${params}&format=png`,
                `${BASE_URL}/api/visualizations/${visualizationUID}/data.png?width=${width}&height=${height}`,
                `${BASE_URL}/api/charts/${visualizationUID}.png?${params}`
            ];

            for (const url of possibleUrls) {
                try {
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
                            'Accept': 'image/png,image/*;q=0.8,*/*;q=0.5'
                        },
                        credentials: 'include'
                    });

                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer();
                        
                        if (arrayBuffer.byteLength > 100) {
                            console.log(`🎉 Image valide! ${arrayBuffer.byteLength} bytes`);
                            
                            const base64Image = this.arrayBufferToBase64(arrayBuffer);
                            
                            return {
                                success: true,
                                imageData: base64Image,
                                arrayBufferData: arrayBuffer,
                                imageType: 'png',
                                url: url.replace(password, '***'),
                                size: arrayBuffer.byteLength
                            };
                        }
                    }
                } catch (error) {
                    // Continuer avec l'URL suivante
                }
            }

            throw new Error('Aucune URL n\'a fonctionné');

        } catch (error) {
            console.error('💥 Erreur fetchVisualizationImage:', error);
            return {
                success: false,
                message: error.message,
                imageData: null,
                arrayBufferData: null
            };
        }
    }

    /**
     * Récupère les données pour les visualisations - VERSION AMÉLIORÉE
     */
    static async fetchSubsectionVisualizations(visualizationsToProcess, periodId, orgUnitIds) {
        const visualizationsWithData = [];
        
        if (visualizationsToProcess.length === 0) {
            console.log(`📭 Aucune visualisation à traiter`);
            return visualizationsWithData;
        }

        console.log(`\n🎨 Traitement de ${visualizationsToProcess.length} visualisations`);
        
        for (const visualization of visualizationsToProcess) {
            const visualizationUID = visualization.uid || visualization.id;
            const vizName = visualization.name || 'Sans nom';
            console.log(`\n🔍 VISUALISATION: ${vizName} (${visualizationUID})`);
            
            try {
                // Récupérer l'image
                const imageResult = await this.fetchVisualizationImage(visualizationUID, periodId, orgUnitIds[0]);
                
                const vizData = {
                    ...visualization,
                    image: imageResult,
                    hasData: true,
                    hasImage: imageResult.success,
                    arrayBufferData: imageResult.arrayBufferData,
                    error: !imageResult.success ? imageResult.message : null
                };
                
                visualizationsWithData.push(vizData);
                
                if (imageResult.success) {
                    console.log(`✅ Succès - Image: ${imageResult.size} bytes`);
                } else {
                    console.log(`❌ Échec - ${imageResult.message}`);
                }
                
            } catch (error) {
                console.error(`💥 Erreur traitement:`, error);
                visualizationsWithData.push({
                    ...visualization,
                    image: null,
                    hasData: false,
                    hasImage: false,
                    error: error.message
                });
            }
        }

        const successCount = visualizationsWithData.filter(v => v.hasImage).length;
        console.log(`\n📈 RÉSULTAT VISUALISATIONS: ${successCount}/${visualizationsToProcess.length} réussies`);
        
        return visualizationsWithData;
    }

    /**
     * Récupère les données d'un indicateur
     */
    static async fetchSingleIndicatorData(indicatorId, periodId, orgUnitId) {
        try {
            const apiUrl = `${this.DHIS2_CONFIG.BASE_URL}/api/analytics.json?dimension=dx:${indicatorId}&dimension=pe:${periodId}&filter=ou:${orgUnitId}&displayProperty=NAME&skipMeta=false&skipData=false`;
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: this.getAuthHeaders(),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return this.extractValueFromAnalyticsResponse(data, indicatorId);

        } catch (error) {
            console.error(`   ❌ Erreur API: ${error.message}`);
            return {
                value: 'N/D',
                note: `Erreur: ${error.message}`,
                isRealData: false
            };
        }
    }

    /**
     * Extrait la valeur de la réponse Analytics
     */
    static extractValueFromAnalyticsResponse(apiData, indicatorId) {
        try {
            if (apiData.rows && apiData.rows.length > 0) {
                const lastRow = apiData.rows[apiData.rows.length - 1];
                if (lastRow.length >= 3) {
                    const value = lastRow[2];
                    
                    if (value !== undefined && value !== null && value !== '' && value !== '0') {
                        return {
                            value: this.formatValue(value),
                            note: 'Donnée réelle DHIS2',
                            isRealData: true
                        };
                    }
                }
            }

            return {
                value: '0',
                note: 'Aucune donnée saisie',
                isRealData: false
            };

        } catch (error) {
            console.error(`   🚨 Erreur extraction: ${error.message}`);
            return {
                value: 'Erreur',
                note: `Erreur extraction: ${error.message}`,
                isRealData: false
            };
        }
    }

    /**
     * Récupère les données pour un groupe d'indicateurs
     */
    static async fetchIndicatorGroupData(indicators, periodId, orgUnitIds) {
        const indicatorsWithData = [];
        
        console.log(`   📊 Traitement de ${indicators.length} indicateurs`);
        
        for (const indicator of indicators) {
            let bestData = null;
            
            for (const orgUnitId of orgUnitIds) {
                const indicatorData = await this.fetchSingleIndicatorData(
                    indicator.id,
                    periodId,
                    orgUnitId
                );
                
                if (indicatorData.isRealData) {
                    bestData = indicatorData;
                    break;
                }
            }
            
            if (!bestData) {
                bestData = {
                    value: 'N/D',
                    note: 'Aucune donnée disponible',
                    isRealData: false
                };
            }
            
            indicatorsWithData.push({
                ...indicator,
                data: bestData
            });
        }
        
        return indicatorsWithData;
    }

    /**
     * Récupère toutes les données dynamiquement (indicateurs ET visualisations)
     */
    static async fetchAllIndicatorsDataDynamically(configData) {
        const sections = JSON.parse(JSON.stringify(configData.sections || []));
        
        const periodId = this.getPeriodFromConfig(configData);
        const orgUnitIds = this.getOrgUnitsFromConfig(configData);

        console.log(`🎯 PARAMÈTRES: Période: ${periodId}, Unités: ${orgUnitIds.join(', ')}`);

        let totalIndicators = 0;
        let successfulIndicators = 0;
        let totalVisualizations = 0;
        let successfulVisualizations = 0;

        for (const section of sections) {
            if (!section.subsections) continue;
            
            for (const subsection of section.subsections) {
                // Traiter les indicateurs (si configurés)
                if (subsection.indicatorGroups) {
                    for (const indicatorGroup of subsection.indicatorGroups) {
                        if (!indicatorGroup.selectedIndicators) continue;
                        
                        console.log(`\n📋 "${section.title}" → "${subsection.title}" → "${indicatorGroup.name}"`);
                        
                        const indicatorsWithData = await this.fetchIndicatorGroupData(
                            indicatorGroup.selectedIndicators,
                            periodId,
                            orgUnitIds
                        );
                        
                        indicatorGroup.selectedIndicators = indicatorsWithData;
                        
                        const successCount = indicatorsWithData.filter(ind => ind.data?.isRealData).length;
                        successfulIndicators += successCount;
                        totalIndicators += indicatorsWithData.length;
                        
                        console.log(`   📊 ${successCount}/${indicatorsWithData.length} indicateurs avec données`);
                    }
                }
                
                // Traiter les visualisations (si configurées)
                if (subsection.visualizationGroups && subsection.visualizationGroups.length > 0) {
                    console.log(`\n🎨 "${section.title}" → "${subsection.title}" → Visualisations`);
                    
                    for (const vizGroup of subsection.visualizationGroups) {
                        if (!vizGroup.selectedVisualizations || vizGroup.selectedVisualizations.length === 0) continue;
                        
                        console.log(`   📊 Groupe: "${vizGroup.name}" (${vizGroup.selectedVisualizations.length} visualisations)`);
                        
                        const visualizationsWithData = await this.fetchSubsectionVisualizations(
                            vizGroup.selectedVisualizations, 
                            periodId, 
                            orgUnitIds
                        );
                        
                        vizGroup.selectedVisualizations = visualizationsWithData;
                        
                        const successVizCount = visualizationsWithData.filter(viz => viz.hasImage).length;
                        successfulVisualizations += successVizCount;
                        totalVisualizations += visualizationsWithData.length;
                        
                        console.log(`   🖼️ ${successVizCount}/${visualizationsWithData.length} visualisations réussies`);
                    }
                }
            }
        }

        console.log(`\n📊 RÉSULTAT GLOBAL:`);
        console.log(`   📈 Indicateurs: ${successfulIndicators}/${totalIndicators}`);
        console.log(`   🎨 Visualisations: ${successfulVisualizations}/${totalVisualizations}`);

        return sections;
    }

    /**
     * Convertit la période en format DHIS2
     */
    static getPeriodFromConfig(configData) {
        if (!configData.periodValue) return 'THIS_MONTH';

        if (typeof configData.periodValue === 'string') {
            return configData.periodValue;
        }

        if (configData.periodValue.year && configData.periodValue.month && configData.periodValue.day) {
            return `${configData.periodValue.year}${configData.periodValue.month.toString().padStart(2, '0')}${configData.periodValue.day.toString().padStart(2, '0')}`;
        }

        if (configData.periodValue.year && configData.periodValue.month) {
            return `${configData.periodValue.year}${configData.periodValue.month.toString().padStart(2, '0')}`;
        }

        if (configData.periodValue.year) {
            return configData.periodValue.year.toString();
        }

        return 'THIS_MONTH';
    }

    /**
     * Récupère les unités d'organisation
     */
    static getOrgUnitsFromConfig(configData) {
        const orgUnits = [];
        
        if (configData.selectedOrgUnits && configData.selectedOrgUnits.length > 0) {
            orgUnits.push(...configData.selectedOrgUnits);
        }
        
        if (!orgUnits.includes('USER_ORGUNIT')) {
            orgUnits.push('USER_ORGUNIT');
        }
        
        return orgUnits;
    }

    /**
     * Récupère la configuration depuis le DataStore
     */
    static async getCompleteConfigFromDataStore(dataStoreKey) {
        try {
            console.log(`📁 Chargement configuration: ${dataStoreKey}`);
            
            const response = await fetch(`/api/dataStore/GENERATE-BULLETIN/${dataStoreKey}`);
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: Impossible de charger la configuration`);
            }
            
            const configData = await response.json();
            console.log('✅ Configuration chargée');
            
            return { success: true, data: configData };

        } catch (error) {
            console.error('❌ Erreur chargement configuration:', error);
            return { 
                success: false, 
                message: `Erreur: ${error.message}` 
            };
        }
    }

    /**
     * Génère le document Word complet
     */
    static async generateCompleteBulletin(dataStoreKey, outputFileName) {
        try {
            console.log('🔄 Début génération bulletin...');
            console.log(`📁 DataStore: ${dataStoreKey}`);
            console.log(`💾 Fichier: ${outputFileName}`);

            // 1. Récupérer configuration
            const configResult = await this.getCompleteConfigFromDataStore(dataStoreKey);
            if (!configResult.success) {
                throw new Error(`Configuration: ${configResult.message}`);
            }

            const configData = configResult.data;
            console.log('✅ Configuration chargée');

            // 2. Récupérer données DHIS2 (indicateurs ET visualisations)
            console.log('\n📡 RÉCUPÉRATION DONNÉES DHIS2...');
            const sectionsWithData = await this.fetchAllIndicatorsDataDynamically(configData);
            
            // 3. Analyser résultats
            const dataStats = this.analyzeDataResults(sectionsWithData);
            
            if (dataStats.realDataCount === 0 && dataStats.successfulVisualizations === 0) {
                console.log('⚠️ ATTENTION: Aucune donnée réelle trouvée');
            }

            configData.sections = sectionsWithData;

            // 4. Préparer données template
            const templateData = this.prepareRealBulletinData(configData, dataStats);

            // 5. Générer document Word
            const result = await this.generatePagedDocument(templateData, outputFileName);

            console.log(`\n🎉 GÉNÉRATION TERMINÉE: ${outputFileName}`);
            console.log(`📊 RÉSULTAT:`);
            console.log(`   ✅ Indicateurs: ${dataStats.realDataCount}/${dataStats.totalIndicators}`);
            console.log(`   ✅ Visualisations: ${dataStats.successfulVisualizations}/${dataStats.totalVisualizations}`);

            return {
                ...result,
                dataStats: dataStats,
                hasRealData: dataStats.hasRealData
            };

        } catch (error) {
            console.error('❌ Erreur génération:', error);
            return {
                success: false,
                message: `Erreur: ${error.message}`,
                error: error.message
            };
        }
    }

    /**
     * Génère le document Word paginé AVEC GRAPHIQUES
     */
    static async generatePagedDocument(templateData, outputFileName) {
        console.group('📄 === GÉNÉRATION DOCUMENT WORD ===');
        
        try {
            console.log('Fichier de sortie:', outputFileName);
            console.log('Nombre de sections:', templateData.sections?.length || 0);

            // Charger l'en-tête
            console.log('\n1️⃣ Chargement en-tête...');
            const headerTemplate = await this.loadTemplate('header_PEV21-09-251305.docx');
            const headerDoc = await this.renderTemplate(headerTemplate, templateData);
            console.log(`✅ En-tête rendu: ${headerDoc.byteLength} bytes`);
            
            // Générer contenu paginé AVEC GRAPHIQUES
            console.log('\n2️⃣ Génération contenu avec graphiques...');
            const contentDocs = await this.generatePagedContentWithVisualizations(templateData.sections);
            console.log(`✅ ${contentDocs.length} document(s) de contenu généré(s)`);
            
            // Fusionner documents
            console.log('\n3️⃣ Fusion des documents...');
            const allDocs = [headerDoc, ...contentDocs];
            console.log(`📚 Total documents à fusionner: ${allDocs.length}`);
            const finalDocument = await this.mergeAllDocuments(allDocs);
            console.log(`✅ Documents fusionnés: ${finalDocument.byteLength} bytes`);

            // Créer ZIP final
            console.log('\n4️⃣ Finalisation du ZIP...');
            const finalZip = new PizZip(finalDocument);
            
            // Vérifier les médias dans le ZIP
            const mediaFiles = finalZip.file(/^word\/media\//);
            console.log(`📊 Fichiers média dans le ZIP: ${mediaFiles.length}`);
            mediaFiles.forEach((file, index) => {
                console.log(`   ${index + 1}. ${file.name} (${file._data?.length || 'taille inconnue'} bytes)`);
            });
            
            // Générer document final
            console.log('\n5️⃣ Génération du fichier final...');
            const finalDocumentArray = finalZip.generate({ 
                type: 'arraybuffer', 
                compression: 'DEFLATE' 
            });
            console.log(`✅ Fichier final: ${finalDocumentArray.byteLength} bytes`);

            // Sauvegarder
            console.log('\n6️⃣ Sauvegarde du fichier...');
            const blob = new Blob([finalDocumentArray], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            saveAs(blob, outputFileName);
            console.log(`✅ Fichier sauvegardé: ${outputFileName}`);

            console.groupEnd();
            
            return {
                success: true,
                message: `Bulletin généré: ${outputFileName}`,
                fileName: outputFileName,
                fileSize: finalDocumentArray.byteLength,
                mediaCount: mediaFiles.length
            };

        } catch (error) {
            console.error('💥 ERREUR GÉNÉRATION DOCUMENT:', error);
            console.error('Stack trace:', error.stack);
            console.groupEnd();
            throw error;
        }
    }

    /**
     * Génère le contenu paginé AVEC VISUALISATIONS
     */
    static async generatePagedContentWithVisualizations(sections) {
        console.group('📚 === GÉNÉRATION CONTENU PAGINÉ ===');
        console.log(`📊 Nombre de sections: ${sections.length}`);
        
        const contentDocs = [];

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            console.group(`\n📖 SECTION ${i + 1}/${sections.length}: "${section.title}"`);
            
            try {
                // PAGE 1: RUBRIQUE
                console.log('📄 Création page rubrique...');
                const rubriqueTemplate = await this.loadTemplate('rubrique_PEV21-09-251305.docx');
                const rubriqueData = { Rubrique: section.title };
                const rubriqueDoc = await this.renderTemplate(rubriqueTemplate, rubriqueData);
                contentDocs.push(rubriqueDoc);
                console.log(`✅ Page rubrique: ${rubriqueDoc.byteLength} bytes`);

                // SAUT DE PAGE
                const pageBreakAfterRubrique = await this.createPageBreakDocument();
                contentDocs.push(pageBreakAfterRubrique);

                // PAGE 2: SOUS-RUBRIQUES
                if (section.subsections && section.subsections.length > 0) {
                    console.log(`\n📋 ${section.subsections.length} sous-rubrique(s)`);
                    
                    for (let j = 0; j < section.subsections.length; j++) {
                        const subsection = section.subsections[j];
                        console.group(`\n📝 Sous-rubrique ${j + 1}: "${subsection.title}"`);
                        
                        // Template sous-rubrique
                        const sousRubriqueTemplate = await this.loadTemplate('sousrubrique_PEV21-09-251305.docx');
                        const contenuStructure = this.prepareStructuredSubsectionContent(subsection);
                        
                        const sousRubriqueData = {
                            "Sous-rubrique": subsection.title,
                            "Contenu": contenuStructure,
                            "hasVisualizations": subsection.visualizations && subsection.visualizations.length > 0
                        };
                        
                        const sousRubriqueDoc = await this.renderTemplate(sousRubriqueTemplate, sousRubriqueData);
                        contentDocs.push(sousRubriqueDoc);
                        console.log(`✅ Sous-rubrique: ${sousRubriqueDoc.byteLength} bytes`);

                        // ⭐⭐⭐ AJOUTER LES GRAPHIQUES ⭐⭐⭐
                        if (subsection.visualizations && subsection.visualizations.length > 0) {
                            console.log(`\n🖼️ Traitement ${subsection.visualizations.length} graphique(s)...`);
                            await this.addVisualizationImages(contentDocs, subsection.visualizations);
                        } else {
                            console.log('ℹ️ Aucun graphique');
                        }

                        // Saut de ligne entre sous-rubriques
                        if (j < section.subsections.length - 1) {
                            const lineBreak = await this.createLineBreakDocument();
                            contentDocs.push(lineBreak);
                        }
                        
                        console.groupEnd();
                    }
                }

                // SAUT DE PAGE (sauf dernière rubrique)
                if (i < sections.length - 1) {
                    const pageBreakAfterSubsections = await this.createPageBreakDocument();
                    contentDocs.push(pageBreakAfterSubsections);
                }

            } catch (error) {
                console.error(`💥 ERREUR section:`, error);
                console.error('Stack:', error.stack);
            }
            
            console.groupEnd();
        }

        console.log(`\n✅ RÉSULTAT: ${contentDocs.length} document(s)`);
        console.groupEnd();
        
        return contentDocs;
    }

    /**
     * ⭐⭐⭐ AJOUTE LES IMAGES DES GRAPHIQUES DANS LE DOCUMENT ⭐⭐⭐
     */
    static async addVisualizationImages(contentDocs, visualizations) {
        console.group(`🖼️ === AJOUT GRAPHIQUES AU DOCUMENT ===`);
        console.log(`📊 Visualisations à traiter: ${visualizations.length}`);
        console.log(`📚 ContentDocs avant: ${contentDocs.length} documents`);
        
        for (let i = 0; i < visualizations.length; i++) {
            const visualization = visualizations[i];
            console.group(`\n🎨 [${i + 1}/${visualizations.length}] ${visualization.name}`);
            
            // Diagnostic complet
            console.log('📋 État complet:');
            console.log(`   - name: "${visualization.name}"`);
            console.log(`   - uid: ${visualization.uid || visualization.id}`);
            console.log(`   - hasImage: ${visualization.hasImage}`);
            console.log(`   - hasArrayBuffer: ${!!visualization.arrayBufferData}`);
            console.log(`   - arrayBuffer size: ${visualization.arrayBufferData?.byteLength || 0} bytes`);
            console.log(`   - error: ${visualization.error || 'aucune'}`);
            
            if (visualization.hasImage && visualization.arrayBufferData) {
                try {
                    console.log('✅ Conditions OK - Création document image...');
                    
                    const imageDoc = await this.createImageDocument(
                        visualization.arrayBufferData, 
                        visualization.name,
                        'png'
                    );
                    
                    if (imageDoc && imageDoc.byteLength > 0) {
                        contentDocs.push(imageDoc);
                        console.log(`✅ Document image ajouté (${imageDoc.byteLength} bytes)`);
                        console.log(`📍 Position dans contentDocs: ${contentDocs.length - 1}`);
                        
                        // Saut de ligne
                        const lineBreak = await this.createLineBreakDocument();
                        contentDocs.push(lineBreak);
                        console.log('✅ Saut de ligne ajouté');
                    } else {
                        console.error('❌ imageDoc vide ou null');
                    }
                    
                } catch (error) {
                    console.error('💥 ERREUR création image:', error);
                    console.error('Stack:', error.stack);
                    
                    const errorDoc = await this.createErrorMessageDocument(
                        `Graphique "${visualization.name}" non disponible`
                    );
                    contentDocs.push(errorDoc);
                }
            } else {
                console.warn('⚠️ Conditions NON remplies:');
                if (!visualization.hasImage) console.warn('   - hasImage = false');
                if (!visualization.arrayBufferData) console.warn('   - arrayBufferData manquant');
                
                const missingDoc = await this.createErrorMessageDocument(
                    `Graphique "${visualization.name}" non disponible`
                );
                contentDocs.push(missingDoc);
            }
            
            console.groupEnd();
        }
        
        console.log(`\n📚 ContentDocs après: ${contentDocs.length} documents (+${contentDocs.length - visualizations.length})`);
        console.groupEnd();
    }

    /**
     * ⭐⭐⭐ CRÉE UN DOCUMENT AVEC UNE IMAGE POUR WORD ⭐⭐⭐
     */
    static async createImageDocument(arrayBuffer, imageName, imageType = 'png') {
        console.group(`🏗️ === CRÉATION DOCUMENT IMAGE ===`);
        console.log(`📛 Nom: ${imageName}`);
        
        try {
            // Vérifications initiales
            console.log('🔍 Vérifications:');
            console.log(`   - arrayBuffer exists: ${!!arrayBuffer}`);
            console.log(`   - arrayBuffer type: ${arrayBuffer?.constructor.name}`);
            console.log(`   - arrayBuffer size: ${arrayBuffer?.byteLength || 0} bytes`);
            
            if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                throw new Error('ArrayBuffer vide ou invalide');
            }
            
            // Vérifier signature PNG
            const header = new Uint8Array(arrayBuffer, 0, 8);
            const isPng = header[0] === 0x89 && header[1] === 0x50 && 
                         header[2] === 0x4E && header[3] === 0x47;
            console.log(`   - Signature PNG: ${isPng ? '✅' : '❌'} [${header[0]}, ${header[1]}, ${header[2]}, ${header[3]}]`);
            
            // Charger template
            console.log('\n📂 Chargement template...');
            const templateBuffer = await this.loadTemplate('sousrubrique_PEV21-09-251305.docx');
            console.log(`✅ Template: ${templateBuffer.byteLength} bytes`);
            
            // Créer ZIP
            console.log('\n📦 Création ZIP...');
            const zip = new PizZip(templateBuffer);
            console.log('✅ ZIP créé');
            
            // Lire document.xml
            let documentXml = zip.file('word/document.xml').asText();
            console.log(`✅ document.xml: ${documentXml.length} caractères`);
            
            // Générer ID et nom fichier
            const imageId = Date.now();
            const imageFilename = `image${imageId}.${imageType}`;
            console.log(`\n🆔 Image:`, {
                id: imageId,
                filename: imageFilename,
                path: `word/media/${imageFilename}`
            });
            
            // Ajouter image au ZIP
            console.log('\n📥 Ajout image au ZIP...');
            zip.file(`word/media/${imageFilename}`, arrayBuffer);
            console.log('✅ Image ajoutée');
            
            // Vérification
            const addedFile = zip.file(`word/media/${imageFilename}`);
            if (addedFile) {
                console.log('✅ VÉRIFICATION: Image présente dans ZIP');
            } else {
                console.error('❌ ERREUR: Image ABSENTE du ZIP!');
                throw new Error('Impossible d\'ajouter l\'image au ZIP');
            }
            
            // Mettre à jour relations
            console.log('\n🔗 Mise à jour relations...');
            await this.updateDocumentRelations(zip, imageId, imageFilename, imageType);
            
            // Générer XML image
            console.log('\n🖼️ Génération XML image...');
            const imageXml = this.generateImageXml(imageId, imageName);
            console.log(`✅ XML généré: ${imageXml.length} caractères`);
            
            // Remplacer contenu
            console.log('\n🔄 Remplacement contenu document...');
            const bodyMatch = documentXml.match(/<w:body>[\s\S]*?<\/w:body>/);
            if (!bodyMatch) {
                throw new Error('Balise <w:body> non trouvée');
            }
            console.log('✅ <w:body> trouvé');
            
            documentXml = documentXml.replace(
                /<w:body>[\s\S]*?<\/w:body>/,
                `<w:body>${imageXml}</w:body>`
            );
            console.log('✅ Contenu remplacé');
            
            // Mettre à jour ZIP
            zip.file('word/document.xml', documentXml);
            console.log('✅ document.xml mis à jour');
            
            // Générer document final
            console.log('\n💾 Génération document final...');
            const finalDoc = zip.generate({ 
                type: 'arraybuffer', 
                compression: 'DEFLATE' 
            });
            console.log(`✅ Document final: ${finalDoc.byteLength} bytes`);
            
            // Vérification finale
            const finalZip = new PizZip(finalDoc);
            const finalMedia = finalZip.file(/^word\/media\//);
            console.log(`✅ VÉRIFICATION FINALE: ${finalMedia.length} fichier(s) média dans document`);
            
            console.groupEnd();
            return finalDoc;
            
        } catch (error) {
            console.error('💥 ERREUR CRITIQUE:', error.message);
            console.error('Stack:', error.stack);
            console.groupEnd();
            throw error;
        }
    }

    /**
     * Met à jour les relations du document pour les images
     */
    static async updateDocumentRelations(zip, imageId, imageFilename, imageType) {
        console.group('🔗 MISE À JOUR RELATIONS');
        
        try {
            const relationsFile = 'word/_rels/document.xml.rels';
            console.log(`📂 Fichier: ${relationsFile}`);
            
            const relFile = zip.file(relationsFile);
            if (!relFile) {
                throw new Error(`${relationsFile} non trouvé`);
            }
            
            let relationsXml = relFile.asText();
            console.log(`📄 Relations chargées: ${relationsXml.length} caractères`);
            
            const newRelation = `<Relationship Id="rId${imageId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${imageFilename}"/>`;
            
            console.log('➕ Nouvelle relation:');
            console.log(`   ID: rId${imageId}`);
            console.log(`   Target: media/${imageFilename}`);
            
            const beforeLength = relationsXml.length;
            relationsXml = relationsXml.replace('</Relationships>', `${newRelation}</Relationships>`);
            const afterLength = relationsXml.length;
            
            if (afterLength > beforeLength) {
                console.log(`✅ Relation ajoutée (+${afterLength - beforeLength} caractères)`);
            } else {
                throw new Error('Relation non ajoutée');
            }
            
            zip.file(relationsFile, relationsXml);
            console.log('✅ Relations mises à jour');
            
            console.groupEnd();
        } catch (error) {
            console.error('💥 ERREUR:', error.message);
            console.groupEnd();
            throw error;
        }
    }

    /**
     * Génère le XML pour l'image Word
     */
    static generateImageXml(imageId, imageName) {
        return `
            <w:p>
                <w:pPr>
                    <w:jc w:val="center"/>
                </w:pPr>
                <w:r>
                    <w:drawing>
                        <wp:inline distT="0" distB="0" distL="0" distR="0">
                            <wp:extent cx="5486400" cy="3200400"/>
                            <wp:effectExtent l="0" t="0" r="0" b="0"/>
                            <wp:docPr id="${imageId}" name="${imageName}"/>
                            <wp:cNvGraphicFramePr>
                                <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
                            </wp:cNvGraphicFramePr>
                            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                                <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                                    <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                                        <pic:nvPicPr>
                                            <pic:cNvPr id="0" name="Picture"/>
                                            <pic:cNvPicPr/>
                                        </pic:nvPicPr>
                                        <pic:blipFill>
                                            <a:blip r:embed="rId${imageId}"/>
                                            <a:stretch>
                                                <a:fillRect/>
                                            </a:stretch>
                                        </pic:blipFill>
                                        <pic:spPr>
                                            <a:xfrm>
                                                <a:off x="0" y="0"/>
                                                <a:ext cx="5486400" cy="3200400"/>
                                            </a:xfrm>
                                            <a:prstGeom prst="rect">
                                                <a:avLst/>
                                            </a:prstGeom>
                                        </pic:spPr>
                                    </pic:pic>
                                </a:graphicData>
                            </a:graphic>
                        </wp:inline>
                    </w:drawing>
                </w:r>
            </w:p>
            <w:p>
                <w:pPr>
                    <w:jc w:val="center"/>
                </w:pPr>
                <w:r>
                    <w:t>${this.escapeXml(imageName)}</w:t>
                </w:r>
            </w:p>
        `;
    }

    /**
     * Fusionne tous les documents
     */
    static async mergeAllDocuments(documents) {
        console.group('🔀 === FUSION DOCUMENTS ===');
        console.log(`📚 Documents à fusionner: ${documents.length}`);
        
        if (documents.length === 0) {
            throw new Error('Aucun document');
        }
        if (documents.length === 1) {
            console.log('ℹ️ Un seul document, pas de fusion');
            console.groupEnd();
            return documents[0];
        }

        try {
            console.log(`\n📄 Document de base: ${documents[0].byteLength} bytes`);
            const baseZip = new PizZip(documents[0]);
            let baseDocumentXml = baseZip.file('word/document.xml').asText();
            console.log(`📄 document.xml base: ${baseDocumentXml.length} caractères`);
            
            let totalBodyLength = 0;
            let totalMediaCopied = 0;
            
            for (let i = 1; i < documents.length; i++) {
                console.log(`\n🔗 [${i}/${documents.length - 1}] Fusion document ${i + 1} (${documents[i].byteLength} bytes)`);
                
                try {
                    const docZip = new PizZip(documents[i]);
                    const docXml = docZip.file('word/document.xml').asText();
                    
                    // Extraire body
                    const bodyMatch = docXml.match(/<w:body[^>]*>([\s\S]*?)<\/w:body>/);
                    if (bodyMatch) {
                        const bodyContent = bodyMatch[1];
                        console.log(`   📦 Body extrait: ${bodyContent.length} caractères`);
                        
                        baseDocumentXml = baseDocumentXml.replace('</w:body>', bodyContent + '</w:body>');
                        totalBodyLength += bodyContent.length;
                        console.log('   ✅ Body fusionné');
                    }
                    
                    // Copier médias
                    const mediaFiles = docZip.file(/^word\/media\//);
                    if (mediaFiles.length > 0) {
                        console.log(`   🖼️ ${mediaFiles.length} fichier(s) média trouvé(s)`);
                        
                        mediaFiles.forEach((file, index) => {
                            const content = file.asUint8Array();
                            baseZip.file(file.name, content);
                            console.log(`      [${index + 1}] ${file.name} (${content.length} bytes) ✅`);
                            totalMediaCopied++;
                        });
                    }
                    
                    // Copier relations si présentes
                    const relsFile = docZip.file('word/_rels/document.xml.rels');
                    if (relsFile) {
                        const newRels = relsFile.asText();
                        const baseRelsFile = baseZip.file('word/_rels/document.xml.rels');
                        
                        if (baseRelsFile) {
                            let baseRels = baseRelsFile.asText();
                            
                            // Extraire nouvelles relations
                            const relMatches = newRels.matchAll(/<Relationship[^>]*>/g);
                            for (const match of relMatches) {
                                const rel = match[0];
                                if (!baseRels.includes(rel) && rel.includes('image')) {
                                    baseRels = baseRels.replace('</Relationships>', rel + '</Relationships>');
                                    console.log(`      🔗 Relation image copiée`);
                                }
                            }
                            
                            baseZip.file('word/_rels/document.xml.rels', baseRels);
                        }
                    }
                    
                } catch (error) {
                    console.error(`   💥 Erreur fusion document ${i + 1}:`, error.message);
                }
            }

            console.log(`\n📊 RÉSULTAT FUSION:`);
            console.log(`   - Body total: ${totalBodyLength} caractères ajoutés`);
            console.log(`   - Médias copiés: ${totalMediaCopied}`);
            console.log(`   - document.xml final: ${baseDocumentXml.length} caractères`);
            
            // Mettre à jour document.xml
            baseZip.file('word/document.xml', baseDocumentXml);
            
            // Vérification finale
            const finalMedia = baseZip.file(/^word\/media\//);
            console.log(`\n✅ VÉRIFICATION: ${finalMedia.length} fichier(s) média dans ZIP final`);
            finalMedia.forEach((file, index) => {
                console.log(`   ${index + 1}. ${file.name}`);
            });
            
            const finalDoc = baseZip.generate({ 
                type: 'arraybuffer', 
                compression: 'DEFLATE' 
            });
            console.log(`\n✅ Document fusionné: ${finalDoc.byteLength} bytes`);
            
            console.groupEnd();
            return finalDoc;
            
        } catch (error) {
            console.error('💥 ERREUR FUSION:', error);
            console.groupEnd();
            throw error;
        }
    }

    /**
     * Prépare le contenu d'une sous-rubrique
     */
    static prepareStructuredSubsectionContent(subsection) {
        let content = '';
        
        // Éléments indicateurs
        if (subsection.elements && subsection.elements.length > 0) {
            subsection.elements.forEach((element, index) => {
                const elementNumber = index + 1;
                const realValue = element.value || 'N/D';
                
                content += `${elementNumber}. ${element.name}: ${realValue}`;
                
                if (!element.isRealData && realValue === 'N/D') {
                    content += ' (Donnée manquante)';
                } else if (element.note && element.note !== 'Donnée réelle DHIS2') {
                    content += ` - ${element.note}`;
                }
                
                content += '\n';
            });
        }
        
        // Visualisations
        if (subsection.visualizations && subsection.visualizations.length > 0) {
            if (content !== '') content += '\n';
            content += '📊 GRAPHIQUES:\n';
            subsection.visualizations.forEach((viz, index) => {
                const vizNumber = index + 1;
                if (viz.hasImage) {
                    content += `${vizNumber}. ${viz.name} - Graphique intégré\n`;
                } else {
                    content += `${vizNumber}. ${viz.name} - Non disponible\n`;
                }
            });
        }
        
        if (content === '') {
            content = 'Aucun élément disponible';
        }
        
        return content;
    }

    /**
     * Crée un message d'erreur
     */
    static async createErrorMessageDocument(message) {
        try {
            const templateBuffer = await this.loadTemplate('sousrubrique_PEV21-09-251305.docx');
            const zip = new PizZip(templateBuffer);
            let documentXml = zip.file('word/document.xml').asText();
            
            const errorXml = `
                <w:p>
                    <w:pPr>
                        <w:jc w:val="center"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:color w:val="FF0000"/>
                            <w:i/>
                        </w:rPr>
                        <w:t>${this.escapeXml(message)}</w:t>
                    </w:r>
                </w:p>
            `;
            
            documentXml = documentXml.replace(
                /<w:body>[\s\S]*?<\/w:body>/,
                `<w:body>${errorXml}</w:body>`
            );
            
            zip.file('word/document.xml', documentXml);
            return zip.generate({ type: 'arraybuffer', compression: 'DEFLATE' });
        } catch (error) {
            console.error('❌ Erreur création message erreur:', error);
            return new ArrayBuffer(0);
        }
    }

    /**
     * Crée un saut de ligne
     */
    static async createLineBreakDocument() {
        try {
            const templateBuffer = await this.loadTemplate('sousrubrique_PEV21-09-251305.docx');
            const zip = new PizZip(templateBuffer);
            let documentXml = zip.file('word/document.xml').asText();
            
            documentXml = documentXml.replace(
                /<w:body>[\s\S]*?<\/w:body>/,
                '<w:body><w:p><w:r><w:br/></w:r></w:p></w:body>'
            );
            
            zip.file('word/document.xml', documentXml);
            return zip.generate({ type: 'arraybuffer', compression: 'DEFLATE' });
        } catch (error) {
            console.error('❌ Erreur création saut de ligne:', error);
            return new ArrayBuffer(0);
        }
    }

    /**
     * Crée un saut de page
     */
    static async createPageBreakDocument() {
        try {
            const templateBuffer = await this.loadTemplate('rubrique_PEV21-09-251305.docx');
            const zip = new PizZip(templateBuffer);
            let documentXml = zip.file('word/document.xml').asText();
            
            documentXml = documentXml.replace(
                /<w:body>[\s\S]*?<\/w:body>/,
                '<w:body><w:p><w:r><w:br w:type="page"/></w:r></w:p></w:body>'
            );
            
            zip.file('word/document.xml', documentXml);
            return zip.generate({ type: 'arraybuffer', compression: 'DEFLATE' });
        } catch (error) {
            console.error('❌ Erreur création saut de page:', error);
            return new ArrayBuffer(0);
        }
    }

    /**
     * Rend un template
     */
    static async renderTemplate(templateBuffer, data) {
        const zip = new PizZip(templateBuffer);
        const doc = new Docxtemplater(zip, { 
            paragraphLoop: true, 
            linebreaks: true 
        });
        doc.setData(data);
        doc.render();
        return doc.getZip().generate({ type: 'arraybuffer', compression: 'DEFLATE' });
    }

    /**
     * Charge un template
     */
    static async loadTemplate(templateName) {
        const possiblePaths = [
            `/upload/${templateName}`,
            `/public/upload/${templateName}`,
            `./upload/${templateName}`,
            `upload/${templateName}`
        ];

        for (const templatePath of possiblePaths) {
            try {
                const response = await fetch(templatePath);
                if (response.ok) return await response.arrayBuffer();
            } catch (error) {
                continue;
            }
        }
        throw new Error(`Template ${templateName} non trouvé`);
    }

    /**
     * Convertit ArrayBuffer en base64
     */
    static arrayBufferToBase64(arrayBuffer) {
        try {
            const uint8Array = new Uint8Array(arrayBuffer);
            let binary = '';
            const len = uint8Array.byteLength;
            
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(uint8Array[i]);
            }
            
            return btoa(binary);
        } catch (error) {
            console.error('❌ Erreur conversion ArrayBuffer:', error);
            throw error;
        }
    }

    /**
     * Headers d'authentification
     */
    static getAuthHeaders() {
        const { username, password } = this.DHIS2_CONFIG.CREDENTIALS;
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
            'Accept': 'application/json,image/png,image/*;q=0.8,*/*;q=0.5'
        };
    }

    /**
     * Formate la valeur
     */
    static formatValue(value) {
        const num = parseFloat(value);
        if (isNaN(num)) return value.toString();
        return Number.isInteger(num) ? num.toString() : num.toFixed(2);
    }

    /**
     * Analyse les résultats
     */
    static analyzeDataResults(sections) {
        let totalIndicators = 0;
        let realDataCount = 0;
        let totalVisualizations = 0;
        let successfulVisualizations = 0;

        if (sections) {
            sections.forEach(section => {
                section.subsections?.forEach(subsection => {
                    subsection.indicatorGroups?.forEach(group => {
                        group.selectedIndicators?.forEach(indicator => {
                            totalIndicators++;
                            if (indicator.data?.isRealData) realDataCount++;
                        });
                    });
                    
                    subsection.visualizationGroups?.forEach(vizGroup => {
                        vizGroup.selectedVisualizations?.forEach(visualization => {
                            totalVisualizations++;
                            if (visualization.hasImage) successfulVisualizations++;
                        });
                    });
                });
            });
        }

        return {
            totalIndicators,
            realDataCount,
            totalVisualizations,
            successfulVisualizations,
            hasRealData: realDataCount > 0 || successfulVisualizations > 0
        };
    }

    /**
     * Prépare les données pour le template
     */
    static prepareRealBulletinData(configData, dataStats) {
        const periodId = this.getPeriodFromConfig(configData);
        let year = new Date().getFullYear().toString();
        let month = '01';
        let displayPeriod = periodId;
        
        if (periodId.match(/^\d{8}$/)) {
            year = periodId.substring(0, 4);
            month = periodId.substring(4, 6);
            const day = periodId.substring(6, 8);
            displayPeriod = `${day}/${month}/${year}`;
        } else if (periodId.match(/^\d{6}$/)) {
            year = periodId.substring(0, 4);
            month = periodId.substring(4, 6);
            displayPeriod = `${month}/${year}`;
        } else {
            displayPeriod = this.getPeriodDisplayName(periodId);
        }

        const structuredSections = this.prepareStructuredSections(configData.sections || []);
        
        return {
            weekly: month,
            year: year,
            epidemiological_week: month,
            main_title: configData.coverTitle || 'Bulletin de Surveillance',
            programme_name: this.getProgramDisplayName(configData.program),
            program: configData.program,
            periodicity: this.getPeriodicityDisplayName(configData.periodicity),
            date_generation: new Date().toLocaleDateString('fr-FR'),
            period_display: displayPeriod,
            sections: structuredSections,
            data_stats: dataStats,
            has_real_data: dataStats.hasRealData,
            has_visualizations: dataStats.totalVisualizations > 0
        };
    }

    /**
     * Prépare la structure des sections
     */
    static prepareStructuredSections(sections) {
        return sections.map((section) => {
            const structuredSection = {
                title: section.title,
                subsections: []
            };

            if (section.subsections && section.subsections.length > 0) {
                structuredSection.subsections = section.subsections.map((subsection) => {
                    const structuredSubsection = {
                        title: subsection.title,
                        elements: [],
                        visualizations: []
                    };

                    // Indicateurs
                    if (subsection.indicatorGroups && subsection.indicatorGroups.length > 0) {
                        subsection.indicatorGroups.forEach(group => {
                            if (group.selectedIndicators && group.selectedIndicators.length > 0) {
                                group.selectedIndicators.forEach(indicator => {
                                    structuredSubsection.elements.push({
                                        name: indicator.name || indicator.shortName,
                                        value: indicator.data?.value || 'N/D',
                                        isRealData: indicator.data?.isRealData || false,
                                        note: indicator.data?.note || '',
                                        type: 'indicator'
                                    });
                                });
                            }
                        });
                    }

                    // Visualisations
                    if (subsection.visualizationGroups && subsection.visualizationGroups.length > 0) {
                        subsection.visualizationGroups.forEach(vizGroup => {
                            if (vizGroup.selectedVisualizations && vizGroup.selectedVisualizations.length > 0) {
                                vizGroup.selectedVisualizations.forEach(visualization => {
                                    structuredSubsection.visualizations.push({
                                        name: visualization.name || 'Graphique',
                                        uid: visualization.id || visualization.uid,
                                        hasData: visualization.hasData || false,
                                        hasImage: visualization.hasImage || false,
                                        imageData: visualization.image?.imageData || null,
                                        arrayBufferData: visualization.arrayBufferData || null,
                                        imageType: visualization.image?.imageType || 'png',
                                        error: visualization.error || null,
                                        type: 'visualization'
                                    });
                                });
                            }
                        });
                    }

                    return structuredSubsection;
                });
            }

            return structuredSection;
        });
    }

    /**
     * Échappe le XML
     */
    static escapeXml(unsafe) {
        return unsafe.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }

    // Méthodes utilitaires
    static getPeriodDisplayName(periodId) {
        const periodMap = {
            'THIS_MONTH': 'Mois en cours',
            'LAST_MONTH': 'Mois précédent',
            'THIS_YEAR': 'Année en cours',
            'LAST_YEAR': 'Année précédente',
            'LAST_12_MONTHS': '12 derniers mois',
            'THIS_WEEK': 'Semaine en cours',
            'LAST_WEEK': 'Semaine précédente'
        };
        return periodMap[periodId] || periodId;
    }

    static getProgramDisplayName(programCode) {
        const programMap = {
            'PEV': 'Programme Élargi de Vaccination',
            'PNLT': 'Programme National de Lutte contre la Tuberculose',
            'PNSR': 'Programme National de Santé Reproductive',
            'PNLP': 'Programme National de Lutte contre le Paludisme'
        };
        return programMap[programCode] || programCode;
    }

    static getPeriodicityDisplayName(periodicityCode) {
        const periodicityMap = {
            'WEEKLY': 'Hebdomadaire',
            'MONTHLY': 'Mensuelle',
            'QUARTERLY': 'Trimestrielle',
            'YEARLY': 'Annuelle'
        };
        return periodicityMap[periodicityCode] || periodicityCode;
    }
}

// Export des fonctions utilitaires
export const BulletinUtils = {
    testGraphiqueImmediat: (uid) => BulletinGeneratorService.testGraphiqueImmediat(uid),
    generateBulletin: (dataStoreKey, fileName) => BulletinGeneratorService.generateCompleteBulletin(dataStoreKey, fileName)
};

export default BulletinGeneratorService;