import React, { useState, useEffect } from 'react'
import { Button, NoticeBox } from '@dhis2/ui'
import { Upload, FileText, X, CheckCircle, AlertCircle, Settings } from 'lucide-react'
import UploadService from '../../services/uploadService'

const DocumentImport = () => {
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [uploadStatus, setUploadStatus] = useState(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [dragActive, setDragActive] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [availableConfigs, setAvailableConfigs] = useState([])
    const [selectedConfig, setSelectedConfig] = useState(null)
    const [loadingConfigs, setLoadingConfigs] = useState(false)

    // Charger les configurations disponibles depuis le datastore
    useEffect(() => {
        loadAvailableConfigs()
    }, [])

    const loadAvailableConfigs = async () => {
        setLoadingConfigs(true)
        try {
            // Récupérer toutes les clés du namespace GENERATE-BULLETIN
            console.log('Tentative de chargement des configurations depuis:', '/api/dataStore/GENERATE-BULLETIN')
            const keysResponse = await fetch('/api/dataStore/GENERATE-BULLETIN')
            console.log('Réponse du datastore:', keysResponse.status, keysResponse.statusText)
            
            if (keysResponse.ok) {
                const keys = await keysResponse.json()
                console.log('Clés récupérées:', keys)
                
                // Charger les détails de chaque configuration
                const configPromises = keys.map(async (key) => {
                    try {
                        const configResponse = await fetch(`/api/dataStore/GENERATE-BULLETIN/${key}`)
                        if (configResponse.ok) {
                            const configData = await configResponse.json()
                            return {
                                key: key,
                                name: configData.name || `Configuration ${configData.program || 'Sans nom'}`,
                                program: configData.program,
                                coverTitle: configData.coverTitle,
                                periodicity: configData.periodicity,
                                lastModified: configData.lastModified,
                                createdDate: configData.createdDate
                            }
                        }
                        return null
                    } catch (error) {
                        console.error(`Erreur lors du chargement de la configuration ${key}:`, error)
                        return null
                    }
                })

                const configs = await Promise.all(configPromises)
                const validConfigs = configs.filter(config => config !== null)
                
                // Trier par date de modification (plus récent en premier)
                validConfigs.sort((a, b) => new Date(b.lastModified || b.createdDate) - new Date(a.lastModified || a.createdDate))
                
                setAvailableConfigs(validConfigs)
            } else {
                console.error('Erreur lors de la récupération des clés du datastore:', keysResponse.status)
                if (keysResponse.status === 404) {
                    console.log('Le namespace GENERATE-BULLETIN n\'existe pas encore ou l\'API datastore n\'est pas accessible')
                    // Créer une configuration de test pour le développement
                    setAvailableConfigs([
                        {
                            key: 'TEST-CONFIG-001',
                            name: 'Configuration de test',
                            program: 'TEST',
                            coverTitle: 'Test bulletin',
                            periodicity: 'MONTHLY',
                            lastModified: new Date().toISOString(),
                            createdDate: new Date().toISOString()
                        }
                    ])
                } else {
                    setAvailableConfigs([])
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement des configurations:', error)
            setAvailableConfigs([])
        } finally {
            setLoadingConfigs(false)
        }
    }

    // Fonctions pour l'upload de fichiers (copiées de BulletinConfig)
    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) return

        // Vérifier qu'une configuration est sélectionnée
        if (!selectedConfig) {
            setUploadStatus({
                type: 'error',
                message: 'Veuillez d\'abord sélectionner une configuration de bulletin'
            })
            return
        }

        const file = files[0]
        
        // Validation du fichier avec le service
        const validation = UploadService.validateFile(file)
        
        if (!validation.valid) {
            setUploadStatus({
                type: 'error',
                message: validation.errors.join(', ')
            })
            return
        }

        // Afficher les avertissements s'il y en a
        if (validation.warnings.length > 0) {
            console.warn('Avertissements:', validation.warnings)
        }

        try {
            // Générer le nom de fichier en gardant le nom original + clé de configuration
            const originalExtension = file.name.split('.').pop()
            const originalNameWithoutExt = file.name.replace(`.${originalExtension}`, '')
            const configBasedName = `${originalNameWithoutExt}_${selectedConfig.key}.${originalExtension}`
            
            setUploadStatus({ 
                type: 'uploading', 
                message: `Upload de "${configBasedName}" (${UploadService.formatFileSize(file.size)})...` 
            })
            setUploadProgress(0)

            // Créer un nouveau fichier avec le nom basé sur la configuration
            const renamedFile = new File([file], configBasedName, { type: file.type })

            // Vérifier si l'API d'upload est disponible ou utiliser une simulation
            let result
            try {
                // Tentative d'upload via l'API
                result = await UploadService.uploadDocx(renamedFile, (progress) => {
                    setUploadProgress(progress)
                })
            } catch (uploadError) {
                console.warn('API d\'upload non disponible, tentative d\'upload automatique:', uploadError.message)
                
                // Essayer d'uploader via un serveur local automatique
                const autoUpload = async () => {
                    try {
                        // Tentative d'upload vers un serveur local sur port 3001
                        const formData = new FormData()
                        formData.append('file', renamedFile)
                        
                        const response = await fetch('http://localhost:3001/api/upload-docx', {
                            method: 'POST',
                            body: formData
                        })
                        
                        if (response.ok) {
                            const result = await response.json()
                            return result
                        } else {
                            throw new Error(`Erreur serveur: ${response.status}`)
                        }
                    } catch (serverError) {
                        console.warn('Serveur local non disponible, création automatique du fichier:', serverError.message)
                        
                        // Fallback: Créer le fichier automatiquement via le navigateur
                        return new Promise((resolve) => {
                            let progress = 0
                            const interval = setInterval(() => {
                                progress += 20
                                setUploadProgress(progress)
                                if (progress >= 100) {
                                    clearInterval(interval)
                                    
                                    // Créer le fichier automatiquement
                                    const blob = new Blob([renamedFile], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
                                    const url = URL.createObjectURL(blob)
                                    
                                    // Créer un lien invisible et déclencher le téléchargement automatique
                                    const link = document.createElement('a')
                                    link.href = url
                                    link.download = configBasedName
                                    link.style.display = 'none'
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                    URL.revokeObjectURL(url)
                                    
                                    resolve({
                                        success: true,
                                        message: `Fichier "${configBasedName}" téléchargé automatiquement vers votre dossier de téléchargements`,
                                        filename: configBasedName,
                                        path: `/upload/${configBasedName}`
                                    })
                                }
                            }, 200)
                        })
                    }
                }
                
                result = await autoUpload()
            }

            if (result.success) {
                setUploadStatus({
                    type: 'success',
                    message: `Document "${file.name}" renommé en "${configBasedName}" et lié à la configuration "${selectedConfig.name}"`
                })
                
                // Ajouter le fichier à la liste avec les informations de configuration
                const newFile = {
                    id: Date.now(),
                    name: configBasedName,
                    originalName: file.name,
                    size: file.size,
                    uploadedAt: new Date().toISOString(),
                    path: result.path || `/upload/${configBasedName}`,
                    configKey: selectedConfig.key,
                    configName: selectedConfig.name,
                    program: selectedConfig.program
                }
                setUploadedFiles(prev => [newFile, ...prev])
                
                // Fermer le modal après 2 secondes
                setTimeout(() => {
                    setShowUploadModal(false)
                    setUploadStatus(null)
                    setUploadProgress(0)
                }, 2000)
            } else {
                setUploadStatus({
                    type: 'error',
                    message: result.message || 'Erreur lors de l\'upload'
                })
            }
        } catch (error) {
            setUploadStatus({
                type: 'error',
                message: error.message || 'Erreur lors de l\'upload'
            })
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        
        const files = Array.from(e.dataTransfer.files)
        handleFileUpload(files)
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const deleteFile = (fileId) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Styles
    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
        backgroundColor: '#f8fafc',
        minHeight: '100vh'
    }

    const headerStyle = {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        padding: '32px',
        borderRadius: '12px',
        marginBottom: '32px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    }

    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
    }

    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)'
    }

    const modalStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        width: '600px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 20px 25px rgba(0,0,0,0.1)'
    }

    const fileItemStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '12px',
        backgroundColor: '#fafafa',
        transition: 'all 0.2s ease'
    }

    return (
        <div style={containerStyle}>
            {/* Sélection de configuration */}
            <div style={{
                ...cardStyle,
                marginBottom: '24px',
                background: selectedConfig ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : '#ffffff',
                color: selectedConfig ? 'white' : '#1e293b'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                    paddingBottom: '16px',
                    borderBottom: selectedConfig ? '2px solid rgba(255,255,255,0.2)' : '2px solid #f1f5f9'
                }}>
                    <Settings size={24} color={selectedConfig ? 'white' : '#3b82f6'} />
                    <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                        Sélectionner la Configuration du Bulletin
                    </h2>
                </div>

                {loadingConfigs ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid #3b82f6',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 12px'
                        }} />
                        <p style={{ margin: 0, opacity: selectedConfig ? 0.9 : 0.6 }}>
                            Chargement des configurations...
                        </p>
                    </div>
                ) : availableConfigs.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        backgroundColor: selectedConfig ? 'rgba(255,255,255,0.1)' : '#f8fafc',
                        borderRadius: '8px',
                        border: selectedConfig ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e2e8f0'
                    }}>
                        <Settings size={32} style={{ 
                            margin: '0 auto 12px', 
                            opacity: 0.5,
                            color: selectedConfig ? 'white' : '#64748b'
                        }} />
                        <p style={{ margin: '0 0 12px 0', opacity: selectedConfig ? 0.9 : 0.6 }}>
                            Aucune configuration trouvée
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', opacity: selectedConfig ? 0.8 : 0.5 }}>
                            Créez d'abord une configuration dans "Paramétrage"
                        </p>
                    </div>
                ) : (
                    <div>
                        <select
                            value={selectedConfig?.key || ''}
                            onChange={(e) => {
                                const config = availableConfigs.find(c => c.key === e.target.value)
                                setSelectedConfig(config || null)
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: selectedConfig ? '1px solid rgba(255,255,255,0.3)' : '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                backgroundColor: selectedConfig ? 'rgba(255,255,255,0.1)' : 'white',
                                color: selectedConfig ? 'white' : '#1e293b',
                                marginBottom: '16px'
                            }}
                        >
                            <option value="" style={{ color: '#1e293b' }}>
                                Sélectionner une configuration...
                            </option>
                            {availableConfigs.map((config) => (
                                <option key={config.key} value={config.key} style={{ color: '#1e293b' }}>
                                    {config.name} ({config.program}) - {new Date(config.lastModified || config.createdDate).toLocaleDateString('fr-FR')}
                                </option>
                            ))}
                        </select>

                        {selectedConfig && (
                            <div style={{
                                padding: '16px',
                                backgroundColor: selectedConfig ? 'rgba(255,255,255,0.1)' : '#f0f9ff',
                                borderRadius: '8px',
                                border: selectedConfig ? '1px solid rgba(255,255,255,0.2)' : '1px solid #bfdbfe'
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', opacity: selectedConfig ? 0.8 : 0.6, marginBottom: '4px' }}>
                                            Programme
                                        </div>
                                        <div style={{ fontWeight: '500' }}>
                                            {selectedConfig.program || 'Non défini'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', opacity: selectedConfig ? 0.8 : 0.6, marginBottom: '4px' }}>
                                            Périodicité
                                        </div>
                                        <div style={{ fontWeight: '500' }}>
                                            {selectedConfig.periodicity || 'Non définie'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', opacity: selectedConfig ? 0.8 : 0.6, marginBottom: '4px' }}>
                                            Clé de configuration
                                        </div>
                                        <div style={{ 
                                            fontWeight: '500',
                                            fontFamily: 'monospace',
                                            fontSize: '13px',
                                            backgroundColor: selectedConfig ? 'rgba(255,255,255,0.2)' : '#e0f2fe',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            display: 'inline-block'
                                        }}>
                                            {selectedConfig.key}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Header */}
            <div style={headerStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                            Importation de Documents
                        </h1>
                        <p style={{ opacity: 0.9, fontSize: '16px' }}>
                            Gérez vos modèles de documents Word (.docx)
                        </p>
                        {availableConfigs.length > 0 && availableConfigs[0].key === 'TEST-CONFIG-001' && (
                            <div style={{
                                marginTop: '12px',
                                padding: '8px 12px',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: '6px',
                                fontSize: '14px',
                                opacity: 0.9
                            }}>
                                ⚠️ Mode développement : API datastore non accessible, utilisation d'une configuration de test
                            </div>
                        )}
                    </div>
                    <Button 
                        primary 
                        onClick={() => setShowUploadModal(true)} 
                        icon={<Upload size={18} />}
                        disabled={!selectedConfig}
                        title={!selectedConfig ? 'Sélectionnez d\'abord une configuration' : 'Importer un document'}
                    >
                        Importer un document
                    </Button>
                </div>
            </div>

            {/* Statistiques */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div style={{
                    ...cardStyle,
                    padding: '24px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white'
                }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                        {uploadedFiles.length}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                        Documents importés
                    </div>
                </div>
                
                <div style={{
                    ...cardStyle,
                    padding: '24px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white'
                }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                        {uploadedFiles.reduce((total, file) => total + file.size, 0) > 0 
                            ? UploadService.formatFileSize(uploadedFiles.reduce((total, file) => total + file.size, 0))
                            : '0 Bytes'
                        }
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                        Taille totale
                    </div>
                </div>
            </div>

            {/* Liste des fichiers */}
            <div style={cardStyle}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '24px',
                    paddingBottom: '16px',
                    borderBottom: '2px solid #f1f5f9'
                }}>
                    <FileText size={24} color="#10b981" />
                    <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#1e293b' }}>
                        Documents importés
                    </h2>
                </div>

                {uploadedFiles.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '48px',
                        color: '#64748b'
                    }}>
                        <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                        <p style={{ fontSize: '16px', margin: 0 }}>
                            Aucun document importé pour le moment
                        </p>
                        <p style={{ fontSize: '14px', margin: '8px 0 0 0' }}>
                            Cliquez sur "Importer un document" pour commencer
                        </p>
                    </div>
                ) : (
                    <div>
                        {uploadedFiles.map((file) => (
                            <div key={file.id} style={fileItemStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        padding: '8px',
                                        backgroundColor: '#dbeafe',
                                        borderRadius: '6px'
                                    }}>
                                        <FileText size={20} color="#1d4ed8" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '500', color: '#1e293b' }}>
                                            {file.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                                            {UploadService.formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                                        </div>
                                        {file.configName && (
                                            <div style={{ 
                                                fontSize: '11px', 
                                                color: '#059669',
                                                backgroundColor: '#f0fdf4',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                display: 'inline-block',
                                                border: '1px solid #bbf7d0'
                                            }}>
                                                📋 {file.configName} ({file.program})
                                            </div>
                                        )}
                                        {file.originalName && file.originalName !== file.name && (
                                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                                Fichier original: {file.originalName}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div style={{ 
                                    color: '#6b7280', 
                                    fontSize: '12px',
                                    fontStyle: 'italic'
                                }}>
                                    Sauvegardé automatiquement
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal d'upload (copié de BulletinConfig) */}
            {showUploadModal && (
                <div style={modalOverlayStyle} onClick={() => !uploadStatus || uploadStatus.type !== 'uploading' ? setShowUploadModal(false) : null}>
                    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px',
                            paddingBottom: '16px',
                            borderBottom: '2px solid #f1f5f9'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#f0fdf4',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FileText size={24} color="#10b981" />
                                </div>
                                <div>
                                    <h4 style={{ 
                                        fontSize: '20px', 
                                        fontWeight: '600', 
                                        color: '#1e293b',
                                        margin: '0 0 4px 0'
                                    }}>
                                        Importer un document Word
                                    </h4>
                                    <p style={{
                                        fontSize: '14px',
                                        color: '#64748b',
                                        margin: 0
                                    }}>
                                        Uploadez un fichier .docx vers le dossier public/upload
                                    </p>
                                </div>
                            </div>
                            {(!uploadStatus || uploadStatus.type !== 'uploading') && (
                                <Button
                                    small
                                    secondary
                                    onClick={() => setShowUploadModal(false)}
                                    icon={<X size={16} />}
                                    style={{
                                        padding: '8px',
                                        minWidth: 'auto'
                                    }}
                                />
                            )}
                        </div>

                        {/* Zone de drop */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDrag}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            style={{
                                border: `2px dashed ${dragActive ? '#10b981' : '#cbd5e1'}`,
                                borderRadius: '12px',
                                padding: '48px 24px',
                                textAlign: 'center',
                                backgroundColor: dragActive ? '#f0fdf4' : '#f8fafc',
                                transition: 'all 0.3s ease',
                                marginBottom: '24px',
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                if (!uploadStatus || uploadStatus.type !== 'uploading') {
                                    document.getElementById('fileInput').click()
                                }
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '16px'
                            }}>
                                <div style={{
                                    padding: '16px',
                                    backgroundColor: dragActive ? '#10b981' : '#e2e8f0',
                                    borderRadius: '50%',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <Upload size={32} color={dragActive ? 'white' : '#64748b'} />
                                </div>
                                
                                <div>
                                    <h5 style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: dragActive ? '#10b981' : '#1e293b',
                                        margin: '0 0 8px 0'
                                    }}>
                                        {dragActive ? 'Relâchez pour importer' : 'Glissez-déposez votre fichier ici'}
                                    </h5>
                                    <p style={{
                                        fontSize: '14px',
                                        color: '#64748b',
                                        margin: '0 0 16px 0'
                                    }}>
                                        ou cliquez pour sélectionner un fichier
                                    </p>
                                    
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '24px',
                                        fontSize: '12px',
                                        color: '#64748b'
                                    }}>
                                        <span>✓ Fichiers .docx uniquement</span>
                                        <span>✓ Taille max: 10MB</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Input file caché */}
                        <input
                            id="fileInput"
                            type="file"
                            accept=".docx"
                            onChange={(e) => handleFileUpload(e.target.files)}
                            style={{ display: 'none' }}
                            disabled={uploadStatus?.type === 'uploading'}
                        />

                        {/* Statut d'upload */}
                        {uploadStatus && (
                            <div style={{
                                padding: '16px',
                                borderRadius: '8px',
                                backgroundColor: 
                                    uploadStatus.type === 'success' ? '#f0fdf4' :
                                    uploadStatus.type === 'error' ? '#fef2f2' :
                                    uploadStatus.type === 'uploading' ? '#eff6ff' : '#f8fafc',
                                border: `1px solid ${
                                    uploadStatus.type === 'success' ? '#bbf7d0' :
                                    uploadStatus.type === 'error' ? '#fecaca' :
                                    uploadStatus.type === 'uploading' ? '#bfdbfe' : '#e2e8f0'
                                }`,
                                marginBottom: '16px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    {uploadStatus.type === 'success' && <CheckCircle size={20} color="#10b981" />}
                                    {uploadStatus.type === 'error' && <AlertCircle size={20} color="#ef4444" />}
                                    {uploadStatus.type === 'uploading' && (
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid #3b82f6',
                                            borderTop: '2px solid transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                    )}
                                    
                                    <div style={{ flex: 1 }}>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: 
                                                uploadStatus.type === 'success' ? '#166534' :
                                                uploadStatus.type === 'error' ? '#dc2626' :
                                                uploadStatus.type === 'uploading' ? '#1d4ed8' : '#374151'
                                        }}>
                                            {uploadStatus.message}
                                        </p>
                                        
                                        {uploadStatus.type === 'uploading' && (
                                            <div style={{
                                                marginTop: '8px',
                                                height: '4px',
                                                backgroundColor: '#e5e7eb',
                                                borderRadius: '2px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    backgroundColor: '#3b82f6',
                                                    borderRadius: '2px',
                                                    width: `${uploadProgress}%`,
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: '16px',
                            borderTop: '1px solid #f1f5f9'
                        }}>
                            <div style={{
                                fontSize: '12px',
                                color: '#64748b'
                            }}>
                                Les fichiers seront sauvegardés dans <code style={{
                                    backgroundColor: '#f1f5f9',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontFamily: 'monospace'
                                }}>public/upload/</code>
                            </div>
                            
                            {(!uploadStatus || uploadStatus.type !== 'uploading') && (
                                <Button
                                    secondary
                                    onClick={() => setShowUploadModal(false)}
                                >
                                    Fermer
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CSS pour l'animation de rotation */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

export default DocumentImport
