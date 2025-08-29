import React, { useState, useMemo } from 'react'
import { Button, DataTable, DataTableRow, DataTableCell, DataTableHead, DataTableBody, Tag, InputField } from '@dhis2/ui'
import { Download, Eye, Trash2, Search, Calendar, Filter } from 'lucide-react'

const BulletinHistory = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterPeriod, setFilterPeriod] = useState('all')
    
    // Données simulées pour l'historique
    const bulletins = [
        {
            id: 1,
            name: 'Bulletin PEV - Semaine 45',
            date: '2024-11-10',
            period: 'Hebdomadaire',
            status: 'Complété',
            program: 'PEV',
            size: '2.5 MB',
            author: 'Dr. Kouassi'
        },
        {
            id: 2,
            name: 'Bulletin PEV - Octobre 2024',
            date: '2024-11-01',
            period: 'Mensuel',
            status: 'Complété',
            program: 'PEV',
            size: '4.8 MB',
            author: 'Dr. Kouassi'
        },
        {
            id: 3,
            name: 'Bulletin PNLT - Q3 2024',
            date: '2024-10-01',
            period: 'Trimestriel',
            status: 'Complété',
            program: 'PNLT',
            size: '6.2 MB',
            author: 'Dr. Diallo'
        },
        {
            id: 4,
            name: 'Bulletin PNN - Septembre 2024',
            date: '2024-09-30',
            period: 'Mensuel',
            status: 'En cours',
            program: 'PNN',
            size: '3.1 MB',
            author: 'Dr. Bamba'
        },
        {
            id: 5,
            name: 'Bulletin PEV - Semaine 38',
            date: '2024-09-20',
            period: 'Hebdomadaire',
            status: 'Complété',
            program: 'PEV',
            size: '2.3 MB',
            author: 'Dr. Kouassi'
        }
    ]

    // Filtrage des bulletins
    const filteredBulletins = useMemo(() => {
        return bulletins.filter(bulletin => {
            const matchesSearch = bulletin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 bulletin.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 bulletin.author.toLowerCase().includes(searchTerm.toLowerCase())
            
            const matchesPeriod = filterPeriod === 'all' || bulletin.period === filterPeriod
            
            return matchesSearch && matchesPeriod
        })
    }, [searchTerm, filterPeriod, bulletins])

    // Gestion des actions
    const handleView = (id) => {
        console.log('Visualiser le bulletin:', id)
        // Logique pour visualiser le bulletin
    }

    const handleDownload = (id) => {
        console.log('Télécharger le bulletin:', id)
        // Logique pour télécharger le bulletin
    }

    const handleDelete = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bulletin ?')) {
            console.log('Supprimer le bulletin:', id)
            // Logique pour supprimer le bulletin
        }
    }

    const getStatusColor = (status) => {
        switch(status) {
            case 'Complété': return 'positive'
            case 'En cours': return 'neutral'
            case 'Erreur': return 'negative'
            default: return 'default'
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Historique des Bulletins
                </h2>
                <p className="text-gray-600">
                    Consultez et gérez tous les bulletins générés
                </p>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <InputField
                            label=""
                            value={searchTerm}
                            onChange={({ value }) => setSearchTerm(value)}
                            placeholder="Rechercher par nom, programme ou auteur..."
                            inputWidth="100%"
                            leftIcon={<Search size={18} />}
                        />
                    </div>
                    <div>
                        <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filterPeriod}
                            onChange={(e) => setFilterPeriod(e.target.value)}
                        >
                            <option value="all">Toutes les périodes</option>
                            <option value="Hebdomadaire">Hebdomadaire</option>
                            <option value="Mensuel">Mensuel</option>
                            <option value="Trimestriel">Trimestriel</option>
                            <option value="Annuel">Annuel</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total bulletins</p>
                            <p className="text-2xl font-bold text-gray-900">{bulletins.length}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Calendar size={24} className="text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Ce mois</p>
                            <p className="text-2xl font-bold text-gray-900">2</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <Filter size={24} className="text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Complétés</p>
                            <p className="text-2xl font-bold text-gray-900">4</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <Eye size={24} className="text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">En cours</p>
                            <p className="text-2xl font-bold text-gray-900">1</p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-full">
                            <Download size={24} className="text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tableau des bulletins */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <DataTable>
                    <DataTableHead>
                        <DataTableRow>
                            <DataTableCell>Nom du bulletin</DataTableCell>
                            <DataTableCell>Programme</DataTableCell>
                            <DataTableCell>Date</DataTableCell>
                            <DataTableCell>Période</DataTableCell>
                            <DataTableCell>Auteur</DataTableCell>
                            <DataTableCell>Statut</DataTableCell>
                            <DataTableCell>Taille</DataTableCell>
                            <DataTableCell>Actions</DataTableCell>
                        </DataTableRow>
                    </DataTableHead>
                    <DataTableBody>
                        {filteredBulletins.length > 0 ? (
                            filteredBulletins.map(bulletin => (
                                <DataTableRow key={bulletin.id}>
                                    <DataTableCell>
                                        <span className="font-medium">{bulletin.name}</span>
                                    </DataTableCell>
                                    <DataTableCell>
                                        <Tag>{bulletin.program}</Tag>
                                    </DataTableCell>
                                    <DataTableCell>{bulletin.date}</DataTableCell>
                                    <DataTableCell>{bulletin.period}</DataTableCell>
                                    <DataTableCell>{bulletin.author}</DataTableCell>
                                    <DataTableCell>
                                        <Tag valid={getStatusColor(bulletin.status) === 'positive'}
                                             neutral={getStatusColor(bulletin.status) === 'neutral'}
                                             negative={getStatusColor(bulletin.status) === 'negative'}>
                                            {bulletin.status}
                                        </Tag>
                                    </DataTableCell>
                                    <DataTableCell>{bulletin.size}</DataTableCell>
                                    <DataTableCell>
                                        <div className="flex gap-2">
                                            <Button 
                                                small 
                                                onClick={() => handleView(bulletin.id)}
                                                icon={<Eye size={16} />}
                                                title="Visualiser"
                                            />
                                            <Button 
                                                small 
                                                primary
                                                onClick={() => handleDownload(bulletin.id)}
                                                icon={<Download size={16} />}
                                                title="Télécharger"
                                            />
                                            <Button 
                                                small 
                                                destructive
                                                onClick={() => handleDelete(bulletin.id)}
                                                icon={<Trash2 size={16} />}
                                                title="Supprimer"
                                            />
                                        </div>
                                    </DataTableCell>
                                </DataTableRow>
                            ))
                        ) : (
                            <DataTableRow>
                                <DataTableCell colSpan="8">
                                    <div className="text-center py-8 text-gray-500">
                                        Aucun bulletin trouvé
                                    </div>
                                </DataTableCell>
                            </DataTableRow>
                        )}
                    </DataTableBody>
                </DataTable>
            </div>

            {/* Pagination (si nécessaire) */}
            {filteredBulletins.length > 10 && (
                <div className="mt-4 flex justify-center">
                    <div className="flex gap-2">
                        <Button small>Précédent</Button>
                        <Button small primary>1</Button>
                        <Button small>2</Button>
                        <Button small>3</Button>
                        <Button small>Suivant</Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BulletinHistory