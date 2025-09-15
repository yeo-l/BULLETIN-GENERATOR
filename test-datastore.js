// Script de test pour vérifier le datastore DHIS2
// Ce script peut être exécuté dans la console du navigateur

console.log('🧪 Test du DataStore DHIS2 - Bulletin Generator');
console.log('================================================');

// Fonction pour tester la connexion au datastore
async function testDataStore() {
    const results = [];
    
    try {
        // Test 1: Vérifier la connexion
        console.log('📡 Test 1: Connexion au datastore...');
        const response = await fetch('/api/dataStore/GENERATE-BULLETIN');
        
        if (response.ok) {
            const keys = await response.json();
            console.log('✅ Connexion réussie');
            console.log(`📊 ${keys.length} configurations trouvées:`, keys);
            results.push({ test: 'Connexion', status: 'success', data: keys });
        } else if (response.status === 404) {
            console.log('⚠️ Aucune configuration trouvée (normal si première utilisation)');
            results.push({ test: 'Connexion', status: 'warning', message: 'Aucune configuration trouvée' });
        } else {
            console.log('❌ Erreur HTTP:', response.status, response.statusText);
            results.push({ test: 'Connexion', status: 'error', message: `HTTP ${response.status}` });
        }
    } catch (error) {
        console.log('❌ Erreur de connexion:', error.message);
        results.push({ test: 'Connexion', status: 'error', message: error.message });
    }

    // Test 2: Créer une configuration de test
    try {
        console.log('📝 Test 2: Création d\'une configuration de test...');
        
        const testConfig = {
            program: 'TEST',
            coverTitle: 'Test de configuration datastore',
            periodicity: 'WEEKLY',
            periodValue: { year: 2024, week: 15 },
            sections: [
                {
                    id: 'test-section-1',
                    title: 'Section de test',
                    subsections: [
                        {
                            id: 'test-subsection-1',
                            title: 'Sous-section de test',
                            presentation: 'table',
                            indicatorGroups: [
                                {
                                    id: 'test-group-1',
                                    name: 'Groupe de test',
                                    selectedIndicators: [
                                        { id: 'ind-1', name: 'Indicateur de test 1' },
                                        { id: 'ind-2', name: 'Indicateur de test 2' }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            selectedOrgUnits: [
                { id: 'org-1', name: 'Organisation de test' }
            ],
            autoGenerate: true,
            lastModified: new Date().toISOString(),
            version: '1.0',
            createdDate: new Date().toISOString()
        };

        const now = new Date();
        const dateStr = now.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: '2-digit' 
        }).replace(/\//g, '-');
        const timeStr = now.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }).replace(/:/g, '');
        
        const testKey = `TEST${dateStr}${timeStr}`;
        
        const createResponse = await fetch(`/api/dataStore/GENERATE-BULLETIN/${testKey}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testConfig)
        });

        if (createResponse.ok) {
            console.log('✅ Configuration de test créée avec succès');
            console.log('🔑 Clé:', testKey);
            console.log('📋 Données:', testConfig);
            results.push({ test: 'Création', status: 'success', key: testKey, data: testConfig });
        } else {
            const errorData = await createResponse.json();
            console.log('❌ Erreur lors de la création:', errorData);
            results.push({ test: 'Création', status: 'error', message: errorData.message });
        }
    } catch (error) {
        console.log('❌ Erreur lors de la création:', error.message);
        results.push({ test: 'Création', status: 'error', message: error.message });
    }

    // Test 3: Récupérer la configuration créée
    try {
        console.log('📥 Test 3: Récupération de la configuration de test...');
        
        const retrieveResponse = await fetch(`/api/dataStore/GENERATE-BULLETIN/${testKey}`);
        if (retrieveResponse.ok) {
            const retrievedConfig = await retrieveResponse.json();
            console.log('✅ Configuration récupérée avec succès');
            console.log('📋 Données récupérées:', retrievedConfig);
            
            // Vérifier l'intégrité des données
            const dataIntegrity = {
                program: retrievedConfig.program === 'TEST',
                coverTitle: retrievedConfig.coverTitle === 'Test de configuration datastore',
                sections: retrievedConfig.sections?.length === 1,
                subsections: retrievedConfig.sections?.[0]?.subsections?.length === 1,
                indicatorGroups: retrievedConfig.sections?.[0]?.subsections?.[0]?.indicatorGroups?.length === 1,
                selectedIndicators: retrievedConfig.sections?.[0]?.subsections?.[0]?.indicatorGroups?.[0]?.selectedIndicators?.length === 2,
                orgUnits: retrievedConfig.selectedOrgUnits?.length === 1
            };
            
            const integrityScore = Object.values(dataIntegrity).filter(Boolean).length;
            const totalChecks = Object.keys(dataIntegrity).length;
            
            console.log('🔍 Test d\'intégrité des données:');
            console.log(`📊 Score: ${integrityScore}/${totalChecks} tests réussis`);
            console.log('📋 Détails:', dataIntegrity);
            
            results.push({ 
                test: 'Récupération', 
                status: 'success', 
                data: retrievedConfig,
                integrity: { score: integrityScore, total: totalChecks, details: dataIntegrity }
            });
        } else {
            console.log('❌ Erreur lors de la récupération:', retrieveResponse.statusText);
            results.push({ test: 'Récupération', status: 'error', message: retrieveResponse.statusText });
        }
    } catch (error) {
        console.log('❌ Erreur lors de la récupération:', error.message);
        results.push({ test: 'Récupération', status: 'error', message: error.message });
    }

    // Test 4: Lister toutes les configurations
    try {
        console.log('📋 Test 4: Récupération de la liste complète...');
        
        const listResponse = await fetch('/api/dataStore/GENERATE-BULLETIN');
        if (listResponse.ok) {
            const allKeys = await listResponse.json();
            console.log('✅ Liste récupérée avec succès');
            console.log(`📊 ${allKeys.length} configurations trouvées:`, allKeys);
            results.push({ test: 'Liste', status: 'success', data: allKeys });
        } else {
            console.log('❌ Erreur lors de la récupération de la liste:', listResponse.statusText);
            results.push({ test: 'Liste', status: 'error', message: listResponse.statusText });
        }
    } catch (error) {
        console.log('❌ Erreur lors de la récupération de la liste:', error.message);
        results.push({ test: 'Liste', status: 'error', message: error.message });
    }

    // Résumé des résultats
    console.log('📊 Résumé des tests:');
    console.log('===================');
    results.forEach(result => {
        const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
        console.log(`${icon} ${result.test}: ${result.status}`);
        if (result.message) console.log(`   Message: ${result.message}`);
        if (result.integrity) console.log(`   Intégrité: ${result.integrity.score}/${result.integrity.total}`);
    });

    return results;
}

// Exécuter les tests
testDataStore().then(results => {
    console.log('🎯 Tests terminés!');
    console.log('📋 Résultats complets:', results);
    
    // Vérifier si tous les tests sont passés
    const allPassed = results.every(r => r.status === 'success' || r.status === 'warning');
    if (allPassed) {
        console.log('🎉 Tous les tests sont passés avec succès!');
        console.log('✅ Le datastore DHIS2 fonctionne correctement');
    } else {
        console.log('⚠️ Certains tests ont échoué');
        console.log('🔧 Vérifiez la configuration de votre instance DHIS2');
    }
}).catch(error => {
    console.error('💥 Erreur lors de l\'exécution des tests:', error);
});

// Exporter la fonction pour utilisation manuelle
window.testDataStore = testDataStore;

