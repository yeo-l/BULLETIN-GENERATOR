import React, { useState, useEffect } from 'react'
import { Button, Card, InputField, Checkbox, SingleSelect, MultiSelect, NoticeBox } from '@dhis2/ui'
import { Save, Plus, Settings, BarChart3, Clock, Trash2, ChevronRight, ChevronLeft, Search } from 'lucide-react'
import BullOrgUnit from './BullOrgUnit'
import BulletinIndicators from './BulletinIndicators'

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
        selectedOrgUnits: [],
        periodValue: {} // Added for relative period selection
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
        { value: "PEV", label: "PEV" },
        { value: "PNLT", label: "PNLT" },
        { value: "PNN", label: "PNN" },
        { value: "PNLS", label: "PNLS" },
        { value: "INHP", label: "INHP" },
        { value: "PNSME", label: "PNSME" },
    ]
      
    const PERIOD_OPTIONS = [
        { value: "WEEKLY", label: "Hebdomadaire" },
        { value: "QUARTERLY", label: "Trimestriel" },
        { value: "SEMIANNUAL", label: "Semestriel" },
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



    const getPeriodDisplayText = () => {
        if (!config.periodicity || !config.periodValue) return ''
        
        const { periodicity, periodValue } = config
        
        switch (periodicity) {
            case 'WEEKLY':
                return `Semaine ${periodValue.week} de ${periodValue.year}`
            case 'MONTHLY':
                const months = [
                    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
                ]
                return `${months[periodValue.month - 1]} ${periodValue.year}`
            case 'QUARTERLY':
                const quarters = [
                    '1er Trimestre', '2ème Trimestre', '3ème Trimestre', '4ème Trimestre'
                ]
                return `${quarters[periodValue.quarter - 1]} ${periodValue.year}`
            case 'YEARLY':
                return `Année ${periodValue.year}`
            case 'BIWEEKLY':
                return `Période ${periodValue.biweek} (Semaines ${(periodValue.biweek - 1) * 2 + 1}-${periodValue.biweek * 2}) de ${periodValue.year}`
            case 'SEMIANNUAL':
                const semesters = ['1er Semestre', '2ème Semestre']
                return `${semesters[periodValue.semester - 1]} ${periodValue.year}`
            default:
                return ''
        }
    }

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
    const openIndicatorSelector = (subsectionId, groupId) => {
        // Trouver la sous-section et le groupe correspondants
        const subsection = config.sections
            .flatMap(section => section.subsections || [])
            .find(sub => sub.id === subsectionId)
        
        const group = subsection?.indicatorGroups?.find(g => g.id === groupId)
        
        if (subsection && group) {
            setCurrentSubsection(subsection)
            setCurrentIndicatorGroup(group)
            setShowIndicatorSelector(true)
            setIndicatorSearch('')
        }
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
        // Cette fonction sera gérée par BulletinIndicators
        return []
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
                    
                    {/* Programme de surveillance avec design amélioré */}
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Programme de surveillance</label>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: '12px',
                            backgroundColor: '#f8fafc',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ flex: 1 }}>
                                <select
                                    value={config.program}
                                    onChange={(e) => {
                                        console.log('Programme sélectionné (HTML):', e.target.value)
                                        setConfig({ ...config, program: e.target.value })
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        backgroundColor: 'white',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6'
                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#d1d5db'
                                        e.target.style.boxShadow = 'none'
                                    }}
                                >
                                    <option value="">Sélectionner le programme...</option>
                                    {PROGRAM_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                secondary
                                small
                                icon={<Plus size={16} />}
                                onClick={() => setShowNewProgramModal(true)}
                                style={{ 
                                    marginBottom: '0',
                                    backgroundColor: '#f97316',
                                    color: 'white',
                                    borderColor: '#f97316'
                                }}
                            >
                                Nouveau
                            </Button>
                        </div>
                    </div>

                    {/* Titre de la page de garde avec design amélioré */}
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Titre de la page de garde</label>
                        <div style={{
                            backgroundColor: '#f8fafc',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <InputField
                                value={config.coverTitle}
                                onChange={({ value }) => setConfig({ ...config, coverTitle: value })}
                                placeholder="Ex: Bulletin de surveillance PEV - Semaine 15, 2024"
                                style={{ border: 'none', backgroundColor: 'transparent' }}
                            />
                        </div>
                    </div>

                    {/* Périodicité avec sélection de période relative */}
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Périodicité de génération</label>
                        
                        <div style={{
                            backgroundColor: '#f8fafc',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <select
                                value={config.periodicity}
                                onChange={(e) => {
                                    console.log('Périodicité sélectionnée (HTML):', e.target.value)
                                    setConfig({ ...config, periodicity: e.target.value, periodValue: {} }) // Clear periodValue when periodicity changes
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    backgroundColor: 'white',
                                    marginBottom: '12px',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#3b82f6'
                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#d1d5db'
                                    e.target.style.boxShadow = 'none'
                                }}
                            >
                                <option value="">Sélectionner la périodicité...</option>
                                {PERIOD_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {/* Sélection de période relative selon la périodicité */}
                            {config.periodicity && (
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <label style={{
                                        ...labelStyle,
                                        marginBottom: '12px',
                                        color: '#1e293b',
                                        fontWeight: '600'
                                    }}>
                                        Sélectionner la période
                                    </label>
                                    
                                    {config.periodicity === 'WEEKLY' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: '12px' }}>Année</label>
                                                <select
                                                    value={config.periodValue?.year || new Date().getFullYear()}
                                                    onChange={(e) => setConfig({ 
                                                        ...config, 
                                                        periodValue: { 
                                                            ...config.periodValue, 
                                                            year: parseInt(e.target.value) 
                                                        } 
                                                    })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'white'
                                                    }}
                                                >
                                                    {Array.from({ length: 5 }, (_, i) => {
                                                        const year = new Date().getFullYear() - 2 + i
                                                        return (
                                                            <option key={year} value={year}>
                                                                {year}
                                                            </option>
                                                        )
                                                    })}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: '12px' }}>Semaine</label>
                                                <select
                                                    value={config.periodValue?.week || 1}
                                                    onChange={(e) => setConfig({ 
                                                        ...config, 
                                                        periodValue: { 
                                                            ...config.periodValue, 
                                                            week: parseInt(e.target.value) 
                                                        } 
                                                    })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'white'
                                                    }}
                                                >
                                                    {Array.from({ length: 52 }, (_, i) => (
                                                        <option key={i + 1} value={i + 1}>
                                                            Semaine {i + 1}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {config.periodicity === 'MONTHLY' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: '12px' }}>Année</label>
                                                <select
                                                    value={config.periodValue?.year || new Date().getFullYear()}
                                                    onChange={(e) => setConfig({ 
                                                        ...config, 
                                                        periodValue: { 
                                                            ...config.periodValue, 
                                                            year: parseInt(e.target.value) 
                                                        } 
                                                    })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'white'
                                                    }}
                                                >
                                                    {Array.from({ length: 5 }, (_, i) => {
                                                        const year = new Date().getFullYear() - 2 + i
                                                        return (
                                                            <option key={year} value={year}>
                                                                {year}
                                                            </option>
                                                        )
                                                    })}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: '12px' }}>Mois</label>
                                                <select
                                                    value={config.periodValue?.month || 1}
                                                    onChange={(e) => setConfig({ 
                                                        ...config, 
                                                        periodValue: { 
                                                            ...config.periodValue, 
                                                            month: parseInt(e.target.value) 
                                                        } 
                                                    })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'white'
                                                    }}
                                                >
                                                    {[
                                                        { value: 1, label: 'Janvier' },
                                                        { value: 2, label: 'Février' },
                                                        { value: 3, label: 'Mars' },
                                                        { value: 4, label: 'Avril' },
                                                        { value: 5, label: 'Mai' },
                                                        { value: 6, label: 'Juin' },
                                                        { value: 7, label: 'Juillet' },
                                                        { value: 8, label: 'Août' },
                                                        { value: 9, label: 'Septembre' },
                                                        { value: 10, label: 'Octobre' },
                                                        { value: 11, label: 'Novembre' },
                                                        { value: 12, label: 'Décembre' }
                                                    ].map(month => (
                                                        <option key={month.value} value={month.value}>
                                                            {month.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {config.periodicity === 'QUARTERLY' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: '12px' }}>Année</label>
                                                <select
                                                    value={config.periodValue?.year || new Date().getFullYear()}
                                                    onChange={(e) => setConfig({ 
                                                        ...config, 
                                                        periodValue: { 
                                                            ...config.periodValue, 
                                                            year: parseInt(e.target.value) 
                                                        } 
                                                    })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'white'
                                                    }}
                                                >
                                                    {Array.from({ length: 5 }, (_, i) => {
                                                        const year = new Date().getFullYear() - 2 + i
                                                        return (
                                                            <option key={year} value={year}>
                                                                {year}
                                                            </option>
                                                        )
                                                    })}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: '12px' }}>Trimestre</label>
                                                <select
                                                    value={config.periodValue?.quarter || 1}
                                                    onChange={(e) => setConfig({ 
                                                        ...config, 
                                                        periodValue: { 
                                                            ...config.periodValue, 
                                                            quarter: parseInt(e.target.value) 
                                                        } 
                                                    })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'white'
                                                    }}
                                                >
                                                    {[
                                                        { value: 1, label: '1er Trimestre (Jan-Mar)' },
                                                        { value: 2, label: '2ème Trimestre (Avr-Juin)' },
                                                        { value: 3, label: '3ème Trimestre (Juil-Sep)' },
                                                        { value: 4, label: '4ème Trimestre (Oct-Déc)' }
                                                    ].map(quarter => (
                                                        <option key={quarter.value} value={quarter.value}>
                                                            {quarter.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {config.periodicity === 'YEARLY' && (
                                        <div>
                                            <label style={{ ...labelStyle, fontSize: '12px' }}>Année</label>
                                            <select
                                                value={config.periodValue?.year || new Date().getFullYear()}
                                                onChange={(e) => setConfig({ 
                                                    ...config, 
                                                    periodValue: { 
                                                        ...config.periodValue, 
                                                        year: parseInt(e.target.value) 
                                                    } 
                                                })}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '14px',
                                                    backgroundColor: 'white'
                                                }}
                                            >
                                                {Array.from({ length: 5 }, (_, i) => {
                                                    const year = new Date().getFullYear() - 2 + i
                                                    return (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    )
                                                })}
                                            </select>
                                        </div>
                                    )}

                                    {config.periodicity === 'BIWEEKLY' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: '12px' }}>Année</label>
                                                <select
                                                    value={config.periodValue?.year || new Date().getFullYear()}
                                                    onChange={(e) => setConfig({ 
                                                        ...config, 
                                                        periodValue: { 
                                                            ...config.periodValue, 
                                                            year: parseInt(e.target.value) 
                                                        } 
                                                    })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'white'
                                                    }}
                                                >
                                                    {Array.from({ length: 5 }, (_, i) => {
                                                        const year = new Date().getFullYear() - 2 + i
                                                        return (
                                                            <option key={year} value={year}>
                                                                {year}
                                                            </option>
                                                        )
                                                    })}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: '12px' }}>Période bimensuelle</label>
                                                <select
                                                    value={config.periodValue?.biweek || 1}
                                                    onChange={(e) => setConfig({ 
                                                        ...config, 
                                                        periodValue: { 
                                                            ...config.periodValue, 
                                                            biweek: parseInt(e.target.value) 
                                                        } 
                                                    })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'white'
                                                    }}
                                                >
                                                    {Array.from({ length: 26 }, (_, i) => (
                                                        <option key={i + 1} value={i + 1}>
                                                            Période {i + 1} (Semaines {(i * 2) + 1}-{(i + 1) * 2})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {config.periodicity === 'SEMIANNUAL' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={{ ...labelStyle, fontSize: '12px' }}>Année</label>
                                                <select
                                                    value={config.periodValue?.year || new Date().getFullYear()}
                                                    onChange={(e) => setConfig({ 
                                                        ...config, 
                                                        periodValue: { 
                                                            ...config.periodValue, 
                                                            year: parseInt(e.target.value) 
                                                        } 
                                                    })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'white'
                                                    }}
                                                >
                                                    {Array.from({ length: 5 }, (_, i) => {
                                                        const year = new Date().getFullYear() - 2 + i
                                                        return (
                                                            <option key={year} value={year}>
                                                                {year}
                                                            </option>
                                                        )
                                                    })}
                                                </select>
                                            </div>
        <div>
                                                <label style={{ ...labelStyle, fontSize: '12px' }}>Semestre</label>
                                                <select
                                                    value={config.periodValue?.semester || 1}
                                                    onChange={(e) => setConfig({ 
                                                        ...config, 
                                                        periodValue: { 
                                                            ...config.periodValue, 
                                                            semester: parseInt(e.target.value) 
                                                        } 
                                                    })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                        fontSize: '14px',
                                                        backgroundColor: 'white'
                                                    }}
                                                >
                                                    {[
                                                        { value: 1, label: '1er Semestre (Jan-Juin)' },
                                                        { value: 2, label: '2ème Semestre (Juil-Déc)' }
                                                    ].map(semester => (
                                                        <option key={semester.value} value={semester.value}>
                                                            {semester.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* Affichage de la période sélectionnée */}
                                    {config.periodValue && Object.keys(config.periodValue).length > 0 && (
                                        <div style={{
                                            marginTop: '12px',
                                            padding: '12px',
                                            backgroundColor: '#f0fdf4',
                                            borderRadius: '6px',
                                            border: '1px solid #bbf7d0'
                                        }}>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#166534',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <Clock size={16} />
                                                Période sélectionnée : {getPeriodDisplayText()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Options d'automatisation avec design amélioré */}
                    <div style={formGroupStyle}>
                        <div style={{
                            backgroundColor: '#f8fafc',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <Checkbox
                                label="Génération automatique des bulletins"
                                checked={config.autoGenerate}
                                onChange={({ checked }) => setConfig({ ...config, autoGenerate: checked })}
                            />
                            
                            {config.autoGenerate && (
                                <div style={{
                                    marginTop: '16px',
                                    padding: '16px',
                                    backgroundColor: '#f0fdf4',
                                    borderRadius: '8px',
                                    border: '1px solid #bbf7d0'
                                }}>
                                    <p style={{ color: '#166534', marginBottom: '16px', fontWeight: '500' }}>
                                        Le bulletin sera généré automatiquement selon la fréquence sélectionnée.
                                    </p>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                        gap: '12px' 
                                    }}>
                                        <div style={{ 
                                            fontSize: '14px', 
                                            color: '#15803d',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                backgroundColor: '#10b981',
                                                borderRadius: '50%'
                                            }}></div>
                                            <strong>Hebdomadaire:</strong> chaque lundi à 8h00
                                        </div>
                                        <div style={{ 
                                            fontSize: '14px', 
                                            color: '#15803d',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                backgroundColor: '#10b981',
                                                borderRadius: '50%'
                                            }}></div>
                                            <strong>Mensuel:</strong> le 1er de chaque mois à 8h00
                                        </div>
                                        <div style={{ 
                                            fontSize: '14px', 
                                            color: '#15803d',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                backgroundColor: '#10b981',
                                                borderRadius: '50%'
                                            }}></div>
                                            <strong>Trimestriel:</strong> le 1er jour du trimestre à 8h00
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Unités d'organisation (nouveau card) */}
                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>
                        <Settings size={24} color="#10b981" />
                        Unités d'organisation
                    </div>
                    
                    <BullOrgUnit config={config} setConfig={setConfig} />
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
                <BulletinIndicators
                    onClose={closeIndicatorSelector}
                    selectedIndicators={getSelectedIndicators()}
                    onAddIndicator={addIndicator}
                    onRemoveIndicator={removeIndicator}
                    onAddAll={addAllIndicators}
                    onRemoveAll={removeAllIndicators}
                    groupName={currentIndicatorGroup?.name || 'Groupe d\'indicateurs'}
                />
            )}
        </div>
    )
}

// Composant SectionEditor défini en dehors pour éviter les problèmes de portée
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

    // Styles pour les éléments du SectionEditor
    const inputStyle = {
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        backgroundColor: 'white',
        transition: 'all 0.2s ease'
    }

    const selectStyle = {
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        backgroundColor: 'white',
        transition: 'all 0.2s ease'
    }

    const indicatorGroupStyle = {
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: '#f8fafc'
    }

    const indicatorButtonStyle = {
        padding: '6px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        backgroundColor: '#f8fafc',
        color: '#374151',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    }

    const badgeStyle = {
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '2px'
    }

    // Styles pour les cartes (définis localement pour éviter les erreurs de portée)
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

    return (
        <div style={sectionCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                        type="text"
                        value={section.title}
                        onChange={(e) => update('title', e.target.value)}
                        placeholder="Nom de la rubrique"
                        style={{ ...inputStyle, width: '300px' }}
                    />
                    <select
                        value={section.presentation}
                        onChange={(e) => update('presentation', e.target.value)}
                        style={{ ...selectStyle, width: '150px' }}
                    >
                        {presentations.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>
                <Button 
                    small 
                    destructive 
                    onClick={onRemove}
                    icon={<Trash2 size={16} />}
                >
                    Supprimer
                </Button>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <Button 
                    secondary 
                    small 
                    onClick={addSubsection} 
                    icon={<Plus size={16} />}
                >
                    Ajouter une sous-rubrique
                </Button>
            </div>

            {(section.subsections || []).map((subsection) => (
                <div key={subsection.id} style={subsectionCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input
                                type="text"
                                value={subsection.title}
                                onChange={(e) => updateSubsection(subsection.id, { title: e.target.value })}
                                placeholder="Nom de la sous-rubrique"
                                style={{ ...inputStyle, width: '250px' }}
                            />
                            <select
                                value={subsection.presentation}
                                onChange={(e) => updateSubsection(subsection.id, { presentation: e.target.value })}
                                style={{ ...selectStyle, width: '120px' }}
                            >
                                {presentations.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>
                        <Button 
                            small 
                            destructive 
                            onClick={() => removeSubsection(subsection.id)}
                            icon={<Trash2 size={16} />}
                        >
                            Supprimer
                        </Button>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <Button 
                            secondary 
                            small 
                            onClick={() => addIndicatorGroup(subsection.id)} 
                            icon={<Plus size={16} />}
                        >
                            Ajouter un groupe d'indicateurs
                        </Button>
                    </div>

                    {(subsection.indicatorGroups || []).map((group) => (
                        <div key={group.id} style={indicatorGroupStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <input
                                    type="text"
                                    value={group.name}
                                    onChange={(e) => updateIndicatorGroup(subsection.id, group.id, { name: e.target.value })}
                                    placeholder="Nom du groupe d'indicateurs"
                                    style={{ ...inputStyle, width: '200px' }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => onOpenIndicatorSelector(subsection.id, group.id)}
                                        style={{
                                            ...indicatorButtonStyle,
                                            backgroundColor: group.name.trim() ? '#3b82f6' : '#9ca3af',
                                            color: 'white',
                                            borderColor: group.name.trim() ? '#3b82f6' : '#9ca3af'
                                        }}
                                        disabled={!group.name.trim()}
                                    >
                                        Indicateurs ({group.selectedIndicators?.length || 0})
                                    </button>
                                    <Button 
                                        small 
                                        destructive 
                                        onClick={() => removeIndicatorGroup(subsection.id, group.id)}
                                        icon={<Trash2 size={16} />}
                                    >
                                        Supprimer
                                    </Button>
                                </div>
                            </div>
                            
                            {(group.selectedIndicators?.length || 0) > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {group.selectedIndicators?.map((indicator) => (
                                        <span key={indicator.id} style={badgeStyle}>
                                            {indicator.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}



export default BulletinConfig