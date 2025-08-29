import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'

const BullOrgUnit = ({ config, setConfig }) => {
    const [expandedOrgUnits, setExpandedOrgUnits] = useState([])
    const [orgUnitsData, setOrgUnitsData] = useState([])
    const [loadingOrgUnits, setLoadingOrgUnits] = useState(true)
    const [orgUnitsError, setOrgUnitsError] = useState(null)
    const [orgUnitSearchTerm, setOrgUnitSearchTerm] = useState('')

    // Charger les unités d'organisation depuis DHIS2
    useEffect(() => {
        loadOrganisationUnits()
    }, [])

    const loadOrganisationUnits = async () => {
        try {
            setLoadingOrgUnits(true)
            setOrgUnitsError(null)
            
            // Appel API pour récupérer les unités d'organisation
            const response = await fetch('/api/organisationUnits?fields=id,name,level,parent&paging=false')
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }
            
            const data = await response.json()
            console.log('Unités d\'organisation chargées:', data)
            
            // Organiser les unités d'organisation en hiérarchie
            const organizedUnits = organizeOrgUnitsHierarchy(data.organisationUnits || [])
            setOrgUnitsData(organizedUnits)
            
        } catch (error) {
            console.error('Erreur lors du chargement des unités d\'organisation:', error)
            setOrgUnitsError(error.message)
        } finally {
            setLoadingOrgUnits(false)
        }
    }

    const organizeOrgUnitsHierarchy = (units) => {
        // Créer un map pour un accès rapide par ID
        const unitsMap = new Map()
        units.forEach(unit => {
            unitsMap.set(unit.id, {
                ...unit,
                children: []
            })
        })

        // Organiser la hiérarchie
        const rootUnits = []
        units.forEach(unit => {
            if (unit.parent) {
                const parent = unitsMap.get(unit.parent.id)
                if (parent) {
                    parent.children.push(unitsMap.get(unit.id))
                }
            } else {
                rootUnits.push(unitsMap.get(unit.id))
            }
        })

        return rootUnits
    }

    // Fonction pour filtrer les unités d'organisation selon la recherche
    const filterOrgUnits = (units, searchTerm) => {
        if (!searchTerm.trim()) return units

        const filtered = []
        units.forEach(unit => {
            const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase())
            const children = unit.children && unit.children.length > 0 
                ? filterOrgUnits(unit.children, searchTerm) 
                : []
            
            if (matchesSearch || children.length > 0) {
                filtered.push({
                    ...unit,
                    children: children
                })
            }
        })
        
        return filtered
    }

    // Unités d'organisation filtrées selon la recherche
    const filteredOrgUnits = filterOrgUnits(orgUnitsData, orgUnitSearchTerm)

    // Fonctions pour gérer les unités d'organisation
    const isOrgUnitSelected = (unitId) => {
        return config.selectedOrgUnits?.includes(unitId) || false
    }

    // Fonction pour déterminer l'état de sélection d'une unité
    const getOrgUnitSelectionState = (unit) => {
        const currentSelected = config.selectedOrgUnits || []
        
        // Vérifier si l'unité elle-même est sélectionnée
        const isSelected = currentSelected.includes(unit.id)
        
        // Compter les enfants sélectionnés
        const countSelectedChildren = (children) => {
            let count = 0
            children.forEach(child => {
                if (currentSelected.includes(child.id)) count++
                if (child.children && child.children.length > 0) {
                    count += countSelectedChildren(child.children)
                }
            })
            return count
        }
        
        // Compter tous les enfants
        const countAllChildren = (children) => {
            let count = 0
            children.forEach(child => {
                count++
                if (child.children && child.children.length > 0) {
                    count += countAllChildren(child.children)
                }
            })
            return count
        }
        
        if (!unit.children || unit.children.length === 0) {
            // Pas d'enfants, état simple
            return isSelected ? 'selected' : 'unselected'
        }
        
        const selectedChildren = countSelectedChildren(unit.children)
        const totalChildren = countAllChildren(unit.children)
        
        if (isSelected && selectedChildren === totalChildren) {
            return 'selected' // Tous sélectionnés
        } else if (selectedChildren === 0) {
            return 'unselected' // Aucun sélectionné
        } else {
            return 'partial' // Partiellement sélectionné
        }
    }

    const toggleOrgUnit = (unitId, checked) => {
        const currentSelected = config.selectedOrgUnits || []
        console.log('toggleOrgUnit appelé:', { unitId, checked, currentSelected })
        
        let newSelected
        
        if (checked) {
            newSelected = [...currentSelected, unitId]
        } else {
            newSelected = currentSelected.filter(id => id !== unitId)
        }
        
        console.log('Nouvelle sélection:', newSelected)
        setConfig({ ...config, selectedOrgUnits: newSelected })
    }

    // Fonction pour sélectionner tous les enfants d'un parent
    const selectAllChildren = (unitId) => {
        const currentSelected = config.selectedOrgUnits || []
        
        const getAllChildrenIds = (unit) => {
            let ids = []
            if (unit.children && unit.children.length > 0) {
                unit.children.forEach(child => {
                    ids.push(child.id)
                    ids = [...ids, ...getAllChildrenIds(child)]
                })
            }
            return ids
        }
        
        // Trouver l'unité dans les données
        const findUnit = (units, targetId) => {
            for (const unit of units) {
                if (unit.id === targetId) return unit
                if (unit.children && unit.children.length > 0) {
                    const found = findUnit(unit.children, targetId)
                    if (found) return found
                }
            }
            return null
        }
        
        const unit = findUnit(orgUnitsData, unitId)
        if (unit && unit.children && unit.children.length > 0) {
            const allChildrenIds = getAllChildrenIds(unit)
            const newSelected = [...new Set([...currentSelected, ...allChildrenIds])]
            setConfig({ ...config, selectedOrgUnits: newSelected })
        }
    }

    // Fonction pour désélectionner tous les enfants d'un parent
    const deselectAllChildren = (unitId) => {
        const currentSelected = config.selectedOrgUnits || []
        
        const getAllChildrenIds = (unit) => {
            let ids = []
            if (unit.children && unit.children.length > 0) {
                unit.children.forEach(child => {
                    ids.push(child.id)
                    ids = [...ids, ...getAllChildrenIds(child)]
                })
            }
            return ids
        }
        
        // Trouver l'unité dans les données
        const findUnit = (units, targetId) => {
            for (const unit of units) {
                if (unit.id === targetId) return unit
                if (unit.children && unit.children.length > 0) {
                    const found = findUnit(unit.children, targetId)
                    if (found) return found
                }
            }
            return null
        }
        
        const unit = findUnit(orgUnitsData, unitId)
        if (unit && unit.children && unit.children.length > 0) {
            const allChildrenIds = getAllChildrenIds(unit)
            const newSelected = currentSelected.filter(id => !allChildrenIds.includes(id))
            setConfig({ ...config, selectedOrgUnits: newSelected })
        }
    }

    const toggleOrgUnitExpansion = (unitId) => {
        setExpandedOrgUnits(prev => 
            prev.includes(unitId) 
                ? prev.filter(id => id !== unitId)
                : [...prev, unitId]
        )
    }

    const selectAllOrgUnits = () => {
        const getAllUnitIds = (units) => {
            let ids = []
            units.forEach(unit => {
                ids.push(unit.id)
                if (unit.children && unit.children.length > 0) {
                    ids = [...ids, ...getAllUnitIds(unit.children)]
                }
            })
            return ids
        }
        
        const allIds = getAllUnitIds(orgUnitsData)
        setConfig({ ...config, selectedOrgUnits: allIds })
    }

    const deselectAllOrgUnits = () => {
        setConfig({ ...config, selectedOrgUnits: [] })
    }

    const selectByLevel = (level) => {
        if (!level) return
        
        const getUnitsByLevel = (units, targetLevel) => {
            let result = []
            units.forEach(unit => {
                if (unit.level === targetLevel) {
                    result.push(unit.id)
                }
                if (unit.children && unit.children.length > 0) {
                    result = [...result, ...getUnitsByLevel(unit.children, targetLevel)]
                }
            })
            return result
        }
        
        const levelMap = {
            'national': 1,
            'regional': 2,
            'district': 3,
            'facility': 4
        }
        
        const targetLevel = levelMap[level]
        if (targetLevel) {
            const levelUnits = getUnitsByLevel(orgUnitsData, targetLevel)
            const currentSelected = config.selectedOrgUnits || []
            const newSelected = [...new Set([...currentSelected, ...levelUnits])]
            console.log('Sélection par niveau:', { level, targetLevel, levelUnits, newSelected })
            setConfig({ ...config, selectedOrgUnits: newSelected })
        }
    }

    const deselectByLevel = (level) => {
        if (!level) return
        
        const getUnitsByLevel = (units, targetLevel) => {
            let result = []
            units.forEach(unit => {
                if (unit.level === targetLevel) {
                    result.push(unit.id)
                }
                if (unit.children && unit.children.length > 0) {
                    result = [...result, ...getUnitsByLevel(unit.children, targetLevel)]
                }
            })
            return result
        }
        
        const levelMap = {
            'national': 1,
            'regional': 2,
            'district': 3,
            'facility': 4
        }
        
        const targetLevel = levelMap[level]
        if (targetLevel) {
            const levelUnits = getUnitsByLevel(orgUnitsData, targetLevel)
            const currentSelected = config.selectedOrgUnits || []
            const newSelected = currentSelected.filter(id => !levelUnits.includes(id))
            console.log('Désélection par niveau:', { level, targetLevel, levelUnits, newSelected })
            setConfig({ ...config, selectedOrgUnits: newSelected })
        }
    }

    const selectByGroup = (group) => {
        if (!group) return
        
        // Pour l'instant, on utilise les niveaux comme groupes
        const groupLevelMap = {
            'districts': 3,
            'regions': 2,
            'facilities': 4,
            'communities': 5
        }
        
        const targetLevel = groupLevelMap[group]
        if (targetLevel) {
            selectByLevel(Object.keys(groupLevelMap).find(key => groupLevelMap[key] === targetLevel))
        }
    }

    const deselectByGroup = (group) => {
        if (!group) return
        
        const groupLevelMap = {
            'districts': 3,
            'regions': 2,
            'facilities': 4,
            'communities': 5
        }
        
        const targetLevel = groupLevelMap[group]
        if (targetLevel) {
            deselectByLevel(Object.keys(groupLevelMap).find(key => groupLevelMap[key] === targetLevel))
        }
    }

    // Composant récursif pour afficher l'arborescence des unités d'organisation
    const OrgUnitTree = ({ units, level = 0 }) => {
        return units.map(unit => {
            const selectionState = getOrgUnitSelectionState(unit)
            const hasChildren = unit.children && unit.children.length > 0
            
            return (
                <div key={unit.id} style={orgUnitItemStyle}>
                    <div style={{
                        ...orgUnitHeaderStyle,
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                checked={selectionState === 'selected'}
                                ref={(input) => {
                                    if (input) {
                                        input.indeterminate = selectionState === 'partial'
                                    }
                                }}
                                onChange={(e) => toggleOrgUnit(unit.id, e.target.checked)}
                                style={{ 
                                    margin: '0 8px 0 0',
                                    accentColor: selectionState === 'partial' ? '#f97316' : undefined
                                }}
                            />
                            {hasChildren && (
                                <span 
                                    style={{ cursor: 'pointer' }} 
                                    onClick={() => toggleOrgUnitExpansion(unit.id)}
                                >
                                    {expandedOrgUnits.includes(unit.id) ? '▼' : '▶'}
                                </span>
                            )}
                            <span style={{ 
                                marginLeft: hasChildren ? '8px' : '0', 
                                fontWeight: level === 0 ? '500' : 'normal',
                                fontSize: level === 0 ? '14px' : '13px',
                                color: selectionState === 'partial' ? '#f97316' : 
                                       selectionState === 'selected' ? '#059669' : '#374151'
                            }}>
                                {unit.name} {hasChildren && `(${unit.children.length})`}
                            </span>
                        </div>
                        
                        {/* Boutons de sélection des enfants pour les unités parent */}
                        {hasChildren && (
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                    onClick={() => selectAllChildren(unit.id)}
                                    style={{
                                        padding: '4px 8px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '3px',
                                        backgroundColor: '#f0fdf4',
                                        color: '#059669',
                                        fontSize: '10px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                    title="Sélectionner tous les enfants"
                                >
                                    Sélectionner enfants
                                </button>
                                <button
                                    onClick={() => deselectAllChildren(unit.id)}
                                    style={{
                                        padding: '4px 8px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '3px',
                                        backgroundColor: '#fef2f2',
                                        color: '#dc2626',
                                        fontSize: '10px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                    title="Désélectionner tous les enfants"
                                >
                                    Désélectionner enfants
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {hasChildren && expandedOrgUnits.includes(unit.id) && (
                        <div style={{ marginLeft: '24px' }}>
                            <OrgUnitTree units={unit.children} level={level + 1} />
                        </div>
                    )}
                </div>
            )
        })
    }

    // Styles pour la section d'unités d'organisation
    const orgUnitItemStyle = {
        marginBottom: '4px',
        padding: '8px 0',
        borderBottom: '1px dashed #e2e8f0'
    }

    const orgUnitHeaderStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        padding: '4px 0'
    }

    const formGroupStyle = {
        marginBottom: '24px'
    }

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500',
        color: '#374151',
        fontSize: '14px'
    }

    return (
        <div>
            <div style={formGroupStyle}>
                <label style={labelStyle}>Sélectionner les unités d'organisation</label>
                
                {/* Interface de sélection des unités d'organisation */}
                <div style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: 'white'
                }}>
                    {/* Header avec titre et compteur */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '12px 16px',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h4 style={{ 
                                    fontSize: '14px', 
                                    fontWeight: '600', 
                                    color: '#374151',
                                    margin: 0
                                }}>
                                    Filtrage des unités d'organisation par nom
                                </h4>
                                <p style={{ 
                                    fontSize: '12px', 
                                    color: '#6b7280',
                                    margin: '4px 0 0 0'
                                }}>
                                    {config.selectedOrgUnits?.length || 0} Unité(s) d'organisation sélectionnée(s)
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => selectAllOrgUnits()}
                                    style={{
                                        padding: '6px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        backgroundColor: '#f8fafc',
                                        color: '#374151',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    SÉLECTIONNER TOUT
                                </button>
                                <button
                                    onClick={() => deselectAllOrgUnits()}
                                    style={{
                                        padding: '6px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        backgroundColor: '#f8fafc',
                                        color: '#374151',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    DÉSÉLECTIONNER TOUT
                                </button>
                            </div>
                        </div>

                        {/* Barre de recherche */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{
                                position: 'relative',
                                flex: 1
                            }}>
                                <input
                                    type="text"
                                    placeholder="Rechercher une unité d'organisation..."
                                    value={orgUnitSearchTerm}
                                    onChange={(e) => setOrgUnitSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px 8px 36px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        backgroundColor: 'white',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <Search 
                                    size={16} 
                                    style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#6b7280'
                                    }}
                                />
                            </div>
                            {orgUnitSearchTerm && (
                                <button
                                    onClick={() => setOrgUnitSearchTerm('')}
                                    style={{
                                        padding: '8px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        backgroundColor: '#f8fafc',
                                        color: '#6b7280',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    title="Effacer la recherche"
                                >
                                    &times;
                                </button>
                            )}
                        </div>

                        {/* Indicateur de recherche */}
                        {orgUnitSearchTerm && (
                            <div style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span>
                                    Recherche : &quot;{orgUnitSearchTerm}&quot;
                                </span>
                                <span>
                                    • {filteredOrgUnits.length} résultat(s) trouvé(s)
                                </span>
                            </div>
                        )}


                    </div>

                    {/* Zone de contenu avec arborescence */}
                    <div style={{
                        height: '300px',
                        overflow: 'auto',
                        padding: '8px 0'
                    }}>
                        {loadingOrgUnits ? (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '200px',
                                color: '#6b7280',
                                fontSize: '14px'
                            }}>
                                Chargement des unités d'organisation...
                            </div>
                        ) : orgUnitsError ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '200px',
                                color: '#ef4444',
                                fontSize: '14px',
                                textAlign: 'center',
                                padding: '20px'
                            }}>
                                <div style={{ marginBottom: '12px' }}>
                                    Erreur lors du chargement des unités d'organisation
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
                                    {orgUnitsError}
                                </div>
                                <button
                                    onClick={loadOrganisationUnits}
                                    style={{
                                        padding: '8px 16px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        backgroundColor: '#f8fafc',
                                        color: '#374151',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Réessayer
                                </button>
                            </div>
                        ) : orgUnitsData.length === 0 ? (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '200px',
                                color: '#6b7280',
                                fontSize: '14px'
                            }}>
                                Aucune unité d'organisation trouvée
                            </div>
                        ) : (
                            <OrgUnitTree units={filteredOrgUnits} />
                        )}
                    </div>
                </div>
            </div>

            {/* Contrôles de niveau d'organisation */}
            <div style={formGroupStyle}>
                <label style={labelStyle}>Niveau d'unité d'organisation</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                        value={config.orgUnitLevel || ''}
                        onChange={(e) => setConfig({ ...config, orgUnitLevel: e.target.value })}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="">Sélectionner le niveau...</option>
                        <option value="national">National</option>
                        <option value="regional">Régional</option>
                        <option value="district">District</option>
                        <option value="facility">Établissement</option>
                    </select>
                    <button
                        onClick={() => selectByLevel(config.orgUnitLevel)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            backgroundColor: '#f8fafc',
                            color: '#374151',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        SÉLECTIONNER
                    </button>
                    <button
                        onClick={() => deselectByLevel(config.orgUnitLevel)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            backgroundColor: '#f8fafc',
                            color: '#374151',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        DÉSÉLECTIONNER
                    </button>
                </div>
            </div>

            {/* Groupe d'unités d'organisation */}
            <div style={formGroupStyle}>
                <label style={labelStyle}>Groupe d'Unités d'Organisation</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                        value={config.orgUnitGroup || ''}
                        onChange={(e) => setConfig({ ...config, orgUnitGroup: e.target.value })}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="">Sélectionner le groupe...</option>
                        <option value="districts">Districts</option>
                        <option value="regions">Régions</option>
                        <option value="facilities">Établissements</option>
                        <option value="communities">Communautés</option>
                    </select>
                    <button
                        onClick={() => selectByGroup(config.orgUnitGroup)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            backgroundColor: '#f8fafc',
                            color: '#374151',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        SÉLECTIONNER
                    </button>
                    <button
                        onClick={() => deselectByGroup(config.orgUnitGroup)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            backgroundColor: '#f8fafc',
                            color: '#374151',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        DÉSÉLECTIONNER
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BullOrgUnit
