import React, { useState, useEffect } from 'react'
import { Button, Card, InputField, Checkbox, SingleSelect, MultiSelect, NoticeBox } from '@dhis2/ui'
import { Save, Plus, Settings, BarChart3, Clock, Trash2, ChevronRight, ChevronLeft, Search, Upload, FileText, X, CheckCircle, AlertCircle, Eye } from 'lucide-react'
import BullOrgUnit from './BullOrgUnit'
import BulletinIndicators from './BulletinIndicators'

const BulletinConfig = ({ configToEdit, onConfigSaved }) => {
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
        periodValue: {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            week: 1,
            quarter: 1,
            semester: 1,
            biweek: 1
        }
    })
    const [saveStatus, setSaveStatus] = useState(null)
    const [showNewProgramModal, setShowNewProgramModal] = useState(false)
    const [newProgramName, setNewProgramName] = useState('')
    const [showIndicatorSelector, setShowIndicatorSelector] = useState(false)
    const [showVisualizationSelector, setShowVisualizationSelector] = useState(false)
    const [currentSubsection, setCurrentSubsection] = useState(null)
    const [currentIndicatorGroup, setCurrentIndicatorGroup] = useState(null)
    const [currentVisualizationGroup, setCurrentVisualizationGroup] = useState(null)
    const [indicatorSearch, setIndicatorSearch] = useState('')
    const [visualizations, setVisualizations] = useState([])
    const [loadingVisualizations, setLoadingVisualizations] = useState(false)

    // Charger les visualisations depuis l'API DHIS2
    useEffect(() => {
        if (showVisualizationSelector) {
            fetchVisualizations()
        }
    }, [showVisualizationSelector])

    const fetchVisualizations = async () => {
        setLoadingVisualizations(true)
        try {
            // Appel API DHIS2 pour récupérer les visualisations avec leurs UID
            const response = await fetch('/api/visualizations?fields=id,name,type&paging=false')
            if (response.ok) {
                const data = await response.json()
                console.log('Visualisations récupérées:', data)
                
                if (data.visualizations && Array.isArray(data.visualizations)) {
                    setVisualizations(data.visualizations)
                } else {
                    console.error('Format de données invalide:', data)
                    setVisualizations([])
                }
            } else {
                console.error('Erreur lors du chargement des visualisations:', response.status)
                setVisualizations([])
            }
        } catch (error) {
            console.error('Erreur de connexion:', error)
            setVisualizations([])
        } finally {
            setLoadingVisualizations(false)
        }
    }

    // Charger les données de configuration à modifier
    useEffect(() => {
        if (configToEdit) {
            console.log('Chargement de la configuration à modifier:', configToEdit)
            setConfig({
                name: configToEdit.name || '',
                diseases: configToEdit.diseases || [],
                period: configToEdit.period || '',
                template: configToEdit.template || '',
                indicators: configToEdit.indicators || [],
                favorites: configToEdit.favorites || [],
                orgUnits: configToEdit.orgUnits || [],
                autoGenerate: configToEdit.autoGenerate || false,
                program: configToEdit.program || '',
                coverTitle: configToEdit.coverTitle || '',
                periodicity: configToEdit.periodicity || '',
                sections: configToEdit.sections || [],
                selectedOrgUnits: configToEdit.selectedOrgUnits || [],
                periodValue: configToEdit.periodValue || { 
                    year: new Date().getFullYear(), 
                    month: new Date().getMonth() + 1,
                    week: 1,
                    quarter: 1,
                    semester: 1,
                    biweek: 1
                },
                key: configToEdit.key || null
            })
            setSaveStatus({
                type: 'info',
                message: `Configuration "${configToEdit.coverTitle || configToEdit.name}" chargée pour modification`
            })
        }
    }, [configToEdit])

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
        
        console.log('Debug periodValue:', periodValue) // Pour debugger
        
        switch (periodicity) {
            case 'WEEKLY':
                return `Semaine ${periodValue.week || 1} de ${periodValue.year || new Date().getFullYear()}`
            case 'MONTHLY':
                const months = [
                    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
                ]
                const monthValue = periodValue.month || new Date().getMonth() + 1
                const yearValue = periodValue.year || new Date().getFullYear()
                if (monthValue >= 1 && monthValue <= 12) {
                    return `${months[monthValue - 1]} ${yearValue}`
                } else {
                    return `Mois ${monthValue} ${yearValue}`
                }
            case 'QUARTERLY':
                const quarters = [
                    '1er Trimestre', '2ème Trimestre', '3ème Trimestre', '4ème Trimestre'
                ]
                const quarterValue = periodValue.quarter || 1
                const quarterYear = periodValue.year || new Date().getFullYear()
                if (quarterValue >= 1 && quarterValue <= 4) {
                    return `${quarters[quarterValue - 1]} ${quarterYear}`
                } else {
                    return `Trimestre ${quarterValue} ${quarterYear}`
                }
            case 'YEARLY':
                return `Année ${periodValue.year || new Date().getFullYear()}`
            case 'BIWEEKLY':
                const biweekValue = periodValue.biweek || 1
                const biweekYear = periodValue.year || new Date().getFullYear()
                return `Période ${biweekValue} (Semaines ${(biweekValue - 1) * 2 + 1}-${biweekValue * 2}) de ${biweekYear}`
            case 'SEMIANNUAL':
                const semesters = ['1er Semestre', '2ème Semestre']
                const semesterValue = periodValue.semester || 1
                const semesterYear = periodValue.year || new Date().getFullYear()
                if (semesterValue >= 1 && semesterValue <= 2) {
                    return `${semesters[semesterValue - 1]} ${semesterYear}`
                } else {
                    return `Semestre ${semesterValue} ${semesterYear}`
                }
            default:
                return ''
        }
    }

    const handleSave = async () => {
        try {
            console.log('Sauvegarde de la configuration:', config)
            
            // Déterminer si c'est une création ou une mise à jour
            const isUpdate = config.key && configToEdit
            
            let uniqueKey = config.key
            
            if (!isUpdate) {
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
                uniqueKey = `${programKey}${dateStr}${timeStr}`
            }
            
            console.log('Clé utilisée:', uniqueKey, isUpdate ? '(mise à jour)' : '(création)')
            
            // Préparer les données à sauvegarder
            const now = new Date()
            const bulletinConfig = {
                ...config,
                lastModified: now.toISOString(),
                version: isUpdate ? (config.version || '1.0') : '1.0',
                key: uniqueKey,
                program: config.program,
                createdDate: isUpdate ? (config.createdDate || now.toISOString()) : now.toISOString()
            }
            
            // Créer ou mettre à jour le datastore dans DHIS2 avec la clé unique
            const response = await fetch(`/api/dataStore/GENERATE-BULLETIN/${uniqueKey}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bulletinConfig)
            })
            
            if (response.ok) {
                console.log('Configuration sauvegardée dans le datastore DHIS2 avec la clé:', uniqueKey)
                setSaveStatus({ 
                    type: 'success', 
                    message: `Configuration ${isUpdate ? 'mise à jour' : 'sauvegardée'} avec succès dans le datastore DHIS2 (GENERATE-BULLETIN/${uniqueKey})` 
                })
                
                // Appeler le callback de sauvegarde si fourni
                if (onConfigSaved) {
                    onConfigSaved()
                }
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

    // Fonctions pour le sélecteur de visualisations
    const openVisualizationSelector = (subsectionId, groupId) => {
        // Trouver la sous-section et le groupe correspondants
        const subsection = config.sections
            .flatMap(section => section.subsections || [])
            .find(sub => sub.id === subsectionId)
        
        const group = subsection?.visualizationGroups?.find(g => g.id === groupId)
        
        if (subsection && group) {
            setCurrentSubsection(subsection)
            setCurrentVisualizationGroup(group)
            setShowVisualizationSelector(true)
        }
    }

    const closeVisualizationSelector = () => {
        setShowVisualizationSelector(false)
        setCurrentSubsection(null)
        setCurrentVisualizationGroup(null)
    }

    const getSelectedVisualizations = () => {
        if (!currentVisualizationGroup) return []
        return currentVisualizationGroup.selectedVisualizations || []
    }

    const addVisualization = (visualization) => {
        if (!currentVisualizationGroup) return
        
        const updatedVisualizations = [...getSelectedVisualizations(), {
            id: visualization.id,
            name: visualization.name,
            type: visualization.type
        }]
        updateVisualizationGroupVisualizations(updatedVisualizations)
    }

    const removeVisualization = (visualization) => {
        if (!currentVisualizationGroup) return
        
        const updatedVisualizations = getSelectedVisualizations().filter(viz => viz.id !== visualization.id)
        updateVisualizationGroupVisualizations(updatedVisualizations)
    }

    const addAllVisualizations = () => {
        if (!currentVisualizationGroup) return
        
        const updatedVisualizations = [...getSelectedVisualizations(), ...visualizations.map(viz => ({
            id: viz.id,
            name: viz.name,
            type: viz.type
        }))]
        updateVisualizationGroupVisualizations(updatedVisualizations)
    }

    const removeAllVisualizations = () => {
        if (!currentVisualizationGroup) return
        updateVisualizationGroupVisualizations([])
    }

    const updateVisualizationGroupVisualizations = (visualizations) => {
        if (!currentVisualizationGroup || !currentSubsection) return

        // Trouver la section et sous-section correspondantes
        const updatedSections = (config.sections || []).map(section => ({
            ...section,
            subsections: (section.subsections || []).map(subsection => {
                if (subsection.id === currentSubsection.id) {
                    return {
                        ...subsection,
                        visualizationGroups: (subsection.visualizationGroups || []).map(group => 
                            group.id === currentVisualizationGroup.id 
                                ? { ...group, selectedVisualizations: visualizations }
                                : group
                        )
                    }
                }
                return subsection
            })
        }))

        setConfig({ ...config, sections: updatedSections })
        
        // Mettre à jour currentVisualizationGroup
        const updatedGroup = updatedSections
            .flatMap(s => s.subsections)
            .flatMap(sub => sub.visualizationGroups || [])
            .find(group => group.id === currentVisualizationGroup.id)
        setCurrentVisualizationGroup(updatedGroup)
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

    // Styles inline avec animations
    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        animation: 'fadeInUp 0.6s ease-out'
    }

    const headerStyle = {
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        padding: '32px',
        borderRadius: '12px',
        marginBottom: '32px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        animation: 'slideInUp 0.5s ease-out'
    }

    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
        transition: 'all 0.3s ease',
        animation: 'slideInUp 0.5s ease-out'
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
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 4px rgba(249, 115, 22, 0.2)',
        position: 'relative',
        overflow: 'hidden'
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
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.3s ease-out'
    }

    const modalStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        width: '480px',
        maxWidth: '90vw',
        boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
        animation: 'scaleIn 0.3s ease-out'
    }

    const sectionCardStyle = {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        animation: 'fadeIn 0.4s ease-out'
    }

    const subsectionCardStyle = {
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s ease',
        animation: 'slideInRight 0.3s ease-out'
    }

    const badgeStyle = {
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '2px',
        transition: 'all 0.2s ease',
        animation: 'bounceIn 0.3s ease-out'
    }

    const visualizationBadgeStyle = {
        backgroundColor: '#f0fdf4',
        color: '#166534',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '2px',
        transition: 'all 0.2s ease',
        animation: 'bounceIn 0.3s ease-out'
    }

    const inputStyle = {
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease'
    }

    const selectStyle = {
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        backgroundColor: 'white',
        minWidth: '120px',
        transition: 'all 0.2s ease'
    }

    // Handler pour les effets hover
    const handleCardHover = (e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'
    }

    const handleCardLeave = (e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'
    }

    const handleSectionHover = (e) => {
        e.currentTarget.style.transform = 'translateX(4px)'
        e.currentTarget.style.borderLeft = '4px solid #3b82f6'
    }

    const handleSectionLeave = (e) => {
        e.currentTarget.style.transform = 'translateX(0)'
        e.currentTarget.style.borderLeft = '1px solid #e2e8f0'
    }

    const handleSubsectionHover = (e) => {
        e.currentTarget.style.backgroundColor = '#f0f4ff'
        e.currentTarget.style.transform = 'translateX(2px)'
    }

    const handleSubsectionLeave = (e) => {
        e.currentTarget.style.backgroundColor = '#f8fafc'
        e.currentTarget.style.transform = 'translateX(0)'
    }

    const handleButtonHover = (e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.3)'
    }

    const handleButtonLeave = (e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(249, 115, 22, 0.2)'
    }

    const handleBadgeHover = (e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.backgroundColor = '#3b82f6'
        e.currentTarget.style.color = 'white'
    }

    const handleBadgeLeave = (e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.backgroundColor = '#dbeafe'
        e.currentTarget.style.color = '#1e40af'
    }

    const handleVisualizationBadgeHover = (e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.backgroundColor = '#10b981'
        e.currentTarget.style.color = 'white'
    }

    const handleVisualizationBadgeLeave = (e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.backgroundColor = '#f0fdf4'
        e.currentTarget.style.color = '#166534'
    }

    return (
        <div style={containerStyle} className="bulletin-config-container">
            {/* Styles CSS pour les animations */}
            <style>
                {`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes bounceIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.3);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.05);
                    }
                    70% {
                        transform: scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .status-message {
                    animation: slideDown 0.4s ease-out;
                }

                .animated-button:hover {
                    transform: translateY(-1px);
                    boxShadow: 0 4px 12px rgba(249, 115, 22, 0.3);
                }

                .animated-button:active {
                    transform: translateY(0);
                }
                `}
            </style>

            {/* Header */}
            <div style={headerStyle} className="animated-header">
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
                        className="animated-button"
                        onMouseEnter={handleButtonHover}
                        onMouseLeave={handleButtonLeave}
                    >
                        Sauvegarder la configuration
                    </Button>
                </div>
            </div>

            {saveStatus && (
                <div style={{ marginBottom: '24px' }} className="status-message">
                    <NoticeBox 
                        title={saveStatus.message}
                        valid={saveStatus.type === 'success'}
                        error={saveStatus.type === 'error'}
                        info={saveStatus.type === 'info'}
                    />
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                {/* Configuration de base */}
                <div 
                    style={cardStyle} 
                    className="config-card"
                    onMouseEnter={handleCardHover}
                    onMouseLeave={handleCardLeave}
                >
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
                                className="animated-button"
                                onMouseEnter={handleButtonHover}
                                onMouseLeave={handleButtonLeave}
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
                                    setConfig({ 
                                        ...config, 
                                        periodicity: e.target.value, 
                                        periodValue: {
                                            ...config.periodValue,
                                            year: new Date().getFullYear(),
                                            month: new Date().getMonth() + 1,
                                            week: 1,
                                            quarter: 1,
                                            semester: 1,
                                            biweek: 1
                                        }
                                    })
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
                                                    onChange={(e) => {
                                                        const newYear = parseInt(e.target.value)
                                                        console.log('Année sélectionnée:', newYear)
                                                        setConfig({ 
                                                            ...config, 
                                                            periodValue: { 
                                                                ...config.periodValue, 
                                                                year: newYear
                                                            } 
                                                        })
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
                                                    onChange={(e) => {
                                                        const newYear = parseInt(e.target.value)
                                                        console.log('Année sélectionnée:', newYear)
                                                        setConfig({ 
                                                            ...config, 
                                                            periodValue: { 
                                                                ...config.periodValue, 
                                                                year: newYear
                                                            } 
                                                        })
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
                                                    value={config.periodValue?.month || new Date().getMonth() + 1}
                                                    onChange={(e) => {
                                                        const newMonth = parseInt(e.target.value)
                                                        console.log('Mois sélectionné:', newMonth, 'Année:', config.periodValue?.year)
                                                        setConfig({ 
                                                            ...config, 
                                                            periodValue: { 
                                                                ...config.periodValue, 
                                                                month: newMonth
                                                            } 
                                                        })
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
                                    {config.periodicity && (
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
                <div 
                    style={cardStyle} 
                    className="config-card"
                    onMouseEnter={handleCardHover}
                    onMouseLeave={handleCardLeave}
                >
                    <div style={sectionHeaderStyle}>
                        <Settings size={24} color="#10b981" />
                        Unités d'organisation
                    </div>
                    
                    <BullOrgUnit config={config} setConfig={setConfig} />
                </div>
            </div>

            {/* Rubriques & sous-rubriques - Prend toute la largeur */}
            <div 
                style={{...cardStyle, marginBottom: '32px'}} 
                className="config-card"
                onMouseEnter={handleCardHover}
                onMouseLeave={handleCardLeave}
            >
                <div style={sectionHeaderStyle}>
                    <BarChart3 size={24} color="#3b82f6" />
                    Rubriques & sous-rubriques
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                    <Button 
                        secondary 
                        onClick={addSection} 
                        icon={<Plus size={16} />}
                        className="animated-button"
                        onMouseEnter={handleButtonHover}
                        onMouseLeave={handleButtonLeave}
                    >
                        Ajouter une rubrique
                    </Button>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', 
                    gap: '24px' 
                }}>
                    {(config.sections || []).map((section, index) => (
                        <SectionEditor 
                            key={section.id} 
                            section={section} 
                            onChange={(patch) => updateSection(section.id, patch)} 
                            onRemove={() => removeSection(section.id)}
                            presentations={PRESENTATIONS}
                            onOpenIndicatorSelector={openIndicatorSelector}
                            onOpenVisualizationSelector={openVisualizationSelector}
                            style={{
                                animationDelay: `${index * 0.1}s`
                            }}
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
                            <Button 
                                onClick={handleAddNewProgram} 
                                primary
                                className="animated-button"
                                onMouseEnter={handleButtonHover}
                                onMouseLeave={handleButtonLeave}
                            >
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

            {/* Modal sélecteur de visualisations */}
            {showVisualizationSelector && (
                <VisualizationSelector
                    onClose={closeVisualizationSelector}
                    selectedVisualizations={getSelectedVisualizations()}
                    onAddVisualization={addVisualization}
                    onRemoveVisualization={removeVisualization}
                    onAddAll={addAllVisualizations}
                    onRemoveAll={removeAllVisualizations}
                    groupName={currentVisualizationGroup?.name || 'Groupe de visualisations'}
                    visualizations={visualizations}
                    loading={loadingVisualizations}
                />
            )}
        </div>
    )
}

// Composant SectionEditor avec animations
function SectionEditor({ section, onChange, onRemove, presentations, onOpenIndicatorSelector, onOpenVisualizationSelector, style }) {
    const update = (field, value) => {
        onChange({ ...section, [field]: value })
    }

    const addSubsection = () => {
        const newSubsection = { 
            id: crypto.randomUUID(), 
            title: "Nouvelle sous-rubrique", 
            presentation: "table",
            indicatorGroups: [],
            visualizationGroups: []
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

    const addVisualizationGroup = (subsectionId) => {
        const newGroup = {
            id: crypto.randomUUID(),
            name: '',
            selectedVisualizations: []
        }
        
        const updatedSubsection = {
            ...section.subsections.find(s => s.id === subsectionId),
            visualizationGroups: [...(section.subsections.find(s => s.id === subsectionId).visualizationGroups || []), newGroup]
        }
        
        updateSubsection(subsectionId, updatedSubsection)
    }

    const updateVisualizationGroup = (subsectionId, groupId, patch) => {
        const subsection = section.subsections.find(s => s.id === subsectionId)
        const updatedGroups = (subsection.visualizationGroups || []).map(group => 
            group.id === groupId ? { ...group, ...patch } : group
        )
        
        const updatedSubsection = {
            ...subsection,
            visualizationGroups: updatedGroups
        }
        
        updateSubsection(subsectionId, updatedSubsection)
    }

    const removeVisualizationGroup = (subsectionId, groupId) => {
        const subsection = section.subsections.find(s => s.id === subsectionId)
        const updatedGroups = (subsection.visualizationGroups || []).filter(group => group.id !== groupId)
        
        const updatedSubsection = {
            ...subsection,
            visualizationGroups: updatedGroups
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
        backgroundColor: '#f8fafc',
        transition: 'all 0.2s ease'
    }

    const visualizationGroupStyle = {
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: '#f0fdf4',
        transition: 'all 0.2s ease'
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

    const visualizationButtonStyle = {
        padding: '6px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        backgroundColor: '#f0fdf4',
        color: '#166534',
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
        margin: '2px',
        transition: 'all 0.2s ease',
        animation: 'bounceIn 0.3s ease-out'
    }

    const visualizationBadgeStyle = {
        backgroundColor: '#f0fdf4',
        color: '#166534',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'inline-block',
        margin: '2px',
        transition: 'all 0.2s ease',
        animation: 'bounceIn 0.3s ease-out'
    }

    // Styles pour les cartes
    const sectionCardStyle = {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        animation: 'fadeIn 0.4s ease-out'
    }

    const subsectionCardStyle = {
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s ease',
        animation: 'slideInRight 0.3s ease-out'
    }

    // Handlers pour les effets hover
    const handleSectionHover = (e) => {
        e.currentTarget.style.transform = 'translateX(4px)'
        e.currentTarget.style.borderLeft = '4px solid #3b82f6'
    }

    const handleSectionLeave = (e) => {
        e.currentTarget.style.transform = 'translateX(0)'
        e.currentTarget.style.borderLeft = '1px solid #e2e8f0'
    }

    const handleSubsectionHover = (e) => {
        e.currentTarget.style.backgroundColor = '#f0f4ff'
        e.currentTarget.style.transform = 'translateX(2px)'
    }

    const handleSubsectionLeave = (e) => {
        e.currentTarget.style.backgroundColor = '#f8fafc'
        e.currentTarget.style.transform = 'translateX(0)'
    }

    const handleButtonHover = (e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)'
    }

    const handleButtonLeave = (e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
    }

    const handleBadgeHover = (e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.backgroundColor = '#3b82f6'
        e.currentTarget.style.color = 'white'
    }

    const handleBadgeLeave = (e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.backgroundColor = '#dbeafe'
        e.currentTarget.style.color = '#1e40af'
    }

    const handleVisualizationBadgeHover = (e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.backgroundColor = '#10b981'
        e.currentTarget.style.color = 'white'
    }

    const handleVisualizationBadgeLeave = (e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.backgroundColor = '#f0fdf4'
        e.currentTarget.style.color = '#166534'
    }

    return (
        <div 
            style={{...sectionCardStyle, ...style}} 
            className="section-card"
            onMouseEnter={handleSectionHover}
            onMouseLeave={handleSectionLeave}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                        type="text"
                        value={section.title}
                        onChange={(e) => update('title', e.target.value)}
                        placeholder=" "
                        style={{ ...inputStyle, width: '400px' }}
                    />
                </div>
                <Button 
                    small 
                    destructive 
                    onClick={onRemove}
                    icon={<Trash2 size={16} />}
                    className="animated-button"
                    onMouseEnter={handleButtonHover}
                    onMouseLeave={handleButtonLeave}
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
                    className="animated-button"
                    onMouseEnter={handleButtonHover}
                    onMouseLeave={handleButtonLeave}
                >
                    Ajouter une sous-rubrique
                </Button>
            </div>

            {(section.subsections || []).map((subsection) => (
                <div 
                    key={subsection.id} 
                    style={subsectionCardStyle}
                    className="subsection-card"
                    onMouseEnter={handleSubsectionHover}
                    onMouseLeave={handleSubsectionLeave}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input
                                type="text"
                                value={subsection.title}
                                onChange={(e) => updateSubsection(subsection.id, { title: e.target.value })}
                                placeholder=" "
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
                            className="animated-button"
                            onMouseEnter={handleButtonHover}
                            onMouseLeave={handleButtonLeave}
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
                            className="animated-button"
                            onMouseEnter={handleButtonHover}
                            onMouseLeave={handleButtonLeave}
                        >
                            Ajouter un groupe d'indicateurs
                        </Button>

                        <Button 
                            secondary 
                            small 
                            onClick={() => addVisualizationGroup(subsection.id)} 
                            icon={<Eye size={16} />}
                            style={{ marginLeft: '8px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                            className="animated-button"
                            onMouseEnter={handleButtonHover}
                            onMouseLeave={handleButtonLeave}
                        >
                            Ajouter un visualisateur
                        </Button>
                    </div>

                    {/* Groupes d'indicateurs */}
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
                                        className="animated-button"
                                        onMouseEnter={handleButtonHover}
                                        onMouseLeave={handleButtonLeave}
                                    >
                                        Indicateurs ({group.selectedIndicators?.length || 0})
                                    </button>
                                    <Button 
                                        small 
                                        destructive 
                                        onClick={() => removeIndicatorGroup(subsection.id, group.id)}
                                        icon={<Trash2 size={16} />}
                                        className="animated-button"
                                        onMouseEnter={handleButtonHover}
                                        onMouseLeave={handleButtonLeave}
                                    >
                                        Supprimer
                                    </Button>
                                </div>
                            </div>
                            
                            {(group.selectedIndicators?.length || 0) > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {group.selectedIndicators?.map((indicator) => (
                                        <span 
                                            key={indicator.id} 
                                            style={badgeStyle}
                                            className="indicator-badge"
                                            onMouseEnter={handleBadgeHover}
                                            onMouseLeave={handleBadgeLeave}
                                        >
                                            {indicator.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Groupes de visualisations */}
                    {(subsection.visualizationGroups || []).map((group) => (
                        <div key={group.id} style={visualizationGroupStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <input
                                    type="text"
                                    value={group.name}
                                    onChange={(e) => updateVisualizationGroup(subsection.id, group.id, { name: e.target.value })}
                                    placeholder="Nom du groupe de visualisations"
                                    style={{ ...inputStyle, width: '200px' }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => onOpenVisualizationSelector(subsection.id, group.id)}
                                        style={{
                                            ...visualizationButtonStyle,
                                            backgroundColor: group.name.trim() ? '#10b981' : '#9ca3af',
                                            color: 'white',
                                            borderColor: group.name.trim() ? '#10b981' : '#9ca3af'
                                        }}
                                        disabled={!group.name.trim()}
                                        className="animated-button"
                                        onMouseEnter={handleButtonHover}
                                        onMouseLeave={handleButtonLeave}
                                    >
                                        Visualisations ({group.selectedVisualizations?.length || 0})
                                    </button>
                                    <Button 
                                        small 
                                        destructive 
                                        onClick={() => removeVisualizationGroup(subsection.id, group.id)}
                                        icon={<Trash2 size={16} />}
                                        className="animated-button"
                                        onMouseEnter={handleButtonHover}
                                        onMouseLeave={handleButtonLeave}
                                    >
                                        Supprimer
                                    </Button>
                                </div>
                            </div>
                            
                            {(group.selectedVisualizations?.length || 0) > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {group.selectedVisualizations?.map((visualization) => (
                                        <span 
                                            key={visualization.id} 
                                            style={visualizationBadgeStyle}
                                            className="visualization-badge"
                                            onMouseEnter={handleVisualizationBadgeHover}
                                            onMouseLeave={handleVisualizationBadgeLeave}
                                        >
                                            {visualization.name} ({visualization.id})
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

// Composant VisualizationSelector
function VisualizationSelector({ 
    onClose, 
    selectedVisualizations, 
    onAddVisualization, 
    onRemoveVisualization, 
    onAddAll, 
    onRemoveAll, 
    groupName,
    visualizations,
    loading 
}) {
    const [searchTerm, setSearchTerm] = useState('')
    const [availableViz, setAvailableViz] = useState([])

    useEffect(() => {
        if (visualizations && Array.isArray(visualizations)) {
            const filtered = visualizations.filter(viz => 
                !selectedVisualizations.some(selected => selected.id === viz.id)
            )
            setAvailableViz(filtered)
        }
    }, [visualizations, selectedVisualizations])

    const filteredAvailable = availableViz.filter(viz =>
        viz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        viz.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredSelected = selectedVisualizations.filter(viz =>
        viz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        viz.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleAdd = (visualization) => {
        onAddVisualization(visualization)
    }

    const handleRemove = (visualization) => {
        onRemoveVisualization(visualization)
    }

    const modalStyle = {
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
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.3s ease-out'
    }

    const contentStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        width: '900px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
        animation: 'scaleIn 0.3s ease-out',
        display: 'flex',
        flexDirection: 'column'
    }

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #f1f5f9'
    }

    const columnsStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        flex: 1,
        overflow: 'hidden'
    }

    const columnStyle = {
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden'
    }

    const columnHeaderStyle = {
        backgroundColor: '#f8fafc',
        padding: '16px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }

    const listStyle = {
        flex: 1,
        overflowY: 'auto',
        padding: '8px',
        maxHeight: '400px'
    }

    const itemStyle = {
        padding: '12px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: 'white'
    }

    const selectedItemStyle = {
        ...itemStyle,
        backgroundColor: '#f0fdf4',
        borderColor: '#bbf7d0'
    }

    const buttonStyle = {
        padding: '8px 16px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        backgroundColor: '#f8fafc',
        color: '#374151',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    }

    const handleItemHover = (e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
    }

    const handleItemLeave = (e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
    }

    const handleButtonHover = (e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
    }

    const handleButtonLeave = (e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
    }

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
                <div style={headerStyle}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                        Sélection des visualisations DHIS2 - {groupName}
                    </h3>
                    <Button 
                        small 
                        secondary 
                        onClick={onClose}
                        icon={<X size={16} />}
                    >
                        Fermer
                    </Button>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <InputField
                        placeholder="Rechercher par nom ou UID..."
                        value={searchTerm}
                        onChange={({ value }) => setSearchTerm(value)}
                        style={{ width: '100%' }}
                    />
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>Chargement des visualisations depuis DHIS2...</p>
                    </div>
                ) : (
                    <div style={columnsStyle}>
                        {/* Visualisations disponibles */}
                        <div style={columnStyle}>
                            <div style={columnHeaderStyle}>
                                <span style={{ fontWeight: '500', color: '#374151' }}>
                                    Visualisations disponibles ({filteredAvailable.length})
                                </span>
                                <button
                                    onClick={onAddAll}
                                    style={{
                                        ...buttonStyle,
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        borderColor: '#10b981'
                                    }}
                                    onMouseEnter={handleButtonHover}
                                    onMouseLeave={handleButtonLeave}
                                >
                                    Tout ajouter
                                </button>
                            </div>
                            <div style={listStyle}>
                                {filteredAvailable.map((visualization) => (
                                    <div
                                        key={visualization.id}
                                        style={itemStyle}
                                        onClick={() => handleAdd(visualization)}
                                        onMouseEnter={handleItemHover}
                                        onMouseLeave={handleItemLeave}
                                    >
                                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                            {visualization.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                            UID: {visualization.id}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                            Type: {visualization.type || 'Non spécifié'}
                                        </div>
                                    </div>
                                ))}
                                {filteredAvailable.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                        {visualizations.length === 0 
                                            ? 'Aucune visualisation trouvée dans DHIS2' 
                                            : 'Toutes les visualisations sont sélectionnées'
                                        }
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Visualisations sélectionnées */}
                        <div style={columnStyle}>
                            <div style={columnHeaderStyle}>
                                <span style={{ fontWeight: '500', color: '#374151' }}>
                                    Visualisations sélectionnées ({filteredSelected.length})
                                </span>
                                <button
                                    onClick={onRemoveAll}
                                    style={{
                                        ...buttonStyle,
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        borderColor: '#ef4444'
                                    }}
                                    onMouseEnter={handleButtonHover}
                                    onMouseLeave={handleButtonLeave}
                                >
                                    Tout retirer
                                </button>
                            </div>
                            <div style={listStyle}>
                                {filteredSelected.map((visualization) => (
                                    <div
                                        key={visualization.id}
                                        style={selectedItemStyle}
                                        onClick={() => handleRemove(visualization)}
                                        onMouseEnter={handleItemHover}
                                        onMouseLeave={handleItemLeave}
                                    >
                                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                            {visualization.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                            UID: {visualization.id}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                            Type: {visualization.type || 'Non spécifié'}
                                        </div>
                                    </div>
                                ))}
                                {filteredSelected.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                        Aucune visualisation sélectionnée
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        <strong>Information:</strong> Les visualisations sont récupérées depuis l'API DHIS2 (/api/visualizations). 
                        Chaque visualisation est identifiée par son UID unique.
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BulletinConfig