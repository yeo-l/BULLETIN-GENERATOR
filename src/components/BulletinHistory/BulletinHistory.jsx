import React, { useState, useEffect } from 'react'
import { Button, Card, InputField, NoticeBox } from '@dhis2/ui'
import { 
    History, 
    Search, 
    Filter, 
    Download, 
    Eye, 
    Edit, 
    Trash2, 
    Calendar,
    FileText,
    Settings,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    X
} from 'lucide-react'
import './BulletinHistory.css'

const BulletinHistory = ({ onNavigateToConfig }) => {
    const [configurations, setConfigurations] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedProgram, setSelectedProgram] = useState('')
    const [sortBy, setSortBy] = useState('date')
    const [sortOrder, setSortOrder] = useState('desc')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedConfig, setSelectedConfig] = useState(null)
    const [showConfigDetails, setShowConfigDetails] = useState(false)

    // Données de test pour les programmes
    const PROGRAM_OPTIONS = [
        { value: "PEV", label: "PEV" },
        { value: "PNLT", label: "PNLT" },
        { value: "PNN", label: "PNN" },
        { value: "PNLS", label: "PNLS" },
        { value: "INHP", label: "INHP" },
        { value: "PNSME", label: "PNSME" },
    ]

    // Fonction pour charger les configurations depuis le datastore
    const loadConfigurations = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/dataStore/GENERATE-BULLETIN')
            
            if (response.ok) {
                const configKeys = await response.json()
                console.log('Clés de configurations trouvées:', configKeys)
                
                // Charger les détails de chaque configuration
                const configsWithDetails = await Promise.all(
                    configKeys.map(async (key) => {
                        try {
                            const detailResponse = await fetch(`/api/dataStore/GENERATE-BULLETIN/${key}`)
                            if (detailResponse.ok) {
                                const configData = await detailResponse.json()
                                return {
                                    key,
                                    ...configData,
                                    lastModified: configData.lastModified || new Date().toISOString(),
                                    createdDate: configData.createdDate || new Date().toISOString()
                                }
                            }
                            return null
                        } catch (error) {
                            console.error(`Erreur lors du chargement de la configuration ${key}:`, error)
                            return null
                        }
                    })
                )
                
                const validConfigs = configsWithDetails.filter(config => config !== null)
                setConfigurations(validConfigs)
            } else if (response.status === 404) {
                console.log('Aucune configuration trouvée')
                setConfigurations([])
            } else {
                console.error('Erreur lors de la récupération des configurations')
            }
        } catch (error) {
            console.error('Erreur lors du chargement des configurations:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Charger les configurations au démarrage
    useEffect(() => {
        loadConfigurations()
    }, [])

    // Fonction pour filtrer et trier les configurations
    const getFilteredAndSortedConfigurations = () => {
        let filtered = configurations.filter(config => {
            const matchesSearch = config.program?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                config.coverTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                config.key?.toLowerCase().includes(searchTerm.toLowerCase())
            
            const matchesProgram = !selectedProgram || config.program === selectedProgram
            
            return matchesSearch && matchesProgram
        })

        // Trier les configurations
        filtered.sort((a, b) => {
            let aValue, bValue
            
            switch (sortBy) {
                case 'date':
                    aValue = new Date(a.lastModified || a.createdDate)
                    bValue = new Date(b.lastModified || b.createdDate)
                    break
                case 'program':
                    aValue = a.program || ''
                    bValue = b.program || ''
                    break
                case 'title':
                    aValue = a.coverTitle || ''
                    bValue = b.coverTitle || ''
                    break
                default:
                    aValue = a.key || ''
                    bValue = b.key || ''
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

        return filtered
    }

    // Fonction pour supprimer une configuration
    const deleteConfiguration = async (configKey) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette configuration ?')) {
            try {
                const response = await fetch(`/api/dataStore/GENERATE-BULLETIN/${configKey}`, {
                    method: 'DELETE'
                })
                
                if (response.ok) {
                    console.log('Configuration supprimée avec succès')
                    loadConfigurations() // Recharger la liste
                } else {
                    console.error('Erreur lors de la suppression')
                }
            } catch (error) {
                console.error('Erreur lors de la suppression:', error)
            }
        }
    }

    // Fonction pour charger une configuration
    const loadConfiguration = (config) => {
        setSelectedConfig(config)
        setShowConfigDetails(true)
    }

    // Fonction pour modifier une configuration
    const editConfiguration = (config) => {
        if (onNavigateToConfig) {
            // Naviguer vers le composant de configuration avec les données à modifier
            onNavigateToConfig('config', config)
        }
    }

    const filteredConfigurations = getFilteredAndSortedConfigurations()

    // Fonction pour obtenir la classe du badge selon le programme
    const getProgramBadgeClass = (program) => {
        switch (program) {
            case 'PEV': return 'program-badge badge-pev'
            case 'PNLT': return 'program-badge badge-pnlt'
            case 'PNN': return 'program-badge badge-pnn'
            case 'PNLS': return 'program-badge badge-pnls'
            case 'INHP': return 'program-badge badge-inhp'
            default: return 'program-badge badge-default'
        }
    }

    return (
        <div className="bulletin-history">
            {/* Header */}
            <div className="history-header">
                <div className="header-content">
                    <div className="header-text">
                        <h1>Historique des Bulletins</h1>
                        <p>Gérez et consultez vos configurations de bulletins</p>
                    </div>
                    <Button 
                        primary 
                        onClick={loadConfigurations} 
                        icon={<RefreshCw size={18} />}
                        loading={isLoading}
                        className="refresh-btn"
                    >
                        Actualiser
                    </Button>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="filters-section">
                <div className="filters-header">
                    <h3>Filtres et recherche</h3>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="filter-toggle"
                    >
                        {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        Filtres
                    </button>
                </div>

                <div className="search-filters">
                    <div className="search-container">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Rechercher par programme, titre ou clé..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <select
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                        className="program-select"
                    >
                        <option value="">Tous les programmes</option>
                        {PROGRAM_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {showFilters && (
                    <div className="advanced-filters">
                        <div className="filter-group">
                            <label className="filter-label">Trier par</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="filter-select"
                            >
                                <option value="date">Date de modification</option>
                                <option value="program">Programme</option>
                                <option value="title">Titre</option>
                                <option value="key">Clé</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Ordre</label>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="filter-select"
                            >
                                <option value="desc">Décroissant</option>
                                <option value="asc">Croissant</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Statistiques */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-icon blue">
                            <FileText size={24} color="white" />
                        </div>
                        <div className="stat-text">
                            <div className="stat-number">{configurations.length}</div>
                            <div className="stat-label">Configurations totales</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-icon green">
                            <Settings size={24} color="white" />
                        </div>
                        <div className="stat-text">
                            <div className="stat-number">{new Set(configurations.map(c => c.program)).size}</div>
                            <div className="stat-label">Programmes différents</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-icon orange">
                            <Calendar size={24} color="white" />
                        </div>
                        <div className="stat-text">
                            <div className="stat-number">
                                {configurations.filter(c => new Date(c.lastModified) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                            </div>
                            <div className="stat-label">Modifiées cette semaine</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des configurations */}
            {isLoading ? (
                <div className="loading-state">
                    <RefreshCw size={48} className="loading-spinner" />
                    <div>Chargement des configurations...</div>
                </div>
            ) : filteredConfigurations.length === 0 ? (
                <div className="empty-state">
                    <History size={64} className="empty-icon" />
                    <h3>Aucune configuration trouvée</h3>
                    <p>
                        {searchTerm || selectedProgram 
                            ? 'Aucune configuration ne correspond à vos critères de recherche.'
                            : 'Aucune configuration n\'a été créée pour le moment.'
                        }
                    </p>
                    {searchTerm || selectedProgram ? (
                        <Button 
                            secondary 
                            onClick={() => {
                                setSearchTerm('')
                                setSelectedProgram('')
                            }}
                        >
                            Effacer les filtres
                        </Button>
                    ) : (
                        <Button primary>
                            Créer une configuration
                        </Button>
                    )}
                </div>
            ) : (
                <div className="configurations-section">
                    <div className="section-header">
                        <h3>Configurations ({filteredConfigurations.length})</h3>
                    </div>
                    
                    <div className="configuration-list">
                        {filteredConfigurations.map((config, index) => (
                            <div 
                                key={config.key} 
                                className="configuration-card"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="configuration-content">
                                    <div className="configuration-info">
                                        <div className="configuration-header">
                                            <span className={getProgramBadgeClass(config.program)}>
                                                {config.program || 'N/A'}
                                            </span>
                                            <h4 className="configuration-title">
                                                {config.coverTitle || 'Sans titre'}
                                            </h4>
                                        </div>
                                        
                                        <div className="configuration-details">
                                            <div className="configuration-detail">
                                                <strong>Périodicité:</strong> {config.periodicity || 'Non définie'}
                                            </div>
                                            <div className="configuration-detail">
                                                <strong>Modifié:</strong> {new Date(config.lastModified || config.createdDate).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="configuration-actions">
                                        <button
                                            onClick={() => loadConfiguration(config)}
                                            className="action-btn view"
                                        >
                                            <Eye size={14} />
                                            Voir
                                        </button>
                                        <button
                                            onClick={() => editConfiguration(config)}
                                            className="action-btn edit"
                                        >
                                            <Edit size={14} />
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => deleteConfiguration(config.key)}
                                            className="action-btn delete"
                                        >
                                            <Trash2 size={14} />
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal de détails de configuration */}
            {showConfigDetails && selectedConfig && (
                <div className="modal-overlay" onClick={() => setShowConfigDetails(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Détails de la configuration</h2>
                            <button 
                                onClick={() => setShowConfigDetails(false)}
                                className="modal-close-btn"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="modal-grid">
                            <div className="modal-section">
                                <h3>Informations générales</h3>
                                <div className="info-group">
                                    <div className="info-item">
                                        <label>Programme</label>
                                        <div>{selectedConfig.program || 'Non défini'}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Titre</label>
                                        <div>{selectedConfig.coverTitle || 'Sans titre'}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Périodicité</label>
                                        <div>{selectedConfig.periodicity || 'Non définie'}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Génération automatique</label>
                                        <div>{selectedConfig.autoGenerate ? 'Activée' : 'Désactivée'}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="modal-section">
                                <h3>Métadonnées</h3>
                                <div className="info-group">
                                    <div className="info-item">
                                        <label>Clé</label>
                                        <div style={{ fontFamily: 'monospace' }}>{selectedConfig.key}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Créé le</label>
                                        <div>{new Date(selectedConfig.createdDate).toLocaleString('fr-FR')}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Modifié le</label>
                                        <div>{new Date(selectedConfig.lastModified).toLocaleString('fr-FR')}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Version</label>
                                        <div>{selectedConfig.version || '1.0'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {selectedConfig.sections && selectedConfig.sections.length > 0 && (
                            <div className="modal-section">
                                <h3>Rubriques configurées ({selectedConfig.sections.length})</h3>
                                <div className="sections-list">
                                    {selectedConfig.sections.map((section, index) => (
                                        <div key={section.id || index} className="section-item">
                                            <div className="section-title">
                                                {section.title || `Rubrique ${index + 1}`}
                                            </div>
                                            <div className="section-subtitle">
                                                {section.subsections?.length || 0} sous-rubrique(s)
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default BulletinHistory