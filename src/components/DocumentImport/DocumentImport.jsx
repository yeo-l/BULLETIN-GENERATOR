import React, { useState, useEffect } from 'react'
import { Button, NoticeBox } from '@dhis2/ui'
import { Upload, FileText, X, CheckCircle, AlertCircle, Settings, Download, Trash2 } from 'lucide-react'
import UploadService from '../../services/uploadService'
import './DocumentImport.css'

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
            console.log('Tentative de chargement des configurations depuis:', '/api/dataStore/GENERATE-BULLETIN')
            const keysResponse = await fetch('/api/dataStore/GENERATE-BULLETIN')
            console.log('Réponse du datastore:', keysResponse.status, keysResponse.statusText)
            
            if (keysResponse.ok) {
                const keys = await keysResponse.json()
                console.log('Clés récupérées:', keys)
                
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
                
                validConfigs.sort((a, b) => new Date(b.lastModified || b.createdDate) - new Date(a.lastModified || a.createdDate))
                
                setAvailableConfigs(validConfigs)
            } else {
                console.error('Erreur lors de la récupération des clés du datastore:', keysResponse.status)
                if (keysResponse.status === 404) {
                    console.log('Le namespace GENERATE-BULLETIN n\'existe pas encore ou l\'API datastore n\'est pas accessible')
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

    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) return

        if (!selectedConfig) {
            setUploadStatus({
                type: 'error',
                message: 'Veuillez d\'abord sélectionner une configuration de bulletin'
            })
            return
        }

        const file = files[0]
        const validation = UploadService.validateFile(file)
        
        if (!validation.valid) {
            setUploadStatus({
                type: 'error',
                message: validation.errors.join(', ')
            })
            return
        }

        if (validation.warnings.length > 0) {
            console.warn('Avertissements:', validation.warnings)
        }

        try {
            const originalExtension = file.name.split('.').pop()
            const originalNameWithoutExt = file.name.replace(`.${originalExtension}`, '')
            const configBasedName = `${originalNameWithoutExt}_${selectedConfig.key}.${originalExtension}`
            
            setUploadStatus({ 
                type: 'uploading', 
                message: `Upload de "${configBasedName}" (${UploadService.formatFileSize(file.size)})...` 
            })
            setUploadProgress(0)

            const renamedFile = new File([file], configBasedName, { type: file.type })

            let result
            try {
                result = await UploadService.uploadDocx(renamedFile, (progress) => {
                    setUploadProgress(progress)
                })
            } catch (uploadError) {
                console.warn('API d\'upload non disponible, tentative d\'upload automatique:', uploadError.message)
                
                const autoUpload = async () => {
                    try {
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
                        
                        return new Promise((resolve) => {
                            let progress = 0
                            const interval = setInterval(() => {
                                progress += 20
                                setUploadProgress(progress)
                                if (progress >= 100) {
                                    clearInterval(interval)
                                    
                                    const blob = new Blob([renamedFile], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
                                    const url = URL.createObjectURL(blob)
                                    
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

    const downloadFile = (file) => {
        const link = document.createElement('a')
        link.href = file.path
        link.download = file.name
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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

    return (
        <div className="document-import-container">
            {/* Sélection de configuration */}
            <div className={`document-import-card config-selection-card ${selectedConfig ? 'config-selected' : ''}`}>
                <div className="card-header">
                    <Settings size={24} className="header-icon" />
                    <h2>Sélectionner la Configuration du Bulletin</h2>
                </div>

                {loadingConfigs ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Chargement des configurations...</p>
                    </div>
                ) : availableConfigs.length === 0 ? (
                    <div className="empty-state">
                        <Settings size={32} className="empty-icon" />
                        <p>Aucune configuration trouvée</p>
                        <p className="empty-subtitle">Créez d'abord une configuration dans "Paramétrage"</p>
                    </div>
                ) : (
                    <div>
                        <select
                            value={selectedConfig?.key || ''}
                            onChange={(e) => {
                                const config = availableConfigs.find(c => c.key === e.target.value)
                                setSelectedConfig(config || null)
                            }}
                            className="config-select"
                        >
                            <option value="">Sélectionner une configuration...</option>
                            {availableConfigs.map((config) => (
                                <option key={config.key} value={config.key}>
                                    {config.name} ({config.program}) - {new Date(config.lastModified || config.createdDate).toLocaleDateString('fr-FR')}
                                </option>
                            ))}
                        </select>

                        {selectedConfig && (
                            <div className="config-details">
                                <div className="config-grid">
                                    <div className="config-item">
                                        <div className="config-label">Programme</div>
                                        <div className="config-value">{selectedConfig.program || 'Non défini'}</div>
                                    </div>
                                    <div className="config-item">
                                        <div className="config-label">Périodicité</div>
                                        <div className="config-value">{selectedConfig.periodicity || 'Non définie'}</div>
                                    </div>
                                    <div className="config-item">
                                        <div className="config-label">Clé de configuration</div>
                                        <div className="config-key">{selectedConfig.key}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Header */}
            <div className="document-import-header">
                <div className="header-content">
                    <div className="header-text">
                        <h1>Importation de Documents</h1>
                        <p>Gérez vos modèles de documents Word (.docx)</p>
                        {availableConfigs.length > 0 && availableConfigs[0].key === 'TEST-CONFIG-001' && (
                            <div className="dev-warning">
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
                        className="glow-button"
                    >
                        Importer un document
                    </Button>
                </div>
            </div>

            {/* Statistiques */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number">{uploadedFiles.length}</div>
                    <div className="stat-label">Documents importés</div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-number">
                        {uploadedFiles.reduce((total, file) => total + file.size, 0) > 0 
                            ? UploadService.formatFileSize(uploadedFiles.reduce((total, file) => total + file.size, 0))
                            : '0 Bytes'
                        }
                    </div>
                    <div className="stat-label">Taille totale</div>
                </div>
            </div>

            {/* Liste des fichiers */}
            <div className="document-import-card">
                <div className="card-header">
                    <FileText size={24} className="header-icon" color="#10b981" />
                    <h2>Documents importés</h2>
                </div>

                {uploadedFiles.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} className="empty-icon" />
                        <p>Aucun document importé pour le moment</p>
                        <p className="empty-subtitle">Cliquez sur "Importer un document" pour commencer</p>
                    </div>
                ) : (
                    <div className="files-list">
                        {uploadedFiles.map((file, index) => (
                            <div key={file.id} className={`file-item ${index === 0 ? 'new-file' : ''}`}>
                                <div className="file-info">
                                    <div className="file-icon-container">
                                        <FileText size={20} color="#1d4ed8" />
                                    </div>
                                    <div className="file-details">
                                        <div className="file-name">{file.name}</div>
                                        <div className="file-meta">
                                            {UploadService.formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                                        </div>
                                        {file.configName && (
                                            <div className="config-badge">
                                                📋 {file.configName} ({file.program})
                                            </div>
                                        )}
                                        {file.originalName && file.originalName !== file.name && (
                                            <div className="file-original">
                                                Fichier original: {file.originalName}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="file-actions">
                                    <Button
                                        small
                                        secondary
                                        icon={<Download size={14} />}
                                        onClick={() => downloadFile(file)}
                                        title="Télécharger le fichier"
                                    />
                                    <Button
                                        small
                                        destructive
                                        icon={<Trash2 size={14} />}
                                        onClick={() => deleteFile(file.id)}
                                        title="Supprimer le fichier"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal d'upload */}
            {showUploadModal && (
                <div className="upload-modal-overlay" onClick={() => !uploadStatus || uploadStatus.type !== 'uploading' ? setShowUploadModal(false) : null}>
                    <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                <div className="title-icon">
                                    <FileText size={24} color="#10b981" />
                                </div>
                                <div>
                                    <h4>Importer un document Word</h4>
                                    <p>Uploadez un fichier .docx vers le dossier public/upload</p>
                                </div>
                            </div>
                            {(!uploadStatus || uploadStatus.type !== 'uploading') && (
                                <Button
                                    small
                                    secondary
                                    onClick={() => setShowUploadModal(false)}
                                    icon={<X size={16} />}
                                    className="close-button"
                                />
                            )}
                        </div>

                        {/* Zone de drop */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDrag}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            className={`drop-zone ${dragActive ? 'active' : ''}`}
                            onClick={() => {
                                if (!uploadStatus || uploadStatus.type !== 'uploading') {
                                    document.getElementById('fileInput').click()
                                }
                            }}
                        >
                            <div className="drop-content">
                                <div className="drop-zone-icon">
                                    <Upload size={32} color={dragActive ? 'white' : '#64748b'} />
                                </div>
                                
                                <div className="drop-text">
                                    <h5>{dragActive ? 'Relâchez pour importer' : 'Glissez-déposez votre fichier ici'}</h5>
                                    <p>ou cliquez pour sélectionner un fichier</p>
                                    
                                    <div className="file-requirements">
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
                            <div className={`upload-status ${uploadStatus.type}`}>
                                <div className="status-content">
                                    {uploadStatus.type === 'success' && <CheckCircle size={20} color="#10b981" />}
                                    {uploadStatus.type === 'error' && <AlertCircle size={20} color="#ef4444" />}
                                    {uploadStatus.type === 'uploading' && (
                                        <div className="loading-spinner small"></div>
                                    )}
                                    
                                    <div className="status-message">
                                        <p>{uploadStatus.message}</p>
                                        
                                        {uploadStatus.type === 'uploading' && (
                                            <div className="progress-bar">
                                                <div 
                                                    className="progress-fill" 
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="modal-actions">
                            <div className="upload-info">
                                Les fichiers seront sauvegardés dans <code>public/upload/</code>
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
        </div>
    )
}

export default DocumentImport