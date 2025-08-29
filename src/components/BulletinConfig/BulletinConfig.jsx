import React, { useState, useCallback, useEffect } from 'react'
import { Button, Card, InputField, Checkbox, SingleSelect, MultiSelect, NoticeBox } from '@dhis2/ui'
import { Save, Download, Eye } from 'lucide-react'

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
        emailNotifications: false,
        recipients: []
    })
    const [saveStatus, setSaveStatus] = useState(null)
    const [isValid, setIsValid] = useState(false)

    // Validation en temps réel
    useEffect(() => {
        const valid = config.program && 
                     config.coverTitle && 
                     config.periodicity && 
                     config.indicators.length > 0
        setIsValid(valid)
    }, [config])

    const handleSave = useCallback(() => {
        if (!isValid) {
            setSaveStatus({ type: 'error', message: 'Veuillez remplir tous les champs obligatoires' })
            return
        }

        // Simulation de sauvegarde
        setSaveStatus({ type: 'info', message: 'Sauvegarde en cours...' })
        
        setTimeout(() => {
            console.log('Sauvegarde de la configuration:', config)
            setSaveStatus({ type: 'success', message: 'Configuration sauvegardée avec succès' })
            
            // Effacer le message après 3 secondes
            setTimeout(() => setSaveStatus(null), 3000)
        }, 1000)
    }, [config, isValid])

    const handleReset = useCallback(() => {
        setConfig({
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
            emailNotifications: false,
            recipients: []
        })
        setSaveStatus(null)
    }, [])

    const handleDiseaseChange = useCallback((diseaseValue, checked) => {
        setConfig(prev => ({
            ...prev,
            diseases: checked 
                ? [...prev.diseases, diseaseValue]
                : prev.diseases.filter(d => d !== diseaseValue)
        }))
    }, [])

    // Données de test enrichies
    const PROGRAM_OPTIONS = [
        { value: "pev", label: "PEV - Programme Élargi de Vaccination" },
        { value: "pnlt", label: "PNLT - Programme National de Lutte contre la Tuberculose" },
        { value: "pnn", label: "PNN - Programme National de Nutrition" },
        { value: "pnls", label: "PNLS - Programme National de Lutte contre le SIDA" },
        { value: "inhp", label: "INHP - Initiative Nationale de la Santé de la Population" },
        { value: "inh", label: "INH - Initiative Nationale de l'Hygiène" },
        { value: "pnsme", label: "PNSME - Programme National de Santé Maternelle et Infantile" },
    ];
      
    const PERIOD_OPTIONS = [
        { value: "WEEKLY", label: "Hebdomadaire" },
        { value: "BIWEEKLY", label: "Bimensuel" },
        { value: "MONTHLY", label: "Mensuel" },
        { value: "QUARTERLY", label: "Trimestriel" },
        { value: "YEARLY", label: "Annuel" },
    ];

    const INDICATOR_OPTIONS = [
        { value: 'bcg_coverage', label: 'Couverture BCG' },
        { value: 'dpt_coverage', label: 'Couverture DPT' },
        { value: 'polio_coverage', label: 'Couverture Polio' },
        { value: 'measles_coverage', label: 'Couverture Rougeole' },
        { value: 'yellow_fever_coverage', label: 'Couverture Fièvre Jaune' },
        { value: 'dropout_rate', label: 'Taux d\'abandon' },
        { value: 'wastage_rate', label: 'Taux de gaspillage' },
    ]

    const ORG_UNIT_OPTIONS = [
        { value: 'national', label: 'Niveau National' },
        { value: 'regional', label: 'Niveau Régional' },
        { value: 'district', label: 'Niveau District' },
        { value: 'health_center', label: 'Centre de Santé' },
    ]

    const clearSaveStatus = useCallback(() => {
        setSaveStatus(null)
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Paramétrage du Bulletin
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Configurez les paramètres pour la génération automatique de vos bulletins PEV
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        onClick={handleReset}
                        disabled={!config.program && !config.coverTitle}
                    >
                        Réinitialiser
                    </Button>
                    <Button 
                        primary 
                        onClick={handleSave} 
                        icon={<Save size={16} />}
                        disabled={!isValid}
                    >
                        Sauvegarder
                    </Button>
                </div>
            </div>
    
            {saveStatus && (
                <NoticeBox 
                    title={saveStatus.message}
                    valid={saveStatus.type === 'success'}
                    error={saveStatus.type === 'error'}
                    warning={saveStatus.type === 'warning'}
                    info={saveStatus.type === 'info'}
                    onHidden={clearSaveStatus}
                />
            )}
    
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration de base */}
                <Card className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold">Configuration de base</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <SingleSelect
                            label="Programme *"
                            selected={config.program}
                            onChange={({ selected }) => setConfig({ ...config, program: selected })}
                            options={PROGRAM_OPTIONS}
                            placeholder="Sélectionner le programme..."
                            required
                        />

                        <InputField
                            label="Titre de la page de garde *"
                            value={config.coverTitle}
                            onChange={({ value }) => setConfig({ ...config, coverTitle: value })}
                            placeholder="Ex: Bulletin PEV - Région de San-Pédro"
                            required
                        />

                        <SingleSelect
                            label="Périodicité *"
                            selected={config.periodicity}
                            onChange={({ selected }) => setConfig({ ...config, periodicity: selected })}
                            options={PERIOD_OPTIONS}
                            placeholder="Sélectionner la périodicité..."
                            required
                        />
                    </div>
                </Card>
    
                {/* Indicateurs et Favoris */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold">Indicateurs et Visualisations</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <MultiSelect
                            label="Indicateurs DHIS2 *"
                            selected={config.indicators}
                            onChange={({ selected }) => setConfig({ ...config, indicators: selected })}
                            options={INDICATOR_OPTIONS}
                            placeholder="Sélectionner les indicateurs..."
                            required
                        />
    
                        <MultiSelect
                            label="Favoris (Graphiques/Tableaux)"
                            selected={config.favorites}
                            onChange={({ selected }) => setConfig({ ...config, favorites: selected })}
                            options={[]}
                            placeholder="Sélectionner les favoris..."
                        />
    
                        <MultiSelect
                            label="Unités organisationnelles"
                            selected={config.orgUnits}
                            onChange={({ selected }) => setConfig({ ...config, orgUnits: selected })} 
                            options={ORG_UNIT_OPTIONS}
                            placeholder="Sélectionner les zones géographiques..."
                        />
                    </div>
                </Card>
            </div>
    
            {/* Automatisation */}
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold">Options d'automatisation</h3>
                </div>
                
                <div className="space-y-4">
                    <Checkbox
                        label="Génération automatique des bulletins"
                        checked={config.autoGenerate}
                        onChange={({ checked }) => setConfig({ ...config, autoGenerate: checked })}
                    />
                    
                    <Checkbox
                        label="Notifications par email"
                        checked={config.emailNotifications}
                        onChange={({ checked }) => setConfig({ ...config, emailNotifications: checked })}
                    />
                    
                    {(config.autoGenerate || config.emailNotifications) && (
                        <div className="ml-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800 mb-3">
                                Configuration des notifications et automatisation :
                            </p>
                            <div className="space-y-2">
                                {config.autoGenerate && (
                                    <>
                                        <p className="text-xs text-blue-600">
                                            • Hebdomadaire: chaque lundi à 8h00
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            • Mensuel: le 1er de chaque mois à 8h00
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            • Trimestriel: le 1er jour du trimestre à 8h00
                                        </p>
                                    </>
                                )}
                                {config.emailNotifications && (
                                    <p className="text-xs text-blue-600">
                                        • Les bulletins seront envoyés automatiquement par email
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Aperçu de la configuration */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold">Aperçu de la configuration</h3>
                    </div>
                    <Button icon={<Eye size={16} />}>
                        Prévisualiser
                    </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <strong>Programme:</strong> {config.program || 'Non défini'}
                    </div>
                    <div>
                        <strong>Périodicité:</strong> {config.periodicity || 'Non définie'}
                    </div>
                    <div>
                        <strong>Indicateurs:</strong> {config.indicators.length} sélectionné(s)
                    </div>
                    <div>
                        <strong>Automatisation:</strong> {config.autoGenerate ? 'Activée' : 'Désactivée'}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default BulletinConfig