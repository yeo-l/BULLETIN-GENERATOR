import React, { useState, useEffect } from 'react'
import { Button, Card, InputField, SingleSelect, NoticeBox } from '@dhis2/ui'
import { FileText, Download, Calendar, Target, Zap, Settings, Play, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react'
import './BulletinGenerator.css'
import BulletinGeneratorService from '../../services/bulletinGeneratorService'

const BulletinGenerator = () => {
    const [availableDataStoreKeys, setAvailableDataStoreKeys] = useState([])
    const [selectedDataStoreKey, setSelectedDataStoreKey] = useState(null)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(null)
    const [loadingKeys, setLoadingKeys] = useState(false)
    const [progress, setProgress] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    // Charger les clés DataStore disponibles
    useEffect(() => {
        loadAvailableDataStoreKeys()
    }, [])

    const loadAvailableDataStoreKeys = async () => {
        setLoadingKeys(true)
        
        try {
            // Récupérer toutes les clés du namespace GENERATE-BULLETIN
            const response = await fetch('/api/dataStore/GENERATE-BULLETIN')
            
            if (response.ok) {
                const keys = await response.json()
                console.log('🔑 Clés récupérées depuis le DataStore:', keys)
                
                if (keys && keys.length > 0) {
                    // Pour chaque clé, récupérer les données pour avoir le nom
                    const configurations = await Promise.all(
                        keys.map(async (key) => {
                            try {
                                const configResponse = await fetch(`/api/dataStore/GENERATE-BULLETIN/${key}`)
                                if (configResponse.ok) {
                                    const configData = await configResponse.json()
                                    return {
                                        key: key,
                                        name: configData.name || `Configuration ${key}`,
                                        description: configData.description || '',
                                        programme_name: configData.programme_name || '',
                                        coverTitle: configData.coverTitle || ''
                                    }
                                }
                            } catch (error) {
                                console.warn(`Erreur lors du chargement de la configuration ${key}:`, error)
                            }
                            return {
                                key: key,
                                name: `Configuration ${key}`,
                                description: '',
                                programme_name: ''
                            }
                        })
                    )
                    
                    setAvailableDataStoreKeys(configurations.filter(config => config !== null))
                } else {
                    // Aucune configuration trouvée
                    console.warn('Aucune configuration trouvée dans le DataStore')
                    setAvailableDataStoreKeys([])
                }
            } else {
                console.warn('Impossible de récupérer les clés du DataStore')
                setAvailableDataStoreKeys([])
            }
        } catch (error) {
            console.error('Erreur lors du chargement des configurations:', error)
            setAvailableDataStoreKeys([])
        } finally {
            setLoadingKeys(false)
        }
    }

    const handleGenerateBulletin = async () => {
        if (!selectedDataStoreKey) {
            setStatus({
                type: 'warning',
                message: 'Veuillez sélectionner une configuration'
            })
            return
        }

        setLoading(true)
        setStatus(null)
        setProgress(0)

        try {
            // Simulation de progression
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 10
                })
            }, 300)

            // Générer le nom du fichier
            const selectedConfig = availableDataStoreKeys.find(config => config.key === selectedDataStoreKey)
            const configName = selectedConfig?.coverTitle || selectedConfig?.programme_name || selectedConfig?.name || selectedDataStoreKey
            const fileName = `Bulletin_${configName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`

            // ⭐⭐⭐ APPEL DIRECT AU SERVICE DE GÉNÉRATION ⭐⭐⭐
            console.log('🚀 Début de la génération du bulletin...')
            const result = await BulletinGeneratorService.generateCompleteBulletin(
                selectedDataStoreKey,  // La clé du DataStore
                fileName              // Le nom du fichier de sortie
            )

            clearInterval(progressInterval)
            setProgress(100)

            if (result.success) {
                setStatus({
                    type: 'success',
                    message: result.message || `Bulletin "${fileName}" généré avec succès !`
                })
                
                console.log('✅ Bulletin généré:', result)
            } else {
                setStatus({
                    type: 'critical',
                    message: result.message || 'Erreur lors de la génération'
                })
                console.error('❌ Erreur de génération:', result)
            }

        } catch (error) {
            console.error('❌ Erreur lors de la génération:', error)
            setStatus({
                type: 'critical',
                message: `Erreur lors de la génération: ${error.message}`
            })
            setProgress(0)
        } finally {
            setTimeout(() => setLoading(false), 1000)
        }
    }

    const handleTestGeneration = async () => {
        setLoading(true)
        setStatus(null)
        
        try {
            console.log('🧪 Lancement du test de génération...')
            const result = await BulletinGeneratorService.testBulletinGeneration()
            
            if (result.success) {
                setStatus({
                    type: 'success',
                    message: result.message || 'Test de génération réussi ! Vérifiez le fichier téléchargé.'
                })
            } else {
                setStatus({
                    type: 'critical', 
                    message: result.message || 'Erreur lors du test de génération'
                })
            }
        } catch (error) {
            console.error('❌ Erreur lors du test:', error)
            setStatus({
                type: 'critical',
                message: `Erreur lors du test: ${error.message}`
            })
        } finally {
            setLoading(false)
        }
    }

    const handleRefreshConfigurations = async () => {
        setLoadingKeys(true)
        await loadAvailableDataStoreKeys()
        setStatus({
            type: 'success',
            message: 'Liste des configurations actualisée'
        })
    }

    return (
        <div className="bulletin-generator">
            {/* En-tête avec effet néon */}
            <div className="hero-section">
                <div className="hero-background">
                    <div className="floating-shapes">
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                        <div className="shape shape-3"></div>
                    </div>
                </div>
                <div className="hero-content">
                    <div className="hero-icon">
                        <FileText size={40} />
                    </div>
                    <h1 className="hero-title">
                        Générateur de Bulletins
                    </h1>
                    <p className="hero-subtitle">
                        Créez des bulletins professionnels avec indicateurs et graphiques DHIS2
                    </p>
                </div>
            </div>

            {/* Configuration Card */}
            <div className="config-card glass-card">
                <div className="card-header">
                    <div className="card-icon">
                        <Settings size={20} />
                    </div>
                    <h3 className="card-title">Configuration du Bulletin</h3>
                    <button 
                        onClick={handleRefreshConfigurations}
                        disabled={loadingKeys}
                        className="refresh-btn"
                        title="Actualiser la liste des configurations"
                    >
                        <RefreshCw size={16} className={loadingKeys ? 'spinning' : ''} />
                    </button>
                </div>
                
                <div className="config-content">
                    <div className="input-group">
                        <label className="input-label">
                            Sélectionner une configuration
                            <span className="badge">
                                {loadingKeys ? '🔄' : `${availableDataStoreKeys.length} disponible${availableDataStoreKeys.length > 1 ? 's' : ''}`}
                            </span>
                        </label>
                        
                        <div className="select-wrapper">
                            <select
                                value={selectedDataStoreKey || ''}
                                onChange={(e) => setSelectedDataStoreKey(e.target.value)}
                                disabled={loadingKeys}
                                className="config-select"
                            >
                                <option value="">
                                    {loadingKeys ? '🔄 Chargement des configurations...' : '📁 Sélectionner une configuration'}
                                </option>
                                {availableDataStoreKeys.map(config => (
                                    <option key={config.key} value={config.key}>
                                        {config.coverTitle || config.name}
                                        {config.programme_name && ` - ${config.programme_name}`}
                                    </option>
                                ))}
                            </select>
                            <div className="select-arrow">▼</div>
                        </div>
                        
                        {selectedDataStoreKey && (
                            <button
                                onClick={() => setSelectedDataStoreKey('')}
                                className="clear-btn"
                            >
                                ❌ Effacer la sélection
                            </button>
                        )}
                    </div>

                    {selectedDataStoreKey && (
                        <div className="selected-config-info">
                            <div className="config-details">
                                <strong>Configuration sélectionnée:</strong>
                                <div className="config-title">
                                    {availableDataStoreKeys.find(config => config.key === selectedDataStoreKey)?.coverTitle || 
                                     availableDataStoreKeys.find(config => config.key === selectedDataStoreKey)?.name}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Process Steps */}
            <div className="process-card glass-card">
                <div className="card-header">
                    <div className="card-icon">
                        <Play size={20} />
                    </div>
                    <h3 className="card-title">Processus Automatique</h3>
                </div>

                <div className="process-steps">
                    <div className="process-step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h4 className="step-title">Récupération des Données</h4>
                            <p className="step-description">Titre, semaine épidémiologique, rubriques, indicateurs et graphiques depuis le DataStore</p>
                        </div>
                        <div className="step-icon">📊</div>
                    </div>

                    <div className="process-step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h4 className="step-title">Structure du Bulletin</h4>
                            <p className="step-description">Organisation des sections, sous-sections, indicateurs et visualisations</p>
                        </div>
                        <div className="step-icon">📋</div>
                    </div>

                    <div className="process-step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h4 className="step-title">Génération du Document</h4>
                            <p className="step-description">Création du bulletin avec mise en forme et intégration des graphiques</p>
                        </div>
                        <div className="step-icon">🚀</div>
                    </div>
                </div>
            </div>

            {/* Generation Section */}
            <div className="action-card glass-card">
                <div className="progress-section">
                    {loading && (
                        <div className="progress-container">
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <span className="progress-text">{progress}%</span>
                        </div>
                    )}
                    
                    <div className="action-buttons">
                        <button
                            onClick={handleGenerateBulletin}
                            disabled={loading || !selectedDataStoreKey}
                            className={`generate-btn ${loading ? 'loading' : ''} ${isHovered ? 'hovered' : ''}`}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <div className="btn-content">
                                {loading ? (
                                    <>
                                        <div className="spinner"></div>
                                        <span>Génération en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download size={20} />
                                        <span>🚀 Générer le Bulletin Complet</span>
                                    </>
                                )}
                            </div>
                            <div className="btn-glow"></div>
                        </button>

                        <button
                            onClick={handleTestGeneration}
                            disabled={loading}
                            className="test-btn"
                        >
                            <div className="btn-content">
                                <span>🧪 Tester la Génération</span>
                            </div>
                        </button>
                    </div>

                    {!selectedDataStoreKey && (
                        <p className="helper-text">
                            ⚠️ Veuillez d'abord sélectionner une configuration
                        </p>
                    )}
                </div>

                {/* Status Message */}
                {status && (
                    <div className={`status-message ${status.type}`}>
                        <div className="status-header">
                            <div className="status-icon">
                                {status.type === 'success' && <CheckCircle size={20} />}
                                {status.type === 'critical' && <AlertCircle size={20} />}
                                {status.type === 'warning' && <Clock size={20} />}
                            </div>
                            <div className="status-title">
                                {status.type === 'success' && 'Succès !'}
                                {status.type === 'critical' && 'Erreur'}
                                {status.type === 'warning' && 'Attention'}
                            </div>
                        </div>
                        <div className="status-content">
                            {status.message}
                        </div>
                    </div>
                )}
            </div>

            {/* Informations supplémentaires */}
            <div className="info-card glass-card">
                <div className="card-header">
                    <div className="card-icon">
                        <FileText size={20} />
                    </div>
                    <h3 className="card-title">À propos de la génération</h3>
                </div>
                <div className="info-content">
                    <p>Le bulletin généré contiendra :</p>
                    <ul>
                        <li>✅ <strong>Le titre principal</strong> en grande taille</li>
                        <li>✅ <strong>La semaine épidémiologique</strong> configurée</li>
                        <li>✅ <strong>Toutes les rubriques et sous-rubriques</strong></li>
                        <li>✅ <strong>Les indicateurs avec leurs pourcentages</strong></li>
                        <li>✅ <strong>Les graphiques et visualisations DHIS2</strong></li>
                        <li>✅ <strong>Format paysage automatique</strong></li>
                    </ul>
                    <p className="info-note">
                        <em>Les données sont récupérées directement depuis votre configuration sauvegardée dans le DataStore DHIS2.</em>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default BulletinGenerator