import React, { useState } from 'react'
import { Button, Card, InputField, Checkbox, SingleSelect, MultiSelect, NoticeBox } from '@dhis2/ui'
import { Save } from 'lucide-react'

// --------------------
// Static constants & helpers (defined outside component to avoid re-creation at every render)
// --------------------

export const PROGRAM_OPTIONS = [
    { value: 'pev', label: 'PEV' },
    { value: 'pnlt', label: 'PNLT' },
    { value: 'pnn', label: 'PNN' },
    { value: 'pnls', label: 'PNLS' },
    { value: 'inhp', label: 'INHP' },
    { value: 'inh', label: 'INH' },
    { value: 'pnsme', label: 'PNSME' },
]

export const PERIOD_OPTIONS = [
    { value: 'WEEKLY', label: 'Hebdomadaire' },
    { value: 'BIWEEKLY', label: 'Bimensuel' },
    { value: 'MONTHLY', label: 'Mensuel' },
    { value: 'YEARLY', label: 'Annuel' },
]

// Simple layout helpers
function Row({ children, className = '' }) {
    return <div className={`grid grid-cols-12 gap-4 items-center ${className}`}>{children}</div>
}

function Col({ span = 12, children, className = '' }) {
    return <div className={`col-span-${span} ${className}`}>{children}</div>
}

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

    const handleSave = () => {
        // Logique de sauvegarde à implémenter
        console.log('Sauvegarde de la configuration:', config)
        setSaveStatus({ type: 'success', message: 'Configuration sauvegardée avec succès' })
    }

    const handleDiseaseChange = (diseaseValue, checked) => {
        if (checked) {
            setConfig({ ...config, diseases: [...config.diseases, diseaseValue] })
        } else {
            setConfig({ ...config, diseases: config.diseases.filter(d => d !== diseaseValue) })
        }
    }

    const diseases = [
        { value: 'polio', label: 'Poliomyélite' },
        { value: 'measles', label: 'Rougeole' },
        { value: 'yellow_fever', label: 'Fièvre jaune' }
    ]

    const periods = [
        { value: 'weekly', label: 'Hebdomadaire' },
        { value: 'monthly', label: 'Mensuel' },
        { value: 'quarterly', label: 'Trimestriel' }
    ]

    const templates = [
        { value: 'standard', label: 'Standard' },
        { value: 'detailed', label: 'Détaillé' },
        { value: 'summary', label: 'Résumé' }
    ]

    // Row & Col declared at module level

    return (
        <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Paramétrage du Bulletin
          </h1>
          <Button 
            primary 
            onClick={handleSave} 
            icon={<Save size={16} />}
            disabled={!config.name || config.diseases.length === 0}
          >
            Sauvegarder
          </Button>
        </div>
  
        {saveStatus && (
          <NoticeBox 
            title={saveStatus.message}
            valid={saveStatus.type === 'success'}
            error={saveStatus.type === 'error'}
          />
        )}
  
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration de base */}
          <Card className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Configuration de base</h3>
            
            <div className="space-y-4">
                <SingleSelect
                    label="Programme"
                    selected={config.program}
                    onChange={({ selected }) => setConfig({ ...config, program: selected })}
                    options={PROGRAM_OPTIONS}
                    placeholder="Sélectionner le programme..."
                    defaultValue="PEV"
                />

                <InputField
                    label="Titre de la page de garde"
                    value={config.coverTitle}
                    onChange={({ value }) => setConfig({ ...config, coverTitle: value })}
                    placeholder="Saisir le titre de la page de garde..."
                />

                <SingleSelect
                    label="Périodicité"
                    selected={config.periodicity}
                    onChange={({ selected }) => setConfig({ ...config, periodicity: selected })}
                    options={PERIOD_OPTIONS}
                    placeholder="Sélectionner la périodicité..."
                    defaultValue="WEEKLY"
                />
            </div>
          </Card>
  
          {/* Indicateurs et Favoris */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Indicateurs et Visualisations</h3>
            
            <div className="space-y-4">
              <MultiSelect
                label="Indicateurs DHIS2"
                selected={config.indicators}
                onChange={({ selected }) => setConfig({ ...config, indicators: selected  })}
                options={[]}
                placeholder="Sélectionner les indicateurs..."
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
                options={[]}
                placeholder="Sélectionner les zones géographiques..."
              />
            </div>
          </Card>
        </div>
  
        {/* Automatisation */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Options d&apos;automatisation</h3>
          
          <div className="space-y-4">
            <Checkbox
              label="Génération automatique des bulletins"
              checked={config.autoGenerate}
              onChange={({ checked }) => setConfig({ ...config, autoGenerate: checked })}
            />
            
            {config.autoGenerate && (
              <div className="ml-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-3">
                  Le bulletin sera généré automatiquement selon la fréquence sélectionnée.
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-blue-600">
                    • Hebdomadaire: chaque lundi à 8h00
                  </p>
                  <p className="text-xs text-blue-600">
                    • Mensuel: le 1er de chaque mois à 8h00
                  </p>
                  <p className="text-xs text-blue-600">
                    • Trimestriel: le 1er jour du trimestre à 8h00
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    )
}

export default BulletinConfig