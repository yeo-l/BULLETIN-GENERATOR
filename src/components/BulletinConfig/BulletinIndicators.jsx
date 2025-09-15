import React, { useState, useEffect } from 'react'
import { Button, Card, InputField, NoticeBox } from '@dhis2/ui'
import { Search, Filter, ChevronRight, ChevronLeft, X, Check, Plus, FolderOpen, BarChart3 } from 'lucide-react'

const BulletinIndicators = ({ 
    onClose, 
    onAddIndicator, 
    onRemoveIndicator, 
    onAddAll, 
    onRemoveAll,
    selectedIndicators = [],
    groupName = 'Groupe d\'indicateurs'
}) => {
    const [indicators, setIndicators] = useState([])
    const [indicatorGroups, setIndicatorGroups] = useState([])
    const [filteredIndicators, setFilteredIndicators] = useState([])
    const [filteredGroups, setFilteredGroups] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [viewMode, setViewMode] = useState('indicators') // 'indicators' ou 'groups'
    const [groupIndicators, setGroupIndicators] = useState([]) // Indicateurs du groupe sélectionné
    const [localSelectedIndicators, setLocalSelectedIndicators] = useState(selectedIndicators || [])

    // Synchroniser les indicateurs sélectionnés avec les props
    useEffect(() => {
        setLocalSelectedIndicators(selectedIndicators || [])
    }, [selectedIndicators])

    // Récupération des indicateurs depuis l'API DHIS2
    useEffect(() => {
        fetchIndicators()
        fetchIndicatorGroups()
    }, [])

    const fetchIndicators = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/indicators?fields=id,name,shortName,description,indicatorType&paging=false')
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }
            
            const data = await response.json()
            const formattedIndicators = data.indicators.map(indicator => ({
                id: indicator.id,
                name: indicator.name,
                shortName: indicator.shortName || indicator.name,
                description: indicator.description || '',
                type: indicator.indicatorType?.name || 'Standard'
            }))
            
            setIndicators(formattedIndicators)
            setFilteredIndicators(formattedIndicators)
        } catch (error) {
            console.error('Erreur lors de la récupération des indicateurs:', error)
            setError(`Erreur de connexion à DHIS2: ${error.message}`)
            setIndicators([])
            setFilteredIndicators([])
        } finally {
            setLoading(false)
        }
    }

    const fetchIndicatorGroups = async () => {
        try {
            const response = await fetch('/api/indicatorGroups?fields=id,name,description&paging=false')
            
            if (response.ok) {
                const data = await response.json()
                const formattedGroups = data.indicatorGroups.map(group => ({
                    id: group.id,
                    name: group.name,
                    description: group.description || '',
                    count: 0 // Sera mis à jour
                }))
                setIndicatorGroups(formattedGroups)
                setFilteredGroups(formattedGroups)
                
                // Mettre à jour le comptage des indicateurs par groupe
                updateGroupCounts(formattedGroups)
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des groupes d\'indicateurs:', error)
            setError(`Erreur de connexion à DHIS2: ${error.message}`)
            setIndicatorGroups([])
            setFilteredGroups([])
        }
    }

    // Mettre à jour le comptage des indicateurs par groupe
    const updateGroupCounts = async (groups) => {
        try {
            for (let group of groups) {
                const response = await fetch(`/api/indicatorGroups/${group.id}?fields=indicators&paging=false`)
                if (response.ok) {
                    const data = await response.json()
                    const count = data.indicators?.length || 0
                    
                    setIndicatorGroups(prev => prev.map(g => 
                        g.id === group.id ? { ...g, count } : g
                    ))
                    setFilteredGroups(prev => prev.map(g => 
                        g.id === group.id ? { ...g, count } : g
                    ))
                }
            }
        } catch (error) {
            console.error('Erreur lors du comptage des indicateurs par groupe:', error)
        }
    }

    // Récupérer les indicateurs d'un groupe spécifique
    const fetchGroupIndicators = async (groupId) => {
        try {
            const response = await fetch(`/api/indicatorGroups/${groupId}?fields=indicators[id,name,shortName,description,indicatorType]&paging=false`)
            
            if (response.ok) {
                const data = await response.json()
                const groupIndicators = data.indicators.map(indicator => ({
                    id: indicator.id,
                    name: indicator.name,
                    shortName: indicator.shortName || indicator.name,
                    description: indicator.description || '',
                    type: indicator.indicatorType?.name || 'Standard'
                }))
                
                setGroupIndicators(groupIndicators)
                setFilteredIndicators(groupIndicators)
                return groupIndicators
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des indicateurs du groupe:', error)
            // En cas d'erreur, afficher tous les indicateurs
            setGroupIndicators([])
            setFilteredIndicators(indicators)
        }
        return []
    }

    // Filtrage des indicateurs et groupes
    useEffect(() => {
        if (viewMode === 'indicators') {
            let indicatorsToFilter = selectedGroup ? groupIndicators : indicators
            
            const filtered = indicatorsToFilter.filter(indicator =>
                indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                indicator.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                indicator.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredIndicators(filtered)
        } else {
            const filtered = indicatorGroups.filter(group =>
                group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredGroups(filtered)
        }
    }, [searchTerm, viewMode, indicators, indicatorGroups, selectedGroup, groupIndicators])

    // Obtenir les indicateurs disponibles (non sélectionnés)
    const getAvailableIndicators = () => {
        const selectedIds = localSelectedIndicators.map(ind => ind.id)
        return filteredIndicators.filter(ind => !selectedIds.includes(ind.id))
    }

    // Gestion des indicateurs par groupe
    const handleGroupSelect = async (group) => {
        setSelectedGroup(group)
        setViewMode('indicators')
        
        // Charger les indicateurs du groupe sélectionné
        await fetchGroupIndicators(group.id)
        
        // Mettre à jour le nom du groupe dans le composant parent
        if (onAddIndicator && typeof onAddIndicator === 'function') {
            // On peut passer le nom du groupe via une prop ou callback
            console.log('Groupe sélectionné:', group.name)
        }
    }

    // Gestion des actions sur les indicateurs
    const handleAddIndicator = (indicator) => {
        console.log('Ajout d\'indicateur:', indicator)
        
        // Mettre à jour l'état local
        const newSelectedIndicators = [...localSelectedIndicators, indicator]
        setLocalSelectedIndicators(newSelectedIndicators)
        
        // Appeler le callback du composant parent
        if (onAddIndicator && typeof onAddIndicator === 'function') {
            onAddIndicator(indicator)
        }
    }

    const handleRemoveIndicator = (indicator) => {
        console.log('Suppression d\'indicateur:', indicator)
        
        // Mettre à jour l'état local
        const newSelectedIndicators = localSelectedIndicators.filter(ind => ind.id !== indicator.id)
        setLocalSelectedIndicators(newSelectedIndicators)
        
        // Appeler le callback du composant parent
        if (onRemoveIndicator && typeof onRemoveIndicator === 'function') {
            onRemoveIndicator(indicator)
        }
    }

    const handleAddAll = () => {
        console.log('Ajout de tous les indicateurs disponibles')
        
        const availableIndicators = getAvailableIndicators()
        const newSelectedIndicators = [...localSelectedIndicators, ...availableIndicators]
        setLocalSelectedIndicators(newSelectedIndicators)
        
        // Appeler le callback du composant parent
        if (onAddAll && typeof onAddAll === 'function') {
            onAddAll()
        }
    }

    const handleRemoveAll = () => {
        console.log('Suppression de tous les indicateurs sélectionnés')
        
        // Vider l'état local
        setLocalSelectedIndicators([])
        
        // Appeler le callback du composant parent
        if (onRemoveAll && typeof onRemoveAll === 'function') {
            onRemoveAll()
        }
    }

    // Styles élégants
    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(8px)'
    }

    const contentStyle = {
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '95vw',
        maxWidth: '1400px',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    }

    const headerStyle = {
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }

    const titleStyle = {
        fontSize: '24px',
        fontWeight: '700',
        margin: 0
    }

    const subtitleStyle = {
        fontSize: '14px',
        opacity: 0.9,
        marginTop: '4px'
    }

    const searchContainerStyle = {
        padding: '24px 32px',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc'
    }

    const searchStyle = {
        display: 'flex',
        gap: '16px',
        alignItems: 'center'
    }

    const searchInputStyle = {
        flex: 1,
        padding: '12px 16px',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: '16px',
        transition: 'all 0.2s ease',
        backgroundColor: 'white'
    }

    const tabContainerStyle = {
        display: 'flex',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: 'white'
    }

    const tabStyle = {
        padding: '16px 24px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#64748b',
        borderBottom: '3px solid transparent',
        transition: 'all 0.2s ease'
    }

    const activeTabStyle = {
        ...tabStyle,
        color: '#1e293b',
        borderBottomColor: '#3b82f6'
    }

    const bodyStyle = {
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
    }

    const leftPanelStyle = {
        flex: 1,
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
    }

    const rightPanelStyle = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
    }

    const panelHeaderStyle = {
        padding: '16px 24px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        fontWeight: '600',
        color: '#374151',
        fontSize: '14px'
    }

    const listContainerStyle = {
        flex: 1,
        overflowY: 'auto',
        padding: '8px'
    }

    const itemStyle = {
        padding: '12px 16px',
        border: '1px solid #f1f5f9',
        borderRadius: '8px',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: 'white'
    }

    const itemHoverStyle = {
        borderColor: '#3b82f6',
        backgroundColor: '#f0f9ff',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
    }

    const itemSelectedStyle = {
        borderColor: '#10b981',
        backgroundColor: '#f0fdf4'
    }

    const itemTitleStyle = {
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: '4px'
    }

    const itemSubtitleStyle = {
        fontSize: '12px',
        color: '#64748b',
        marginBottom: '4px'
    }

    const itemDescriptionStyle = {
        fontSize: '12px',
        color: '#94a3b8',
        fontStyle: 'italic'
    }

    const itemTypeStyle = {
        display: 'inline-block',
        padding: '2px 8px',
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: '500',
        marginTop: '4px'
    }

    const actionButtonsStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        justifyContent: 'center',
        padding: '0 16px'
    }

    const actionButtonStyle = {
        padding: '8px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        backgroundColor: '#f8fafc',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease'
    }

    const actionButtonHoverStyle = {
        backgroundColor: '#e2e8f0',
        borderColor: '#94a3b8'
    }

    const footerStyle = {
        padding: '24px 32px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }

    const bulkActionStyle = {
        display: 'flex',
        gap: '12px'
    }

    const bulkButtonStyle = {
        padding: '12px 20px',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    }

    const addAllButtonStyle = {
        ...bulkButtonStyle,
        backgroundColor: '#10b981',
        color: 'white'
    }

    const removeAllButtonStyle = {
        ...bulkButtonStyle,
        backgroundColor: '#ef4444',
        color: 'white'
    }

    const closeButtonStyle = {
        padding: '12px 20px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        backgroundColor: 'white',
        color: '#374151',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    }

    if (loading) {
        return (
            <div style={modalStyle}>
                <div style={contentStyle}>
                    <div style={headerStyle}>
                        <div>
                            <h2 style={titleStyle}>Chargement des indicateurs...</h2>
                            <p style={subtitleStyle}>Récupération depuis DHIS2</p>
                        </div>
                    </div>
                    <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                        <p>Récupération des indicateurs et groupes depuis votre instance DHIS2...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div style={modalStyle}>
                <div style={contentStyle}>
                    <div style={headerStyle}>
                        <div>
                            <h2 style={titleStyle}>Erreur de connexion</h2>
                            <p style={subtitleStyle}>Impossible de récupérer les données depuis DHIS2</p>
                        </div>
                        <Button onClick={onClose} secondary>
                            <X size={20} />
                        </Button>
                    </div>
                    <div style={{ padding: '48px', textAlign: 'center', color: '#ef4444' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <h3 style={{ color: '#dc2626', marginBottom: '16px' }}>Erreur de connexion</h3>
                        <p style={{ color: '#991b1b', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px auto' }}>
                            {error}
                        </p>
                        <div style={{ 
                            backgroundColor: '#fef2f2', 
                            border: '1px solid #fecaca', 
                            borderRadius: '8px', 
                            padding: '16px',
                            maxWidth: '500px',
                            margin: '0 auto'
                        }}>
                            <h4 style={{ color: '#dc2626', marginBottom: '12px' }}>Solutions possibles :</h4>
                            <ul style={{ textAlign: 'left', color: '#991b1b', lineHeight: '1.6' }}>
                                <li>Vérifiez votre connexion internet</li>
                                <li>Vérifiez que votre instance DHIS2 est accessible</li>
                                <li>Vérifiez vos permissions d'accès à l'API</li>
                                <li>Contactez votre administrateur DHIS2</li>
                            </ul>
                        </div>
                        <div style={{ marginTop: '24px' }}>
                            <Button 
                                onClick={() => {
                                    setError(null)
                                    setLoading(true)
                                    fetchIndicators()
                                    fetchIndicatorGroups()
                                }} 
                                primary
                            >
                                Réessayer
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={headerStyle}>
                    <div>
                        <h2 style={titleStyle}>
                            {viewMode === 'indicators' ? 'Sélection d\'indicateurs' : 'Groupes d\'indicateurs'}
                        </h2>
                        <p style={subtitleStyle}>
                            {viewMode === 'indicators' 
                                ? selectedGroup 
                                    ? `Groupe : ${selectedGroup.name} • ${localSelectedIndicators.length} sélectionné(s)`
                                    : `Groupe : ${groupName} • ${localSelectedIndicators.length} sélectionné(s)`
                                : 'Choisissez un groupe d\'indicateurs'
                            }
                        </p>
                    </div>
                    <Button onClick={onClose} secondary>
                        <X size={20} />
                    </Button>
                </div>

                {/* Barre de recherche */}
                <div style={searchContainerStyle}>
                    <div style={searchStyle}>
                        <Search size={20} color="#64748b" />
                        <input
                            type="text"
                            placeholder={
                                viewMode === 'indicators' 
                                    ? "Rechercher des indicateurs par nom, description ou type..."
                                    : "Rechercher des groupes d'indicateurs..."
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={searchInputStyle}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#3b82f6'
                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                        <Filter size={20} color="#64748b" />
                    </div>
                </div>

                {/* Onglets */}
                <div style={tabContainerStyle}>
                    <button
                        style={viewMode === 'groups' ? activeTabStyle : tabStyle}
                        onClick={() => setViewMode('groups')}
                    >
                        <FolderOpen size={16} style={{ marginRight: '8px' }} />
                        Groupes d'indicateurs
                    </button>
                    <button
                        style={viewMode === 'indicators' ? activeTabStyle : tabStyle}
                        onClick={() => setViewMode('indicators')}
                    >
                        <BarChart3 size={16} style={{ marginRight: '8px' }} />
                        Indicateurs individuels
                    </button>
                </div>

                {/* Corps principal */}
                <div style={bodyStyle}>
                    {viewMode === 'groups' ? (
                        // Vue des groupes d'indicateurs
                        <div style={leftPanelStyle}>
                            <div style={panelHeaderStyle}>
                                Groupes disponibles ({filteredGroups.length})
                            </div>
                            <div style={listContainerStyle}>
                                {filteredGroups.map((group) => (
                                    <div
                                        key={group.id}
                                        style={{
                                            ...itemStyle,
                                            ...(selectedGroup?.id === group.id ? itemSelectedStyle : {}),
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.borderColor = itemHoverStyle.borderColor
                                            e.target.style.backgroundColor = itemHoverStyle.backgroundColor
                                            e.target.style.transform = itemHoverStyle.transform
                                            e.target.style.boxShadow = itemHoverStyle.boxShadow
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.borderColor = itemStyle.borderColor
                                            e.target.style.backgroundColor = itemStyle.backgroundColor
                                            e.target.style.transform = 'none'
                                            e.target.style.boxShadow = 'none'
                                        }}
                                        onClick={() => handleGroupSelect(group)}
                                    >
                                        <div style={itemTitleStyle}>{group.name}</div>
                                        <div style={itemDescriptionStyle}>{group.description}</div>
                                        <div style={itemTypeStyle}>
                                            {group.count} indicateur(s)
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Vue des indicateurs
                        <>
                            {/* Panel gauche - Indicateurs disponibles */}
                            <div style={leftPanelStyle}>
                                <div style={panelHeaderStyle}>
                                    Indicateurs disponibles ({getAvailableIndicators().length})
                                    {selectedGroup && (
                                        <span style={{ 
                                            marginLeft: '8px', 
                                            fontSize: '12px', 
                                            color: '#64748b',
                                            fontWeight: 'normal'
                                        }}>
                                            • Groupe : {selectedGroup.name}
                                        </span>
                                    )}
                                </div>
                                <div style={listContainerStyle}>
                                    {getAvailableIndicators().map((indicator) => (
                                        <div
                                            key={indicator.id}
                                            style={itemStyle}
                                            onMouseEnter={(e) => {
                                                e.target.style.borderColor = itemHoverStyle.borderColor
                                                e.target.style.backgroundColor = itemHoverStyle.backgroundColor
                                                e.target.style.transform = itemHoverStyle.transform
                                                e.target.style.boxShadow = itemHoverStyle.boxShadow
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.borderColor = itemStyle.borderColor
                                                e.target.style.backgroundColor = itemStyle.backgroundColor
                                                e.target.style.transform = 'none'
                                                e.target.style.boxShadow = 'none'
                                            }}
                                            onClick={() => handleAddIndicator(indicator)}
                                        >
                                            <div style={itemTitleStyle}>{indicator.shortName}</div>
                                            <div style={itemSubtitleStyle}>{indicator.name}</div>
                                            <div style={itemDescriptionStyle}>{indicator.description}</div>
                                            <div style={itemTypeStyle}>{indicator.type}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div style={actionButtonsStyle}>
                                <button
                                    style={actionButtonStyle}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = actionButtonHoverStyle.backgroundColor
                                        e.target.style.borderColor = actionButtonHoverStyle.borderColor
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = actionButtonStyle.backgroundColor
                                        e.target.style.borderColor = actionButtonStyle.borderColor
                                    }}
                                    onClick={handleAddAll}
                                    title="Ajouter tous les indicateurs disponibles"
                                >
                                    <ChevronRight size={16} />
                                </button>
                                <button
                                    style={actionButtonStyle}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = actionButtonHoverStyle.backgroundColor
                                        e.target.style.borderColor = actionButtonHoverStyle.borderColor
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = actionButtonStyle.backgroundColor
                                        e.target.style.borderColor = actionButtonStyle.borderColor
                                    }}
                                    onClick={handleRemoveAll}
                                    title="Supprimer tous les indicateurs sélectionnés"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                            </div>

                            {/* Panel droit - Indicateurs sélectionnés */}
                            <div style={rightPanelStyle}>
                                <div style={panelHeaderStyle}>
                                    Indicateurs sélectionnés ({localSelectedIndicators.length})
                                </div>
                                <div style={listContainerStyle}>
                                    {localSelectedIndicators.map((indicator) => (
                                        <div
                                            key={indicator.id}
                                            style={{
                                                ...itemStyle,
                                                ...itemSelectedStyle
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.borderColor = '#ef4444'
                                                e.target.style.backgroundColor = '#fef2f2'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.borderColor = itemSelectedStyle.borderColor
                                                e.target.style.backgroundColor = itemSelectedStyle.backgroundColor
                                            }}
                                            onClick={() => handleRemoveIndicator(indicator)}
                                        >
                                            <div style={itemTitleStyle}>{indicator.shortName}</div>
                                            <div style={itemSubtitleStyle}>{indicator.name}</div>
                                            <div style={itemDescriptionStyle}>{indicator.description}</div>
                                            <div style={itemTypeStyle}>{indicator.type}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer avec actions en masse */}
                <div style={footerStyle}>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>
                        {viewMode === 'indicators' && (
                            <>
                                <strong>{localSelectedIndicators.length}</strong> indicateur(s) sélectionné(s) • 
                                <strong>{getAvailableIndicators().length}</strong> disponible(s)
                            </>
                        )}
                    </div>
                    
                    {viewMode === 'indicators' && (
                        <div style={bulkActionStyle}>
                            <button style={addAllButtonStyle} onClick={handleAddAll}>
                                <Plus size={16} />
                                ASSIGNER TOUT ({getAvailableIndicators().length})
                            </button>
                            <button style={removeAllButtonStyle} onClick={handleRemoveAll}>
                                <X size={16} />
                                SUPPRIMER TOUT ({localSelectedIndicators.length})
                            </button>
                        </div>
                    )}
                    
                    <button style={closeButtonStyle} onClick={onClose}>
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BulletinIndicators
