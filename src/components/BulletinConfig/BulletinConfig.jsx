import React, { useState, useCallback, useMemo } from 'react'
import { Button, Card, InputField, Checkbox, SingleSelect, MultiSelect, NoticeBox } from '@dhis2/ui'
import { Save, CheckCircle, AlertCircle } from 'lucide-react'

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
        periodicity: ''
    })
    const [saveStatus, setSaveStatus] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    // Fonction de sauvegarde optimisée avec gestion d'erreur
    const handleSave = useCallback(async () => {
        setIsLoading(true)
        try {
            // Simulation d'une sauvegarde API
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Validation des données
            if (!config.program || !config.coverTitle || !config.periodicity) {
                throw new Error('Veuillez remplir tous les champs obligatoires')
            }
            
            console.log('Configuration sauvegardée:', config)
            setSaveStatus({ 
                type: 'success', 
                message: 'Configuration sauvegardée avec succès' 
            })
            
            // Effacer le message après 3 secondes
            setTimeout(() => setSaveStatus(null), 3000)
        } catch (error) {
            setSaveStatus({ 
                type: 'error', 
                message: error.message || 'Erreur lors de la sauvegarde' 
            })
        } finally {
            setIsLoading(false)
        }
    }, [config])

    // Gestion optimisée des changements de configuration
    const updateConfig = useCallback((field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }))
    }, [])

    // Données de configuration
    const PROGRAM_OPTIONS = useMemo(() => [
        { value: "pev", label: "PEV - Programme Élargi de Vaccination" },
        { value: "pnlt", label: "PNLT - Programme National de Lutte contre la Tuberculose" },
        { value: "pnn", label: "PNN - Programme National de Nutrition" },
        { value: "pnls", label: "PNLS - Programme National de Lutte contre le SIDA" },
        { value: "inhp", label: "INHP - Institut National d'Hygiène Publique" },
        { value: "inh", label: "INH - Institut National d'Hygiène" },
        { value: "pnsme", label: "PNSME - Programme National de Santé de la Mère et de l'Enfant" },
    ], [])
      
    const PERIOD_OPTIONS = useMemo(() => [
        { value: "WEEKLY", label: "Hebdomadaire" },
        { value: "BIWEEKLY", label: "Bimensuel" },
        { value: "MONTHLY", label: "Mensuel" },
        { value: "QUARTERLY", label: "Trimestriel" },
        { value: "YEARLY", label: "Annuel" },
    ], [])

    const TEMPLATE_OPTIONS = useMemo(() => [
        { value: 'standard', label: 'Standard - Format classique' },
        { value: 'detailed', label: 'Détaillé - Avec analyses approfondies' },
        { value: 'summary', label: 'Résumé - Format condensé' },
        { value: 'custom', label: 'Personnalisé - Format sur mesure' }
    ], [])

    // Validation du formulaire
    const isFormValid = useMemo(() => {
        return config.program && config.coverTitle && config.periodicity
    }, [config.program, config.coverTitle, config.periodicity])

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Paramétrage du Bulletin
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Configurez les paramètres de génération de vos bulletins
                        </p>
                    </div>
                    <Button 
                        primary 
                        onClick={handleSave} 
                        icon={<Save size={16} />}
                        disabled={!isFormValid || isLoading}
                        loading={isLoading}
                    >
                        {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                </div>
            </div>
      
            {saveStatus && (
                <div className="mb-6">
                    <NoticeBox 
                        title={saveStatus.message}
                        valid={saveStatus.type === 'success'}
                        error={saveStatus.type === 'error'}
                        icon={saveStatus.type === 'success' ? 
                            <CheckCircle size={24} /> : 
                            <AlertCircle size={24} />
                        }
                    />
                </div>
            )}
      
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration de base */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        Configuration de base
                    </h3>
                    
                    <div className="space-y-4">
                        <SingleSelect
                            label="Programme *"
                            selected={config.program}
                            onChange={({ selected }) => updateConfig('program', selected)}
                            options={PROGRAM_OPTIONS}
                            placeholder="Sélectionner le programme..."
                            required
                        />

                        <InputField
                            label="Titre de la page de garde *"
                            value={config.coverTitle}
                            onChange={({ value }) => updateConfig('coverTitle', value)}
                            placeholder="Ex: Bulletin de surveillance épidémiologique"
                            required
                        />

                        <SingleSelect
                            label="Périodicité *"
                            selected={config.periodicity}
                            onChange={({ selected }) => updateConfig('periodicity', selected)}
                            options={PERIOD_OPTIONS}
                            placeholder="Sélectionner la périodicité..."
                            required
                        />

                        <SingleSelect
                            label="Modèle de bulletin"
                            selected={config.template}
                            onChange={({ selected }) => updateConfig('template', selected)}
                            options={TEMPLATE_OPTIONS}
                            placeholder="Sélectionner le modèle..."
                        />
                    </div>
                </Card>
      
                {/* Indicateurs et Favoris */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        Indicateurs et Visualisations
                    </h3>
                    
                    <div className="space-y-4">
                        <MultiSelect
                            label="Indicateurs DHIS2"
                            selected={config.indicators}
                            onChange={({ selected }) => updateConfig('indicators', selected)}
                            options={[
                                { value: 'ind1', label: 'Taux de couverture vaccinale' },
                                { value: 'ind2', label: 'Nombre de cas suspects' },
                                { value: 'ind3', label: 'Taux de mortalité' },
                                { value: 'ind4', label: 'Incidence des maladies' }
                            ]}
                            placeholder="Sélectionner les indicateurs..."
                        />
      
                        <MultiSelect
                            label="Favoris (Graphiques/Tableaux)"
                            selected={config.favorites}
                            onChange={({ selected }) => updateConfig('favorites', selected)}
                            options={[
                                { value: 'fav1', label: 'Graphique évolution mensuelle' },
                                { value: 'fav2', label: 'Tableau de bord synthétique' },
                                { value: 'fav3', label: 'Carte de distribution' }
                            ]}
                            placeholder="Sélectionner les favoris..."
                        />
      
                        <MultiSelect
                            label="Unités organisationnelles"
                            selected={config.orgUnits}
                            onChange={({ selected }) => updateConfig('orgUnits', selected)}
                            options={[
                                { value: 'org1', label: 'District Sanitaire Abidjan' },
                                { value: 'org2', label: 'District Sanitaire Bouaké' },
                                { value: 'org3', label: 'District Sanitaire Yamoussoukro' }
                            ]}
                            placeholder="Sélectionner les zones géographiques..."
                        />
                    </div>
                </Card>
            </div>
      
            {/* Automatisation */}
            <Card className="p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Options d'automatisation
                </h3>
                
                <div className="space-y-4">
                    <Checkbox
                        label="Génération automatique des bulletins"
                        checked={config.autoGenerate}
                        onChange={({ checked }) => updateConfig('autoGenerate', checked)}
                    />
                    
                    {config.autoGenerate && (
                        <div className="ml-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800 mb-3">
                                Le bulletin sera généré automatiquement selon la fréquence sélectionnée.
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-blue-600" />
                                    <p className="text-xs text-blue-600">
                                        Hebdomadaire: chaque lundi à 8h00
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-blue-600" />
                                    <p className="text-xs text-blue-600">
                                        Mensuel: le 1er de chaque mois à 8h00
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-blue-600" />
                                    <p className="text-xs text-blue-600">
                                        Trimestriel: le 1er jour du trimestre à 8h00
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Informations supplémentaires */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Les champs marqués d'un astérisque (*) sont obligatoires.
                    Assurez-vous de bien configurer tous les paramètres avant de générer votre premier bulletin.
                </p>
            </div>
        </div>
    )
}

export default BulletinConfig