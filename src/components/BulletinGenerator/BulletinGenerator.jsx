import React, { useState, useCallback } from 'react'
import { Button, Card, InputField, SingleSelect, MultiSelect, NoticeBox, ProgressBar } from '@dhis2/ui'
import { Play, Download, Eye, Settings, Calendar, FileText, BarChart3 } from 'lucide-react'

const BulletinGenerator = () => {
    const [generationConfig, setGenerationConfig] = useState({
        program: '',
        period: '',
        orgUnits: [],
        indicators: [],
        template: 'standard',
        includeCharts: true,
        includeTables: true,
        includeMaps: false
    })
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationProgress, setGenerationProgress] = useState(0)
    const [generationStatus, setGenerationStatus] = useState(null)
    const [generatedBulletin, setGeneratedBulletin] = useState(null)

    const PROGRAM_OPTIONS = [
        { value: "pev", label: "PEV - Programme Élargi de Vaccination" },
        { value: "pnlt", label: "PNLT - Programme National de Lutte contre la Tuberculose" },
        { value: "pnn", label: "PNN - Programme National de Nutrition" },
        { value: "pnls", label: "PNLS - Programme National de Lutte contre le SIDA" },
    ]

    const PERIOD_OPTIONS = [
        { value: "current_week", label: "Semaine en cours" },
        { value: "current_month", label: "Mois en cours" },
        { value: "current_quarter", label: "Trimestre en cours" },
        { value: "current_year", label: "Année en cours" },
        { value: "last_week", label: "Semaine précédente" },
        { value: "last_month", label: "Mois précédent" },
        { value: "custom", label: "Période personnalisée" }
    ]

    const INDICATOR_OPTIONS = [
        { value: 'bcg_coverage', label: 'Couverture BCG' },
        { value: 'dpt_coverage', label: 'Couverture DPT' },
        { value: 'polio_coverage', label: 'Couverture Polio' },
        { value: 'measles_coverage', label: 'Couverture Rougeole' },
        { value: 'yellow_fever_coverage', label: 'Couverture Fièvre Jaune' },
        { value: 'dropout_rate', label: 'Taux d\'abandon' },
        { value: 'wastage_rate', label: 'Taux de gaspillage' },
        { value: 'vaccination_targets', label: 'Objectifs de vaccination' }
    ]

    const ORG_UNIT_OPTIONS = [
        { value: 'national', label: 'Niveau National' },
        { value: 'regional', label: 'Niveau Régional' },
        { value: 'district', label: 'Niveau District' },
        { value: 'health_center', label: 'Centre de Santé' },
    ]

    const TEMPLATE_OPTIONS = [
        { value: 'standard', label: 'Standard' },
        { value: 'detailed', label: 'Détaillé' },
        { value: 'summary', label: 'Résumé' },
        { value: 'executive', label: 'Exécutif' }
    ]

    const handleGenerate = useCallback(async () => {
        if (!generationConfig.program || !generationConfig.period || generationConfig.indicators.length === 0) {
            setGenerationStatus({ type: 'error', message: 'Veuillez remplir tous les champs obligatoires' })
            return
        }

        setIsGenerating(true)
        setGenerationProgress(0)
        setGenerationStatus({ type: 'info', message: 'Génération du bulletin en cours...' })

        // Simulation de génération avec progression
        const steps = [
            'Récupération des données...',
            'Calcul des indicateurs...',
            'Génération des graphiques...',
            'Création du document...',
            'Finalisation...'
        ]

        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            setGenerationProgress(((i + 1) / steps.length) * 100)
            setGenerationStatus({ type: 'info', message: steps[i] })
        }

        // Simulation de succès
        const bulletin = {
            id: Date.now(),
            title: `Bulletin ${generationConfig.program} - ${new Date().toLocaleDateString('fr-FR')}`,
            size: '2.4 MB',
            generatedAt: new Date().toISOString(),
            config: generationConfig
        }

        setGeneratedBulletin(bulletin)
        setGenerationStatus({ type: 'success', message: 'Bulletin généré avec succès !' })
        setIsGenerating(false)
    }, [generationConfig])

    const handleDownload = useCallback(() => {
        if (generatedBulletin) {
            console.log('Téléchargement du bulletin:', generatedBulletin.id)
            // Logique de téléchargement
        }
    }, [generatedBulletin])

    const handlePreview = useCallback(() => {
        if (generatedBulletin) {
            console.log('Prévisualisation du bulletin:', generatedBulletin.id)
            // Logique de prévisualisation
        }
    }, [generatedBulletin])

    const clearStatus = useCallback(() => {
        setGenerationStatus(null)
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Générer un Bulletin
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Créez un nouveau bulletin PEV avec vos paramètres personnalisés
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        icon={<Settings size={16} />}
                        onClick={() => window.location.href = '#config'}
                    >
                        Paramètres
                    </Button>
                </div>
            </div>

            {generationStatus && (
                <NoticeBox 
                    title={generationStatus.message}
                    valid={generationStatus.type === 'success'}
                    error={generationStatus.type === 'error'}
                    warning={generationStatus.type === 'warning'}
                    info={generationStatus.type === 'info'}
                    onHidden={clearStatus}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration de génération */}
                <Card className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Settings size={20} className="text-blue-500" />
                        <h3 className="text-lg font-semibold">Configuration</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <SingleSelect
                            label="Programme *"
                            selected={generationConfig.program}
                            onChange={({ selected }) => setGenerationConfig({ ...generationConfig, program: selected })}
                            options={PROGRAM_OPTIONS}
                            placeholder="Sélectionner le programme..."
                            required
                        />

                        <SingleSelect
                            label="Période *"
                            selected={generationConfig.period}
                            onChange={({ selected }) => setGenerationConfig({ ...generationConfig, period: selected })}
                            options={PERIOD_OPTIONS}
                            placeholder="Sélectionner la période..."
                            required
                        />

                        <MultiSelect
                            label="Indicateurs *"
                            selected={generationConfig.indicators}
                            onChange={({ selected }) => setGenerationConfig({ ...generationConfig, indicators: selected })}
                            options={INDICATOR_OPTIONS}
                            placeholder="Sélectionner les indicateurs..."
                            required
                        />

                        <MultiSelect
                            label="Unités organisationnelles"
                            selected={generationConfig.orgUnits}
                            onChange={({ selected }) => setGenerationConfig({ ...generationConfig, orgUnits: selected })}
                            options={ORG_UNIT_OPTIONS}
                            placeholder="Sélectionner les zones géographiques..."
                        />

                        <SingleSelect
                            label="Template"
                            selected={generationConfig.template}
                            onChange={({ selected }) => setGenerationConfig({ ...generationConfig, template: selected })}
                            options={TEMPLATE_OPTIONS}
                            placeholder="Sélectionner le template..."
                        />
                    </div>
                </Card>

                {/* Options de contenu */}
                <Card className="space-y-6">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={20} className="text-green-500" />
                        <h3 className="text-lg font-semibold">Contenu du bulletin</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-3">Éléments à inclure :</h4>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={generationConfig.includeCharts}
                                        onChange={(e) => setGenerationConfig({ 
                                            ...generationConfig, 
                                            includeCharts: e.target.checked 
                                        })}
                                    />
                                    <span>Graphiques et visualisations</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={generationConfig.includeTables}
                                        onChange={(e) => setGenerationConfig({ 
                                            ...generationConfig, 
                                            includeTables: e.target.checked 
                                        })}
                                    />
                                    <span>Tableaux de données</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={generationConfig.includeMaps}
                                        onChange={(e) => setGenerationConfig({ 
                                            ...generationConfig, 
                                            includeMaps: e.target.checked 
                                        })}
                                    />
                                    <span>Cartes géographiques</span>
                                </label>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium mb-2 text-blue-800">Informations :</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Le bulletin sera généré au format PDF</li>
                                <li>• Temps de génération estimé : 2-3 minutes</li>
                                <li>• Vous recevrez une notification une fois terminé</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Bouton de génération */}
            <Card className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Générer le bulletin</h3>
                        <p className="text-gray-600 mt-1">
                            Cliquez sur le bouton ci-dessous pour lancer la génération
                        </p>
                    </div>
                    <Button
                        primary
                        large
                        icon={<Play size={20} />}
                        onClick={handleGenerate}
                        disabled={isGenerating || !generationConfig.program || !generationConfig.period || generationConfig.indicators.length === 0}
                    >
                        {isGenerating ? 'Génération...' : 'Générer le bulletin'}
                    </Button>
                </div>

                {isGenerating && (
                    <div className="mt-4">
                        <ProgressBar value={generationProgress} />
                        <p className="text-sm text-gray-600 mt-2">
                            Progression : {Math.round(generationProgress)}%
                        </p>
                    </div>
                )}
            </Card>

            {/* Résultat de génération */}
            {generatedBulletin && (
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText size={20} className="text-green-500" />
                        <h3 className="text-lg font-semibold">Bulletin généré</h3>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-green-800">{generatedBulletin.title}</h4>
                                <p className="text-sm text-green-600 mt-1">
                                    Taille : {generatedBulletin.size} • 
                                    Généré le : {new Date(generatedBulletin.generatedAt).toLocaleString('fr-FR')}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    icon={<Eye size={16} />}
                                    onClick={handlePreview}
                                >
                                    Prévisualiser
                                </Button>
                                <Button
                                    primary
                                    icon={<Download size={16} />}
                                    onClick={handleDownload}
                                >
                                    Télécharger
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Aperçu de la configuration */}
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar size={20} className="text-purple-500" />
                    <h3 className="text-lg font-semibold">Aperçu de la configuration</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <strong>Programme:</strong> {generationConfig.program || 'Non défini'}
                    </div>
                    <div>
                        <strong>Période:</strong> {generationConfig.period || 'Non définie'}
                    </div>
                    <div>
                        <strong>Indicateurs:</strong> {generationConfig.indicators.length} sélectionné(s)
                    </div>
                    <div>
                        <strong>Template:</strong> {generationConfig.template}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default BulletinGenerator