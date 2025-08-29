import React, { useState, useEffect } from 'react'
import { Button, Card, InputField, Checkbox, SingleSelect, MultiSelect, NoticeBox } from '@dhis2/ui'
import { Save, Plus, Settings, BarChart3, Clock, Trash2, ChevronRight, ChevronLeft, Search } from 'lucide-react'
import BullOrgUnit from './BullOrgUnit'

const BulletinConfig = () => {
    const [config, setConfig] = useState({
        name: '',
        diseases: [],
        period: '',
        template: '',
        indicators: [],
        favorites: [],
        orgUnits: [],
        autoGenerate: false,
        program: '',
        coverTitle: '',
        periodicity: '',
        sections: [],
        selectedOrgUnits: []
    })
    const [saveStatus, setSaveStatus] = useState(null)
    const [showNewProgramModal, setShowNewProgramModal] = useState(false)
    const [newProgramName, setNewProgramName] = useState('')
    const [showIndicatorSelector, setShowIndicatorSelector] = useState(false)
    const [currentSubsection, setCurrentSubsection] = useState(null)
    const [currentIndicatorGroup, setCurrentIndicatorGroup] = useState(null)
    const [indicatorSearch, setIndicatorSearch] = useState('')

    // Données de test - Options de programmes
    const PROGRAM_OPTIONS = [
        { value: "PEV", label: "Programme élargie de vaccination" },
        { value: "PNLT", label: "Programme national de lutte contre la tuberculose" },
        { value: "PNN", label: "Programme national de nutrition" },
        { value: "PNLS", label: "Programme national de lutte contre le SIDA" },
        { value: "INHP", label: "Programme national de l'hygiène publique" },
        { value: "PNSME", label: "Programme national de santé mère et enfant" },
    ]
      
    const PERIOD_OPTIONS = [
        { value: "WEEKLY", label: "Hebdomadaire" },
        { value: "BIWEEKLY", label: "Bimensuel" },
        { value: "MONTHLY", label: "Mensuel" },
        { value: "YEARLY", label: "Annuel" },
    ]

    // Options de présentation pour les sous-rubriques
    const PRESENTATIONS = [
        { value: "table", label: "Tableau" },
        { value: "chart", label: "Graphique" },
        { value: "map", label: "Carte" },
        { value: "val", label: "Valeur" },
        { value: "text", label: "Texte" }
    ]

    // Données d'indicateurs simulées (comme dans l'image DHIS2)
    const AVAILABLE_INDICATORS = [
        { id: 'ind_001', name: 'CoD - Percentage of AIDS, 0 - 4' },
        { id: 'ind_002', name: 'CoD - Percentage of AIDS, 15 - 49' },
        { id: 'ind_003', name: 'CoD - Percentage of AIDS, 5 - 14' },
        { id: 'ind_004', name: 'CoD - Percentage of AIDS, 50+' },
        { id: 'ind_005', name: 'CoD - Percentage of Malaria deaths, 0-6 days' },
        { id: 'ind_006', name: 'CoD - Percentage of Malaria deaths, 1 - 4 yrs' },
        { id: 'ind_007', name: 'CoD - Percentage of Malaria deaths, 15+ yrs' },
        { id: 'ind_008', name: 'CoD - Percentage of Malaria deaths, 28-365 days' },
        { id: 'ind_009', name: 'CoD - Percentage of Malaria deaths, 5 - 14 yrs' },
        { id: 'ind_010', name: 'CoD - Percentage of Malaria deaths, 7-27 days' },
        { id: 'ind_011', name: 'CoD - Percentage of TB, AIDS (from all causes of death), 15-24' },
        { id: 'ind_012', name: 'PEV - BCG Coverage' },
        { id: 'ind_013', name: 'PEV - DPT3 Coverage' },
        { id: 'ind_014', name: 'PEV - Measles Coverage' },
        { id: 'ind_015', name: 'PEV - Polio Coverage' },
        { id: 'ind_016', name: 'PEV - Yellow Fever Coverage' },
        { id: 'ind_017', name: 'PNLT - TB Case Detection Rate' },
        { id: 'ind_018', name: 'PNLT - TB Treatment Success Rate' },
        { id: 'ind_019', name: 'PNN - Malnutrition Rate' },
        { id: 'ind_020', name: 'PNLS - HIV Testing Rate' }
    ]

    const handleSave = async () => {
        try {
            console.log('Sauvegarde de la configuration:', config)
            
            // Générer une clé unique basée sur le programme et la date/heure actuelle
            const now = new Date()
            const dateStr = now.toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: '2-digit' 
            }).replace(/\//g, '-')
            const timeStr = now.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }).replace(/:/g, '')
            
            const programKey = config.program || 'DEFAULT'
            const uniqueKey = `${programKey}${dateStr}${timeStr}`
            
            console.log('Clé unique générée:', uniqueKey)
            
            // Préparer les données à sauvegarder
            const bulletinConfig = {
                id: uniqueKey,
                name: `Configuration ${programKey} - ${dateStr} ${timeStr}`,
                description: 'Configuration pour la génération automatique des bulletins de santé',
                data: {
                    ...config,
                    lastModified: now.toISOString(),
                    version: '1.0',
                    key: uniqueKey,
                    program: config.program,
                    createdDate: now.toISOString()
                }
            }
            
            // Créer ou mettre à jour le datastore dans DHIS2 avec la clé unique
            const response = await fetch(`/api/dataStore/GENERATE-BULLETIN/${uniqueKey}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bulletinConfig.data)
            })
            
            if (response.ok) {
                console.log('Configuration sauvegardée dans le datastore DHIS2 avec la clé:', uniqueKey)
                setSaveStatus({ 
                    type: 'success', 
                    message: `Configuration sauvegardée avec succès dans le datastore DHIS2 (GENERATE-BULLETIN/${uniqueKey})` 
                })
            } else {
                const errorData = await response.json()
                console.error('Erreur lors de la sauvegarde:', errorData)
                setSaveStatus({ 
                    type: 'error', 
                    message: `Erreur lors de la sauvegarde: ${errorData.message || response.statusText}` 
                })
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error)
            setSaveStatus({ 
                type: 'error', 
                message: `Erreur de connexion: ${error.message}` 
            })
        }
    }

    const handleDiseaseChange = (diseaseValue, checked) => {
        if (checked) {
            setConfig({ ...config, diseases: [...config.diseases, diseaseValue] })
        } else {
            setConfig({ ...config, diseases: config.diseases.filter(d => d !== diseaseValue) })
        }
    }

    const handleAddNewProgram = () => {
        if (newProgramName.trim()) {
            const newProgram = {
                value: newProgramName.toLowerCase().replace(/\s+/g, '_'),
                label: newProgramName.trim()
            }
            PROGRAM_OPTIONS.push(newProgram)
            setConfig({ ...config, program: newProgram.value })
            setNewProgramName('')
            setShowNewProgramModal(false)
        }
    }

    // Fonctions pour gérer les sections
    const addSection = () => {
        const newSection = { 
            id: crypto.randomUUID(), 
            title: "Nouvelle rubrique", 
            subsections: [] 
        }
        setConfig({ ...config, sections: [...(config.sections || []), newSection] })
    }

    const updateSection = (id, patch) => {
        setConfig({ 
            ...config, 
            sections: (config.sections || []).map((s) => (s.id === id ? patch : s)) 
        })
    }

    const removeSection = (id) => {
        setConfig({ 
            ...config, 
            sections: (config.sections || []).filter((s) => s.id !== id) 
        })
    }

    // Fonctions pour le sélecteur d'indicateurs
    const openIndicatorSelector = (subsection, group) => {
        setCurrentSubsection(subsection)
        setCurrentIndicatorGroup(group)
        setShowIndicatorSelector(true)
        setIndicatorSearch('')
    }

    const closeIndicatorSelector = () => {
        setShowIndicatorSelector(false)
        setCurrentSubsection(null)
        setCurrentIndicatorGroup(null)
        setIndicatorSearch('')
    }

    const getSelectedIndicators = () => {
        if (!currentIndicatorGroup) return []
        return currentIndicatorGroup.selectedIndicators || []
    }

    const getAvailableIndicators = () => {
        const selectedIds = getSelectedIndicators().map(ind => ind.id)
        return AVAILABLE_INDICATORS.filter(ind => 
            !selectedIds.includes(ind.id) && 
            ind.name.toLowerCase().includes(indicatorSearch.toLowerCase())
        )
    }

    const addIndicator = (indicator) => {
        if (!currentIndicatorGroup) return
        
        const updatedIndicators = [...getSelectedIndicators(), indicator]
        updateIndicatorGroupIndicators(updatedIndicators)
    }

    const removeIndicator = (indicator) => {
        if (!currentIndicatorGroup) return
        
        const updatedIndicators = getSelectedIndicators().filter(ind => ind.id !== indicator.id)
        updateIndicatorGroupIndicators(updatedIndicators)
    }

    const addAllIndicators = () => {
        if (!currentIndicatorGroup) return
        
        const available = getAvailableIndicators()
        const updatedIndicators = [...getSelectedIndicators(), ...available]
        updateIndicatorGroupIndicators(updatedIndicators)
    }

    const removeAllIndicators = () => {
        if (!currentIndicatorGroup) return
        updateIndicatorGroupIndicators([])
    }

    const updateIndicatorGroupIndicators = (indicators) => {
        if (!currentIndicatorGroup || !currentSubsection) return

        // Trouver la section et sous-section correspondantes
        const updatedSections = (config.sections || []).map(section => ({
            ...section,
            subsections: (section.subsections || []).map(subsection => {
                if (subsection.id === currentSubsection.id) {
                    return {
                        ...subsection,
                        indicatorGroups: (subsection.indicatorGroups || []).map(group => 
                            group.id === currentIndicatorGroup.id 
                                ? { ...group, selectedIndicators: indicators }
                                : group
                        )
                    }
                }
                return subsection
            })
        }))

        setConfig({ ...config, sections: updatedSections })
        
        // Mettre à jour currentIndicatorGroup
        const updatedGroup = updatedSections
            .flatMap(s => s.subsections)
            .flatMap(sub => sub.indicatorGroups || [])
            .find(group => group.id === currentIndicatorGroup.id)
        setCurrentIndicatorGroup(updatedGroup)
    }
    
    const templates = [
        { value: 'standard', label: 'Standard' },
        { value: 'detailed', label: 'Détaillé' },
        { value: 'summary', label: 'Résumé' }
    ]

    // Styles inline
    const containerStyle = {
        maxWidth: '1200px',
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
        padding: '32px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
    }

    const sectionHeaderStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #f1f5f9',
        color: '#1e293b',
        fontSize: '20px',
        fontWeight: '600'
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

    const buttonStyle = {
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(249, 115, 22, 0.2)'
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
        width: '480px',
        maxWidth: '90vw',
        boxShadow: '0 20px 25px rgba(0,0,0,0.1)'
    }

    const sectionCardStyle = {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }

    const subsectionCardStyle = {
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        border: '1px solid #e2e8f0'
    }

    const badgeStyle = {
        backgroundColor: '#f1f5f9',
        color: '#64748b',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500'
    }

    const inputStyle = {
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        width: '100%',
        boxSizing: 'border-box'
    }

    const selectStyle = {
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        backgroundColor: 'white',
        minWidth: '120px'
    }

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                            Configuration du Bulletin
                        </h1>
                        <p style={{ opacity: 0.9, fontSize: '16px' }}>
                            Configurez les paramètres de votre bulletin
                        </p>
                    </div>
                    <Button 
                        primary 
                        onClick={handleSave} 
                        icon={<Save size={18} />}
                        disabled={!config.program || !config.coverTitle}
                    >
                        Sauvegarder la configuration
                    </Button>
                </div>
            </div>

            {saveStatus && (
                <div style={{ marginBottom: '24px' }}>
                    <NoticeBox 
                        title={saveStatus.message}
                        valid={saveStatus.type === 'success'}
                        error={saveStatus.type === 'error'}
                        info={saveStatus.type === 'info'}
                    />
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* Configuration de base */}
                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>
                        <Settings size={24} color="#f97316" />
                        Configuration de base
                    </div>
                    
                    <div style={formGroupStyle}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Programme de surveillance</label>
                                
                                {/* Version alternative avec select HTML natif */}
                                <select
                                    value={config.program}
                                    onChange={(e) => {
                                        console.log('Programme sélectionné (HTML):', e.target.value)
                                        setConfig({ ...config, program: e.target.value })
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="">Sélectionner le programme...</option>
                                    {PROGRAM_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                
                                {/* Debug: Afficher les options disponibles */}
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                    Options disponibles: {PROGRAM_OPTIONS.length} programmes
                                </div>
                            </div>
                            <Button
                                secondary
                                small
                                icon={<Plus size={16} />}
                                onClick={() => setShowNewProgramModal(true)}
                                style={{ marginBottom: '4px' }}
                            >
                                Nouveau
                            </Button>
                        </div>
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Titre de la page de garde</label>
                        <InputField
                            value={config.coverTitle}
                            onChange={({ value }) => setConfig({ ...config, coverTitle: value })}
                            placeholder="Ex: Bulletin de surveillance PEV - Semaine 15, 2024"
                        />
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Périodicité de génération</label>
                        
                        {/* Version alternative avec select HTML natif */}
                        <select
                            value={config.periodicity}
                            onChange={(e) => {
                                console.log('Périodicité sélectionnée (HTML):', e.target.value)
                                setConfig({ ...config, periodicity: e.target.value })
                            }}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="">Sélectionner la périodicité...</option>
                            {PERIOD_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        
                        {/* Debug: Afficher les options disponibles */}
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            Options disponibles: {PERIOD_OPTIONS.length} périodicités
                        </div>
                    </div>

                    {/* Options d'automatisation déplacées ici */}
                    <div style={formGroupStyle}>
                        <Checkbox
                            label="Génération automatique des bulletins"
                            checked={config.autoGenerate}
                            onChange={({ checked }) => setConfig({ ...config, autoGenerate: checked })}
                        />
                    </div>
                    
                    {config.autoGenerate && (
                        <div style={{
                            marginLeft: '24px',
                            padding: '20px',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '8px',
                            border: '1px solid #bbf7d0'
                        }}>
                            <p style={{ color: '#166534', marginBottom: '16px', fontWeight: '500' }}>
                                Le bulletin sera généré automatiquement selon la fréquence sélectionnée.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                <div style={{ fontSize: '14px', color: '#15803d' }}>
                                    <strong>• Hebdomadaire:</strong> chaque lundi à 8h00
                                </div>
                                <div style={{ fontSize: '14px', color: '#15803d' }}>
                                    <strong>• Mensuel:</strong> le 1er de chaque mois à 8h00
                                </div>
                                <div style={{ fontSize: '14px', color: '#15803d' }}>
                                    <strong>• Trimestriel:</strong> le 1er jour du trimestre à 8h00
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Unités d'organisation (nouveau card) */}
                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>
                        <Settings size={24} color="#10b981" />
                        Unités d'organisation
                    </div>
                    
                    <BullOrgUnit config={config} setConfig={setConfig} />
                </div>
            </div>

            {/* Rubriques & sous-rubriques */}
            <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                    <BarChart3 size={24} color="#3b82f6" />
                    Rubriques & sous-rubriques
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                    <Button 
                        secondary 
                        onClick={addSection} 
                        icon={<Plus size={16} />}
                    >
                        Ajouter une rubrique
                    </Button>
                </div>

                {(config.sections || []).map((section) => (
                    <SectionEditor 
                        key={section.id} 
                        section={section} 
                        onChange={(patch) => updateSection(section.id, patch)} 
                        onRemove={() => removeSection(section.id)}
                        presentations={PRESENTATIONS}
                        onOpenIndicatorSelector={openIndicatorSelector}
                    />
                ))}
            </div>

            {/* Modal pour nouveau programme */}
            {showNewProgramModal && (
                <div style={modalOverlayStyle} onClick={() => setShowNewProgramModal(false)}>
                    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                        <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>
                            Ajouter un nouveau programme
                        </h4>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Nom du programme</label>
                            <InputField
                                value={newProgramName}
                                onChange={({ value }) => setNewProgramName(value)}
                                placeholder="Ex: PNLS - Programme national de lutte contre la SIDA"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setShowNewProgramModal(false)} secondary>
                                Annuler
                            </Button>
                            <Button onClick={handleAddNewProgram} primary>
                                Ajouter le programme
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal sélecteur d'indicateurs */}
            {showIndicatorSelector && (
                <IndicatorSelector
                    onClose={closeIndicatorSelector}
                    availableIndicators={getAvailableIndicators()}
                    selectedIndicators={getSelectedIndicators()}
                    onAddIndicator={addIndicator}
                    onRemoveIndicator={removeIndicator}
                    onAddAll={addAllIndicators}
                    onRemoveAll={removeAllIndicators}
                    searchValue={indicatorSearch}
                    onSearchChange={setIndicatorSearch}
                    groupName={currentIndicatorGroup?.name || 'Groupe d\'indicateurs'}
                />
            )}
        </div>
    )
}

// Composant SectionEditor optimisé
function SectionEditor({ section, onChange, onRemove, presentations, onOpenIndicatorSelector }) {
    const update = (field, value) => {
        onChange({ ...section, [field]: value })
    }

    const addSubsection = () => {
        const newSubsection = { 
            id: crypto.randomUUID(), 
            title: "Nouvelle sous-rubrique", 
            presentation: "table",
            indicatorGroups: []
        }
        onChange({ 
            ...section, 
            subsections: [...(section.subsections || []), newSubsection] 
        })
    }

    const updateSubsection = (id, patch) => {
        onChange({ 
            ...section, 
            subsections: (section.subsections || []).map((s) => 
                s.id === id ? { ...s, ...patch } : s
            ) 
        })
    }

    const removeSubsection = (id) => {
        onChange({ 
            ...section, 
            subsections: (section.subsections || []).filter((s) => s.id !== id) 
        })
    }

    const addIndicatorGroup = (subsectionId) => {
        const newGroup = {
            id: crypto.randomUUID(),
            name: '',
            selectedIndicators: []
        }
        
        const updatedSubsection = {
            ...section.subsections.find(s => s.id === subsectionId),
            indicatorGroups: [...(section.subsections.find(s => s.id === subsectionId).indicatorGroups || []), newGroup]
        }
        
        updateSubsection(subsectionId, updatedSubsection)
    }

    const updateIndicatorGroup = (subsectionId, groupId, patch) => {
        const subsection = section.subsections.find(s => s.id === subsectionId)
        const updatedGroups = (subsection.indicatorGroups || []).map(group => 
            group.id === groupId ? { ...group, ...patch } : group
        )
        
        const updatedSubsection = {
            ...subsection,
            indicatorGroups: updatedGroups
        }
        
        updateSubsection(subsectionId, updatedSubsection)
    }

    const removeIndicatorGroup = (subsectionId, groupId) => {
        const subsection = section.subsections.find(s => s.id === subsectionId)
        const updatedGroups = (subsection.indicatorGroups || []).filter(group => group.id !== groupId)
        
        const updatedSubsection = {
            ...subsection,
            indicatorGroups: updatedGroups
        }
        
        updateSubsection(subsectionId, updatedSubsection)
    }

    const sectionCardStyle = {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }

    const subsectionCardStyle = {
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        border: '1px solid #e2e8f0'
    }

    const indicatorGroupStyle = {
        backgroundColor: 'white',
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '8px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }

    const badgeStyle = {
        backgroundColor: '#f1f5f9',
        color: '#64748b',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500'
    }

    const indicatorButtonStyle = {
        backgroundColor: '#f97316',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    }

    const addGroupButtonStyle = {
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    }

    const inputStyle = {
        padding: '6px 10px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '14px',
        width: '100%',
        boxSizing: 'border-box'
    }

    return (
        <div style={sectionCardStyle}>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={badgeStyle}>Rubrique</span>
                    <InputField
                        value={section.title}
                        onChange={({ value }) => update("title", value)}
                        style={{ maxWidth: '300px' }}
                    />
                </div>
                <Button 
                    destructive 
                    small 
                    icon={<Trash2 size={16} />} 
                    onClick={onRemove}
                />
            </div>
            
            <div style={{ marginTop: '16px' }}>
                {(section.subsections || []).map((subsection) => (
                    <div key={subsection.id} style={subsectionCardStyle}>
                        <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            alignItems: 'center', 
                            gap: '12px',
                            marginBottom: '16px'
                        }}>
                            <InputField
                                value={subsection.title}
                                onChange={({ value }) => updateSubsection(subsection.id, { title: value })}
                                style={{ flex: 1, minWidth: '200px' }}
                                placeholder="Titre de la sous-rubrique"
                            />
                            
                            <select
                                value={subsection.presentation}
                                onChange={(e) => updateSubsection(subsection.id, { presentation: e.target.value })}
                                style={{
                                    minWidth: '120px',
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="">Type de présentation</option>
                                {presentations.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            
                            {/* Version DHIS2 SingleSelect (commentée pour test) */}
                            {/*
                            <SingleSelect
                                selected={subsection.presentation}
                                onChange={({ selected }) => updateSubsection(subsection.id, { presentation: selected })}
                                options={presentations}
                                style={{ minWidth: '120px' }}
                            />
                            */}
                            
                            <Button 
                                destructive 
                                small 
                                icon={<Trash2 size={16} />} 
                                onClick={() => removeSubsection(subsection.id)}
                            />
                        </div>

                        {/* Groupes d'indicateurs */}
                        <div style={{ marginTop: '12px' }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                marginBottom: '12px'
                            }}>
                                <h4 style={{ 
                                    fontSize: '14px', 
                                    fontWeight: '600', 
                                    color: '#374151',
                                    margin: 0
                                }}>
                                    Groupes d'indicateurs
                                </h4>
                                <button
                                    style={addGroupButtonStyle}
                                    onClick={() => addIndicatorGroup(subsection.id)}
                                >
                                    <Plus size={12} />
                                    Ajouter un groupe
                                </button>
                            </div>

                            {(subsection.indicatorGroups || []).map((group) => (
                                <div key={group.id} style={indicatorGroupStyle}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px',
                                        marginBottom: '8px'
                                    }}>
                                        <InputField
                                            value={group.name}
                                            onChange={({ value }) => updateIndicatorGroup(subsection.id, group.id, { name: value })}
                                            placeholder="Nom du groupe d'indicateurs"
                                            style={{ flex: 1 }}
                                        />
                                        
                                        {group.name.trim() && (
                                            <button
                                                style={indicatorButtonStyle}
                                                onClick={() => onOpenIndicatorSelector(subsection, group)}
                                            >
                                                <Search size={12} />
                                                Indicateurs ({group.selectedIndicators?.length || 0})
                                            </button>
                                        )}
                                        
                                        <Button 
                                            destructive 
                                            small 
                                            icon={<Trash2 size={14} />} 
                                            onClick={() => removeIndicatorGroup(subsection.id, group.id)}
                                        />
                                    </div>
                                </div>
                            ))}

                            {(subsection.indicatorGroups || []).length === 0 && (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '20px',
                                    color: '#6b7280',
                                    fontSize: '14px',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '6px',
                                    border: '1px dashed #d1d5db'
                                }}>
                                    Aucun groupe d'indicateurs ajouté. 
                                    <br />
                                    Cliquez sur "Ajouter un groupe" pour commencer.
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                <Button 
                    secondary 
                    onClick={addSubsection} 
                    icon={<Plus size={16} />}
                    style={{ marginTop: '12px' }}
                >
                    Ajouter une sous-rubrique
                </Button>
            </div>
        </div>
    )
}

// Composant sélecteur d'indicateurs DHIS2
function IndicatorSelector({ 
    onClose, 
    availableIndicators, 
    selectedIndicators, 
    onAddIndicator, 
    onRemoveIndicator, 
    onAddAll, 
    onRemoveAll,
    searchValue,
    onSearchChange,
    groupName
}) {
    const modalStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        width: '90vw',
        maxWidth: '1200px',
        maxHeight: '80vh',
        boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    }

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e2e8f0'
    }

    const titleStyle = {
        fontSize: '24px',
        fontWeight: '600',
        color: '#1e293b'
    }

    const subtitleStyle = {
        fontSize: '14px',
        color: '#6b7280',
        marginTop: '4px'
    }

    const searchStyle = {
        padding: '12px 16px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        width: '100%',
        marginBottom: '16px',
        boxSizing: 'border-box'
    }

    const containerStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '16px',
        flex: 1,
        minHeight: '400px'
    }

    const panelStyle = {
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    }

    const panelHeaderStyle = {
        backgroundColor: '#f8fafc',
        padding: '12px 16px',
        borderBottom: '1px solid #e2e8f0',
        fontWeight: '500',
        color: '#374151'
    }

    const listStyle = {
        flex: 1,
        overflowY: 'auto',
        maxHeight: '300px'
    }

    const itemStyle = {
        padding: '8px 16px',
        borderBottom: '1px solid #f1f5f9',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#374151'
    }

    const itemHoverStyle = {
        backgroundColor: '#f8fafc'
    }

    const buttonContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        justifyContent: 'center',
        padding: '0 8px'
    }

    const actionButtonStyle = {
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        backgroundColor: '#f8fafc',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px'
    }

    const addAllButtonStyle = {
        ...actionButtonStyle,
        backgroundColor: '#f97316',
        color: 'white',
        borderColor: '#f97316'
    }

    const removeAllButtonStyle = {
        ...actionButtonStyle,
        backgroundColor: '#ef4444',
        color: 'white',
        borderColor: '#ef4444'
    }

    const footerStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid #e2e8f0'
    }

    return (
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
        }} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={headerStyle}>
                    <div>
                        <h2 style={titleStyle}>Indicateurs</h2>
                        <p style={subtitleStyle}>Groupe : {groupName}</p>
                    </div>
                    <Button onClick={onClose} secondary>Fermer</Button>
                </div>

                <input
                    type="text"
                    placeholder="Rechercher les items disponibles / sélectionnés"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={searchStyle}
                />

                <div style={containerStyle}>
                    {/* Panel gauche - Indicateurs disponibles */}
                    <div style={panelStyle}>
                        <div style={panelHeaderStyle}>
                            Indicateurs disponibles ({availableIndicators.length})
                        </div>
                        <div style={listStyle}>
                            {availableIndicators.map((indicator) => (
                                <div
                                    key={indicator.id}
                                    style={itemStyle}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = itemHoverStyle.backgroundColor}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = ''}
                                    onClick={() => onAddIndicator(indicator)}
                                >
                                    {indicator.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div style={buttonContainerStyle}>
                        <button style={actionButtonStyle} onClick={() => {}}>
                            <ChevronRight size={16} />
                        </button>
                        <button style={actionButtonStyle} onClick={() => {}}>
                            <ChevronLeft size={16} />
                        </button>
                    </div>

                    {/* Panel droit - Indicateurs sélectionnés */}
                    <div style={panelStyle}>
                        <div style={panelHeaderStyle}>
                            Indicateurs sélectionnés ({selectedIndicators.length})
                        </div>
                        <div style={listStyle}>
                            {selectedIndicators.map((indicator) => (
                                <div
                                    key={indicator.id}
                                    style={itemStyle}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = itemHoverStyle.backgroundColor}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = ''}
                                    onClick={() => onRemoveIndicator(indicator)}
                                >
                                    {indicator.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Boutons d'action en bas */}
                <div style={footerStyle}>
                    <button style={addAllButtonStyle} onClick={onAddAll}>
                        ASSIGNER TOUT {availableIndicators.length} →
                    </button>
                    <button style={removeAllButtonStyle} onClick={onRemoveAll}>
                        ← SUPPRIMER TOUT
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BulletinConfig