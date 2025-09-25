import React, { useState, useEffect } from 'react'
import { Button, Card, InputField, SingleSelect, NoticeBox } from '@dhis2/ui'
import { FileText, Download, Calendar, Target } from 'lucide-react'
import './BulletinGenerator.css'
import BulletinGeneratorService from '../../services/bulletinGeneratorService'

const BulletinGenerator = () => {
    const [availableDataStoreKeys, setAvailableDataStoreKeys] = useState([])
    const [selectedDataStoreKey, setSelectedDataStoreKey] = useState(null)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(null)
    const [loadingKeys, setLoadingKeys] = useState(false)

    // Charger les clés DataStore disponibles
    useEffect(() => {
        loadAvailableDataStoreKeys()
    }, [])

    const loadAvailableDataStoreKeys = async () => {
        setLoadingKeys(true)
        
        // Configuration par défaut
        const defaultKeys = [
            { key: 'PEV21-09-251305', name: 'Configuration PEV21-09-251305' },
            { key: 'TEST-CONFIG-001', name: 'Configuration de Test' },
            { key: 'PEV22-01-151200', name: 'Configuration PEV22-01-151200' },
            { key: 'PEV22-02-281400', name: 'Configuration PEV22-02-281400' }
        ]
        
        setAvailableDataStoreKeys(defaultKeys)
        
        // Simuler un délai de chargement
        setTimeout(() => {
            setLoadingKeys(false)
        }, 300)
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

        try {
            // Générer le nom du fichier
            const fileName = `Bulletin_Complet_${selectedDataStoreKey}_${new Date().toISOString().split('T')[0]}.docx`

            // Générer le bulletin complet avec tous les templates
            const result = await BulletinGeneratorService.generateCompleteBulletin(
                selectedDataStoreKey,
                null, // Période sera récupérée depuis le DataStore
                fileName
            )

            if (result.success) {
                setStatus({
                    type: 'success',
                    message: result.message + (result.templatesUsed ? `\nTemplates utilisés: ${result.templatesUsed.join(', ')}` : '')
                })
            } else {
                setStatus({
                    type: 'critical',
                    message: result.message
                })
            }

        } catch (error) {
            console.error('Erreur lors de la génération:', error)
            setStatus({
                type: 'critical',
                message: `Erreur lors de la génération: ${error.message}`
            })
        } finally {
            setLoading(false)
        }
    }

    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
        padding: '20px',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden'
    }

    const inputStyle = {
        width: '100%',
        marginBottom: '12px'
    }

    const buttonStyle = {
        marginTop: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '10px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 3px 10px rgba(102, 126, 234, 0.3)',
        transition: 'all 0.3s ease'
    }

    return (
        <div style={{ 
            padding: '20px', 
            maxWidth: '1000px', 
            margin: '0 auto',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            minHeight: '100vh'
        }}>
            {/* En-tête avec gradient */}
            <div className="animated-gradient" style={{
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    animation: 'float 6s ease-in-out infinite'
                }} />
                <h1 style={{ 
                    fontSize: '28px', 
                    fontWeight: '700', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    position: 'relative',
                    zIndex: 1
                }}>
            <div style={{ 
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        padding: '12px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <FileText size={32} />
                    </div>
                    Générateur de Bulletins Professionnels
                </h1>
                <p style={{
                    fontSize: '16px',
                    opacity: 0.9,
                    margin: '0',
                    position: 'relative',
                    zIndex: 1
                }}>
                    Créez des bulletins complets en mode paysage avec toutes vos données
                </p>
            </div>


            {/* Sélection de la Configuration */}
            <Card className="bulletin-card" style={{
                ...cardStyle,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    height: '4px',
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '16px 16px 0 0'
                }} />
                <h3 style={{ 
                fontSize: '20px', 
                    fontWeight: '600', 
                marginBottom: '16px',
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
            }}>
            <div style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        padding: '6px',
                        color: 'white'
                    }}>
                        <Target size={16} />
                    </div>
                    Configuration du Bulletin
                </h3>
                
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '6px'
                        }}>
                            Sélectionner une configuration ({availableDataStoreKeys.length} disponible{availableDataStoreKeys.length > 1 ? 's' : ''})
                        </label>
                        
                        <select
                            value={selectedDataStoreKey || ''}
                            onChange={(e) => {
                                setSelectedDataStoreKey(e.target.value)
                            }}
                            disabled={loadingKeys}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                fontSize: '13px',
                                backgroundColor: loadingKeys ? '#f9fafb' : 'white',
                                color: loadingKeys ? '#9ca3af' : '#1f2937',
                                cursor: loadingKeys ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <option value="">
                                {loadingKeys ? 'Chargement...' : 'Sélectionner une configuration'}
                            </option>
                            {availableDataStoreKeys.map(key => (
                                <option key={key.key} value={key.key}>
                                    {key.name || `Configuration ${key.key}`}
                                </option>
                            ))}
                        </select>
                        
                        {selectedDataStoreKey && (
                            <button
                                onClick={() => setSelectedDataStoreKey('')}
                                style={{
                                    marginTop: '6px',
                                    padding: '3px 6px',
                                    fontSize: '11px',
                                    color: '#ef4444',
                                    background: 'none',
                                    border: '1px solid #ef4444',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                }}
                            >
                                ❌ Effacer
                            </button>
                        )}
                    </div>
                    
                </div>


            </Card>

            {/* Information sur le processus automatique */}
            <Card className="bulletin-card" style={{
                ...cardStyle,
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                border: '1px solid #e2e8f0'
            }}>
                <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    marginBottom: '16px',
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: '50%',
                        padding: '6px',
                        color: 'white'
                    }}>
                        <FileText size={16} />
                    </div>
                    Processus Automatique
                </h3>
                
                <div style={{ 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
                    padding: '16px', 
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}>
                    <div className="process-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                        <div className="process-step" style={{ 
                            textAlign: 'center',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                            borderRadius: '12px',
                            border: '1px solid #3b82f6',
                            boxShadow: '0 3px 10px rgba(59, 130, 246, 0.1)',
                            transition: 'transform 0.3s ease'
                        }}>
                            <div style={{ 
                                width: '45px', 
                                height: '45px', 
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                margin: '0 auto 12px auto',
                                fontSize: '18px',
                                boxShadow: '0 3px 10px rgba(59, 130, 246, 0.3)'
                            }}>
                                1️⃣
                            </div>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 6px 0', color: '#1e40af' }}>
                                Récupération des Données
                            </h4>
                            <p style={{ fontSize: '12px', color: '#1e40af', margin: '0', lineHeight: '1.4' }}>
                                Période, indicateurs, établissement depuis le DataStore
                            </p>
                        </div>
                        
                        <div className="process-step" style={{ 
                            textAlign: 'center',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                            borderRadius: '12px',
                            border: '1px solid #10b981',
                            boxShadow: '0 3px 10px rgba(16, 185, 129, 0.1)',
                            transition: 'transform 0.3s ease'
                        }}>
                <div style={{ 
                                width: '45px', 
                                height: '45px', 
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                margin: '0 auto 12px auto',
                                fontSize: '18px',
                                boxShadow: '0 3px 10px rgba(16, 185, 129, 0.3)'
                            }}>
                                2️⃣
                            </div>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 6px 0', color: '#065f46' }}>
                                Détection des Templates
                            </h4>
                            <p style={{ fontSize: '12px', color: '#065f46', margin: '0', lineHeight: '1.4' }}>
                                Header, rubriques, sous-rubriques automatiquement trouvés
                            </p>
                        </div>
                        
                        <div className="process-step" style={{ 
                            textAlign: 'center',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                            borderRadius: '12px',
                            border: '1px solid #f59e0b',
                            boxShadow: '0 3px 10px rgba(245, 158, 11, 0.1)',
                            transition: 'transform 0.3s ease'
                        }}>
                            <div style={{ 
                                width: '45px', 
                                height: '45px', 
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                margin: '0 auto 12px auto',
                                fontSize: '18px',
                                boxShadow: '0 3px 10px rgba(245, 158, 11, 0.3)'
                            }}>
                                3️⃣
                            </div>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 6px 0', color: '#92400e' }}>
                                Génération du Bulletin
                            </h4>
                            <p style={{ fontSize: '12px', color: '#92400e', margin: '0', lineHeight: '1.4' }}>
                                Combinaison multi-pages en mode paysage avec données injectées
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Bouton de Génération */}
            <Card className="bulletin-card" style={{
                ...cardStyle,
                background: 'linear-gradient(135deg, #ffffff 0%, #fef7ff 100%)',
                border: '2px solid #e2e8f0',
                textAlign: 'center'
            }}>

                <Button
                    primary
                    large
                    onClick={handleGenerateBulletin}
                    disabled={loading || !selectedDataStoreKey}
                    loading={loading}
                    icon={<Download size={20} />}
                    className="generate-button"
                    style={{
                        ...buttonStyle,
                        background: selectedDataStoreKey ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#94a3b8',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '20px 40px',
                        fontSize: '18px',
                        fontWeight: '700',
                        boxShadow: selectedDataStoreKey ? '0 8px 25px rgba(102, 126, 234, 0.4)' : 'none',
                        transition: 'all 0.3s ease',
                        transform: selectedDataStoreKey ? 'scale(1.02)' : 'scale(1)',
                        cursor: selectedDataStoreKey ? 'pointer' : 'not-allowed'
                    }}
                >
                    {loading ? '🔄 Génération en cours...' : '🚀 Générer le Bulletin Complet'}
                </Button>

                {!selectedDataStoreKey && (
                    <p style={{ 
                        fontSize: '14px', 
                        color: '#64748b',
                        margin: '16px 0 0 0',
                        fontStyle: 'italic'
                    }}>
                        Veuillez d'abord sélectionner une configuration
                    </p>
                )}

                {status && (
                    <div style={{
                        marginTop: '24px',
                        padding: '16px',
                        borderRadius: '12px',
                        background: status.type === 'success' 
                            ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
                            : status.type === 'critical'
                            ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
                            : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        border: `2px solid ${status.type === 'success' ? '#10b981' : status.type === 'critical' ? '#ef4444' : '#f59e0b'}`,
                        color: status.type === 'success' ? '#065f46' : status.type === 'critical' ? '#991b1b' : '#92400e'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{
                                background: status.type === 'success' ? '#10b981' : status.type === 'critical' ? '#ef4444' : '#f59e0b',
                                borderRadius: '50%',
                                padding: '4px',
                                color: 'white'
                            }}>
                                {status.type === 'success' ? '✅' : status.type === 'critical' ? '❌' : '⚠️'}
                            </div>
                            <strong>{status.type === 'success' ? 'Succès' : status.type === 'critical' ? 'Erreur' : 'Attention'}</strong>
                        </div>
                        <div style={{ marginLeft: '32px', whiteSpace: 'pre-line' }}>
                            {status.message}
                </div>
            </div>
                )}
            </Card>
        </div>
    )
}

export default BulletinGenerator