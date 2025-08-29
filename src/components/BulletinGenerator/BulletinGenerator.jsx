import React, { useState, useCallback } from 'react'
import { Button, Card, SingleSelect, NoticeBox, CircularLoader } from '@dhis2/ui'
import { FileText, Download, Settings, Calendar, CheckCircle } from 'lucide-react'

const BulletinGenerator = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('')
    const [selectedOrgUnit, setSelectedOrgUnit] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationStatus, setGenerationStatus] = useState(null)
    const [generatedBulletin, setGeneratedBulletin] = useState(null)

    // Options de période (simulées)
    const periodOptions = [
        { value: '2024W45', label: 'Semaine 45, 2024 (04 Nov - 10 Nov)' },
        { value: '2024W44', label: 'Semaine 44, 2024 (28 Oct - 03 Nov)' },
        { value: '2024W43', label: 'Semaine 43, 2024 (21 Oct - 27 Oct)' },
        { value: '2024W42', label: 'Semaine 42, 2024 (14 Oct - 20 Oct)' }
    ]

    // Options d'unités organisationnelles (simulées)
    const orgUnitOptions = [
        { value: 'ci', label: 'Côte d\'Ivoire' },
        { value: 'abidjan', label: 'District d\'Abidjan' },
        { value: 'bouake', label: 'Région de Bouaké' },
        { value: 'yamoussoukro', label: 'Région de Yamoussoukro' }
    ]

    const handleGenerate = useCallback(async () => {
        if (!selectedPeriod || !selectedOrgUnit) {
            setGenerationStatus({
                type: 'error',
                message: 'Veuillez sélectionner une période et une unité organisationnelle'
            })
            return
        }

        setIsGenerating(true)
        setGenerationStatus({ type: 'info', message: 'Génération du bulletin en cours...' })

        try {
            // Simulation de la génération (remplacer par l'appel API réel)
            await new Promise(resolve => setTimeout(resolve, 3000))

            const bulletin = {
                id: Date.now(),
                title: `Bulletin PEV - ${periodOptions.find(p => p.value === selectedPeriod)?.label}`,
                period: selectedPeriod,
                orgUnit: selectedOrgUnit,
                dateGenerated: new Date().toLocaleDateString('fr-FR'),
                downloadUrl: '#' // URL de téléchargement simulée
            }

            setGeneratedBulletin(bulletin)
            setGenerationStatus({
                type: 'success',
                message: 'Bulletin généré avec succès !'
            })
        } catch (error) {
            setGenerationStatus({
                type: 'error',
                message: 'Erreur lors de la génération du bulletin'
            })
        } finally {
            setIsGenerating(false)
        }
    }, [selectedPeriod, selectedOrgUnit, periodOptions])

    const handleDownload = useCallback(() => {
        if (generatedBulletin) {
            console.log('Téléchargement du bulletin:', generatedBulletin.id)
            // Logique de téléchargement à implémenter
        }
    }, [generatedBulletin])

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    Générer un Bulletin
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Settings size={16} />
                    <span>Assurez-vous d'avoir configuré les paramètres</span>
                </div>
            </div>

            {generationStatus && (
                <NoticeBox
                    title={generationStatus.message}
                    valid={generationStatus.type === 'success'}
                    error={generationStatus.type === 'error'}
                    warning={generationStatus.type === 'info'}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sélection des paramètres */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Calendar size={20} />
                        Paramètres de génération
                    </h3>
                    
                    <div className="space-y-4">
                        <SingleSelect
                            label="Période de données"
                            selected={selectedPeriod}
                            onChange={({ selected }) => setSelectedPeriod(selected)}
                            options={periodOptions}
                            placeholder="Sélectionner la période..."
                            filterable
                        />

                        <SingleSelect
                            label="Unité organisationnelle"
                            selected={selectedOrgUnit}
                            onChange={({ selected }) => setSelectedOrgUnit(selected)}
                            options={orgUnitOptions}
                            placeholder="Sélectionner l'unité organisationnelle..."
                            filterable
                        />

                        <div className="pt-4">
                            <Button
                                primary
                                large
                                onClick={handleGenerate}
                                disabled={isGenerating || !selectedPeriod || !selectedOrgUnit}
                                icon={isGenerating ? <CircularLoader small /> : <FileText size={16} />}
                            >
                                {isGenerating ? 'Génération en cours...' : 'Générer le bulletin'}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Aperçu et téléchargement */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Download size={20} />
                        Résultat
                    </h3>

                    {!generatedBulletin && !isGenerating && (
                        <div className="text-center py-12">
                            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                            <h4 className="text-md font-medium text-gray-900 mb-2">
                                Aucun bulletin généré
                            </h4>
                            <p className="text-sm text-gray-500">
                                Sélectionnez les paramètres et cliquez sur "Générer"
                            </p>
                        </div>
                    )}

                    {isGenerating && (
                        <div className="text-center py-12">
                            <CircularLoader />
                            <p className="mt-4 text-sm text-gray-600">
                                Traitement des données en cours...
                            </p>
                        </div>
                    )}

                    {generatedBulletin && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle size={20} />
                                <span className="font-medium">Bulletin généré avec succès</span>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900">{generatedBulletin.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Généré le {generatedBulletin.dateGenerated}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Zone: {orgUnitOptions.find(o => o.value === generatedBulletin.orgUnit)?.label}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    secondary
                                    onClick={() => console.log('Aperçu du bulletin')}
                                    icon={<FileText size={16} />}
                                >
                                    Aperçu
                                </Button>
                                <Button
                                    primary
                                    onClick={handleDownload}
                                    icon={<Download size={16} />}
                                >
                                    Télécharger PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Instructions d'utilisation */}
            <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-900">
                    Instructions d'utilisation
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">1.</span>
                        <span>Sélectionnez la période pour laquelle vous souhaitez générer le bulletin</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">2.</span>
                        <span>Choisissez l'unité organisationnelle (région, district, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">3.</span>
                        <span>Cliquez sur "Générer le bulletin" pour lancer le processus</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">4.</span>
                        <span>Téléchargez le bulletin généré au format PDF</span>
                    </li>
                </ul>
            </Card>
        </div>
    )
}

export default BulletinGenerator