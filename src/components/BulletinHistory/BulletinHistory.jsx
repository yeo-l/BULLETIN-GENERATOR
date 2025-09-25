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
    ChevronUp
} from 'lucide-react'

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

    // Styles
    const containerStyle = {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px',
        backgroundColor: '#f8fafc',
        minHeight: '100vh'
    }

    const headerStyle = {
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        padding: '32px',
        borderRadius: '12px',
        marginBottom: '32px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    }

    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: '16px'
    }

    const filterCardStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
    }

    const configCardStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: '16px',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
    }

    const configCardHoverStyle = {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        borderColor: '#3b82f6'
    }

    const badgeStyle = {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase'
    }

    const buttonStyle = {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease'
    }

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                            Historique des Bulletins
                        </h1>
                        <p style={{ opacity: 0.9, fontSize: '16px' }}>
                            Gérez et consultez vos configurations de bulletins
                        </p>
                    </div>
                    <Button 
                        primary 
                        onClick={loadConfigurations} 
                        icon={<RefreshCw size={18} />}
                        loading={isLoading}
                    >
                        Actualiser
                    </Button>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div style={filterCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                        Filtres et recherche
                    </h3>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            ...buttonStyle,
                            backgroundColor: '#f1f5f9',
                            color: '#374151'
                        }}
                    >
                        {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        Filtres
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                        <input
                            type="text"
                            placeholder="Rechercher par programme, titre ou clé..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                backgroundColor: 'white'
                            }}
                        />
                    </div>
                    <select
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                        style={{
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            minWidth: '200px'
                        }}
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
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '16px',
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                Trier par
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="date">Date de modification</option>
                                <option value="program">Programme</option>
                                <option value="title">Titre</option>
                                <option value="key">Clé</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                Ordre
                            </label>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="desc">Décroissant</option>
                                <option value="asc">Croissant</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Statistiques */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '12px', 
                            backgroundColor: '#dbeafe', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <FileText size={24} color="#3b82f6" />
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                                {configurations.length}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                Configurations totales
                            </div>
                        </div>
                    </div>
                </div>
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '12px', 
                            backgroundColor: '#dcfce7', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <Settings size={24} color="#10b981" />
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                                {new Set(configurations.map(c => c.program)).size}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                Programmes différents
                            </div>
                        </div>
                    </div>
                </div>
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '12px', 
                            backgroundColor: '#fef3c7', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <Calendar size={24} color="#f59e0b" />
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                                {configurations.filter(c => new Date(c.lastModified) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                Modifiées cette semaine
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des configurations */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                    <RefreshCw size={48} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                    <div>Chargement des configurations...</div>
                </div>
            ) : filteredConfigurations.length === 0 ? (
                <div style={cardStyle}>
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <History size={64} color="#d1d5db" style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            Aucune configuration trouvée
                        </h3>
                        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
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
                </div>
            ) : (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                            Configurations ({filteredConfigurations.length})
                        </h3>
                    </div>
                    
                    {filteredConfigurations.map((config) => (
                        <div 
                            key={config.key} 
                            style={configCardStyle}
                            onMouseEnter={(e) => {
                                e.target.style.transform = configCardHoverStyle.transform
                                e.target.style.boxShadow = configCardHoverStyle.boxShadow
                                e.target.style.borderColor = configCardHoverStyle.borderColor
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = ''
                                e.target.style.boxShadow = ''
                                e.target.style.borderColor = ''
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <span style={{
                                            ...badgeStyle,
                                            backgroundColor: config.program === 'PEV' ? '#dbeafe' : 
                                                           config.program === 'PNLT' ? '#fef3c7' :
                                                           config.program === 'PNN' ? '#dcfce7' :
                                                           config.program === 'PNLS' ? '#fce7f3' :
                                                           config.program === 'INHP' ? '#f3e8ff' :
                                                           '#f1f5f9',
                                            color: config.program === 'PEV' ? '#1e40af' : 
                                                   config.program === 'PNLT' ? '#92400e' :
                                                   config.program === 'PNN' ? '#166534' :
                                                   config.program === 'PNLS' ? '#be185d' :
                                                   config.program === 'INHP' ? '#7c3aed' :
                                                   '#374151'
                                        }}>
                                            {config.program || 'N/A'}
                                        </span>
                                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                                            {config.coverTitle || 'Sans titre'}
                                        </h4>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                            <strong>Périodicité:</strong> {config.periodicity || 'Non définie'}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                            <strong>Modifié:</strong> {new Date(config.lastModified || config.createdDate).toLocaleDateString('fr-FR')}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => loadConfiguration(config)}
                                        style={{
                                            ...buttonStyle,
                                            backgroundColor: '#3b82f6',
                                            color: 'white'
                                        }}
                                    >
                                        <Eye size={14} />
                                        Voir
                                    </button>
                                    <button
                                        onClick={() => editConfiguration(config)}
                                        style={{
                                            ...buttonStyle,
                                            backgroundColor: '#f59e0b',
                                            color: 'white'
                                        }}
                                    >
                                        <Edit size={14} />
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => deleteConfiguration(config.key)}
                                        style={{
                                            ...buttonStyle,
                                            backgroundColor: '#ef4444',
                                            color: 'white'
                                        }}
                                    >
                                        <Trash2 size={14} />
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de détails de configuration */}
            {showConfigDetails && selectedConfig && (
                <div style={{
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
                }} onClick={() => setShowConfigDetails(false)}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '32px',
                        width: '90vw',
                        maxWidth: '800px',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 25px rgba(0,0,0,0.1)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b' }}>
                                Détails de la configuration
                            </h2>
                            <Button onClick={() => setShowConfigDetails(false)} secondary>
                                Fermer
                            </Button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
                                    Informations générales
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Programme</label>
                                        <div style={{ fontSize: '16px', color: '#1e293b' }}>{selectedConfig.program || 'Non défini'}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Titre</label>
                                        <div style={{ fontSize: '16px', color: '#1e293b' }}>{selectedConfig.coverTitle || 'Sans titre'}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Périodicité</label>
                                        <div style={{ fontSize: '16px', color: '#1e293b' }}>{selectedConfig.periodicity || 'Non définie'}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Génération automatique</label>
                                        <div style={{ fontSize: '16px', color: '#1e293b' }}>
                                            {selectedConfig.autoGenerate ? 'Activée' : 'Désactivée'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
                                    Métadonnées
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Clé</label>
                                        <div style={{ fontSize: '16px', color: '#1e293b', fontFamily: 'monospace' }}>{selectedConfig.key}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Créé le</label>
                                        <div style={{ fontSize: '16px', color: '#1e293b' }}>
                                            {new Date(selectedConfig.createdDate).toLocaleString('fr-FR')}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Modifié le</label>
                                        <div style={{ fontSize: '16px', color: '#1e293b' }}>
                                            {new Date(selectedConfig.lastModified).toLocaleString('fr-FR')}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Version</label>
                                        <div style={{ fontSize: '16px', color: '#1e293b' }}>{selectedConfig.version || '1.0'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {selectedConfig.sections && selectedConfig.sections.length > 0 && (
                            <div style={{ marginTop: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
                                    Rubriques configurées ({selectedConfig.sections.length})
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {selectedConfig.sections.map((section, index) => (
                                        <div key={section.id || index} style={{
                                            padding: '12px',
                                            backgroundColor: '#f8fafc',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <div style={{ fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                                                {section.title || `Rubrique ${index + 1}`}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
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