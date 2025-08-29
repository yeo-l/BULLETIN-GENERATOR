import React, { useState, useEffect } from 'react'
import { Card, DataTable, DataTableHead, DataTableBody, DataTableRow, DataTableColumnHeader, DataTableCell, Button } from '@dhis2/ui'
import { Download, Eye, Calendar } from 'lucide-react'

const BulletinHistory = () => {
    const [bulletins, setBulletins] = useState([])
    const [loading, setLoading] = useState(true)

    // Simulation de données d'historique
    useEffect(() => {
        const mockData = [
            {
                id: 1,
                title: 'Bulletin PEV - Semaine 45',
                period: '2024-W45',
                dateGenerated: '2024-11-11',
                status: 'Généré',
                program: 'PEV'
            },
            {
                id: 2,
                title: 'Bulletin PEV - Semaine 44',
                period: '2024-W44',
                dateGenerated: '2024-11-04',
                status: 'Généré',
                program: 'PEV'
            },
            {
                id: 3,
                title: 'Bulletin PEV - Semaine 43',
                period: '2024-W43',
                dateGenerated: '2024-10-28',
                status: 'Généré',
                program: 'PEV'
            }
        ]

        setTimeout(() => {
            setBulletins(mockData)
            setLoading(false)
        }, 1000)
    }, [])

    const handleDownload = (bulletinId) => {
        console.log('Téléchargement du bulletin:', bulletinId)
        // Logique de téléchargement à implémenter
    }

    const handlePreview = (bulletinId) => {
        console.log('Aperçu du bulletin:', bulletinId)
        // Logique d'aperçu à implémenter
    }

    if (loading) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Historique des Bulletins</h2>
                <div className="bg-white rounded-lg shadow p-6">
                    <p>Chargement des bulletins...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Historique des Bulletins
                </h2>
                <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                        {bulletins.length} bulletin(s) généré(s)
                    </span>
                </div>
            </div>

            <Card className="shadow-sm">
                <DataTable>
                    <DataTableHead>
                        <DataTableRow>
                            <DataTableColumnHeader>Titre</DataTableColumnHeader>
                            <DataTableColumnHeader>Période</DataTableColumnHeader>
                            <DataTableColumnHeader>Programme</DataTableColumnHeader>
                            <DataTableColumnHeader>Date de génération</DataTableColumnHeader>
                            <DataTableColumnHeader>Statut</DataTableColumnHeader>
                            <DataTableColumnHeader>Actions</DataTableColumnHeader>
                        </DataTableRow>
                    </DataTableHead>
                    <DataTableBody>
                        {bulletins.map((bulletin) => (
                            <DataTableRow key={bulletin.id}>
                                <DataTableCell>{bulletin.title}</DataTableCell>
                                <DataTableCell>{bulletin.period}</DataTableCell>
                                <DataTableCell>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {bulletin.program}
                                    </span>
                                </DataTableCell>
                                <DataTableCell>{bulletin.dateGenerated}</DataTableCell>
                                <DataTableCell>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {bulletin.status}
                                    </span>
                                </DataTableCell>
                                <DataTableCell>
                                    <div className="flex gap-2">
                                        <Button 
                                            small 
                                            secondary 
                                            onClick={() => handlePreview(bulletin.id)}
                                            icon={<Eye size={14} />}
                                        >
                                            Aperçu
                                        </Button>
                                        <Button 
                                            small 
                                            onClick={() => handleDownload(bulletin.id)}
                                            icon={<Download size={14} />}
                                        >
                                            Télécharger
                                        </Button>
                                    </div>
                                </DataTableCell>
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            </Card>

            {bulletins.length === 0 && (
                <div className="text-center py-12">
                    <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun bulletin généré
                    </h3>
                    <p className="text-gray-500">
                        Commencez par configurer et générer votre premier bulletin.
                    </p>
                </div>
            )}
        </div>
    )
}

export default BulletinHistory