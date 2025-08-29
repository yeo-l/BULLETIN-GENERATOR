import React, { useState, useCallback } from 'react'
import { Button, Card, InputField, SingleSelect, Table, TableHead, TableRowHead, TableCellHead, TableBody, TableRow, TableCell, Chip, NoticeBox } from '@dhis2/ui'
import { Download, Eye, Trash2, Filter, Search, Calendar, FileText } from 'lucide-react'

const BulletinHistory = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [periodFilter, setPeriodFilter] = useState('all')
    const [selectedBulletins, setSelectedBulletins] = useState([])

    // Données de test pour l'historique
    const [bulletins] = useState([
        {
            id: 1,
            title: 'Bulletin PEV - Semaine 1 - Janvier 2024',
            program: 'PEV',
            period: 'Semaine 1',
            date: '2024-01-08',
            status: 'completed',
            size: '2.3 MB',
            downloads: 15,
            generatedBy: 'Dr. Konan',
            indicators: ['BCG', 'DPT', 'Polio']
        },
        {
            id: 2,
            title: 'Bulletin PEV - Semaine 2 - Janvier 2024',
            program: 'PEV',
            period: 'Semaine 2',
            date: '2024-01-15',
            status: 'completed',
            size: '2.1 MB',
            downloads: 12,
            generatedBy: 'Dr. Konan',
            indicators: ['BCG', 'DPT', 'Polio', 'Rougeole']
        },
        {
            id: 3,
            title: 'Bulletin PEV - Semaine 3 - Janvier 2024',
            program: 'PEV',
            period: 'Semaine 3',
            date: '2024-01-22',
            status: 'processing',
            size: '--',
            downloads: 0,
            generatedBy: 'Dr. Konan',
            indicators: ['BCG', 'DPT', 'Polio']
        },
        {
            id: 4,
            title: 'Bulletin PEV - Décembre 2023',
            program: 'PEV',
            period: 'Mensuel',
            date: '2024-01-01',
            status: 'completed',
            size: '3.2 MB',
            downloads: 28,
            generatedBy: 'Dr. Konan',
            indicators: ['BCG', 'DPT', 'Polio', 'Rougeole', 'Fièvre Jaune']
        },
        {
            id: 5,
            title: 'Bulletin PEV - Novembre 2023',
            program: 'PEV',
            period: 'Mensuel',
            date: '2023-12-01',
            status: 'completed',
            size: '2.8 MB',
            downloads: 22,
            generatedBy: 'Dr. Konan',
            indicators: ['BCG', 'DPT', 'Polio', 'Rougeole']
        }
    ])

    const handleDownload = useCallback((bulletinId) => {
        console.log('Téléchargement du bulletin:', bulletinId)
        // Logique de téléchargement
    }, [])

    const handleView = useCallback((bulletinId) => {
        console.log('Visualisation du bulletin:', bulletinId)
        // Logique de visualisation
    }, [])

    const handleDelete = useCallback((bulletinId) => {
        console.log('Suppression du bulletin:', bulletinId)
        // Logique de suppression
    }, [])

    const handleBulkDownload = useCallback(() => {
        console.log('Téléchargement en lot:', selectedBulletins)
        // Logique de téléchargement en lot
    }, [selectedBulletins])

    const handleBulkDelete = useCallback(() => {
        console.log('Suppression en lot:', selectedBulletins)
        // Logique de suppression en lot
    }, [selectedBulletins])

    const handleSelectAll = useCallback((checked) => {
        if (checked) {
            setSelectedBulletins(bulletins.map(b => b.id))
        } else {
            setSelectedBulletins([])
        }
    }, [bulletins])

    const handleSelectBulletin = useCallback((bulletinId, checked) => {
        if (checked) {
            setSelectedBulletins(prev => [...prev, bulletinId])
        } else {
            setSelectedBulletins(prev => prev.filter(id => id !== bulletinId))
        }
    }, [])

    // Filtrage des bulletins
    const filteredBulletins = bulletins.filter(bulletin => {
        const matchesSearch = bulletin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            bulletin.program.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || bulletin.status === statusFilter
        const matchesPeriod = periodFilter === 'all' || bulletin.period === periodFilter
        
        return matchesSearch && matchesStatus && matchesPeriod
    })

    const getStatusChip = (status) => {
        const statusConfig = {
            completed: { label: 'Terminé', color: 'positive' },
            processing: { label: 'En cours', color: 'warning' },
            failed: { label: 'Échec', color: 'negative' }
        }
        const config = statusConfig[status] || { label: status, color: 'default' }
        return <Chip {...config} />
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Historique des Bulletins
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Consultez et gérez tous vos bulletins générés
                    </p>
                </div>
                <div className="flex gap-2">
                    {selectedBulletins.length > 0 && (
                        <>
                            <Button 
                                icon={<Download size={16} />}
                                onClick={handleBulkDownload}
                            >
                                Télécharger ({selectedBulletins.length})
                            </Button>
                            <Button 
                                destructive
                                icon={<Trash2 size={16} />}
                                onClick={handleBulkDelete}
                            >
                                Supprimer ({selectedBulletins.length})
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Filtres */}
            <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <Filter size={20} className="text-gray-500" />
                    <h3 className="text-lg font-semibold">Filtres</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <InputField
                            placeholder="Rechercher un bulletin..."
                            value={searchTerm}
                            onChange={({ value }) => setSearchTerm(value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                    
                    <SingleSelect
                        label="Statut"
                        selected={statusFilter}
                        onChange={({ selected }) => setStatusFilter(selected)}
                        options={[
                            { value: 'all', label: 'Tous les statuts' },
                            { value: 'completed', label: 'Terminé' },
                            { value: 'processing', label: 'En cours' },
                            { value: 'failed', label: 'Échec' }
                        ]}
                    />
                    
                    <SingleSelect
                        label="Période"
                        selected={periodFilter}
                        onChange={({ selected }) => setPeriodFilter(selected)}
                        options={[
                            { value: 'all', label: 'Toutes les périodes' },
                            { value: 'Semaine 1', label: 'Semaine 1' },
                            { value: 'Semaine 2', label: 'Semaine 2' },
                            { value: 'Semaine 3', label: 'Semaine 3' },
                            { value: 'Mensuel', label: 'Mensuel' }
                        ]}
                    />
                    
                    <div className="flex items-end">
                        <Button onClick={() => {
                            setSearchTerm('')
                            setStatusFilter('all')
                            setPeriodFilter('all')
                        }}>
                            Réinitialiser
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Tableau des bulletins */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <FileText size={20} className="text-gray-500" />
                        <h3 className="text-lg font-semibold">
                            Bulletins ({filteredBulletins.length})
                        </h3>
                    </div>
                </div>

                {filteredBulletins.length === 0 ? (
                    <NoticeBox title="Aucun bulletin trouvé" info>
                        Aucun bulletin ne correspond aux critères de recherche.
                    </NoticeBox>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRowHead>
                                <TableCellHead>
                                    <input
                                        type="checkbox"
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        checked={selectedBulletins.length === filteredBulletins.length}
                                    />
                                </TableCellHead>
                                <TableCellHead>Titre</TableCellHead>
                                <TableCellHead>Programme</TableCellHead>
                                <TableCellHead>Période</TableCellHead>
                                <TableCellHead>Date</TableCellHead>
                                <TableCellHead>Statut</TableCellHead>
                                <TableCellHead>Taille</TableCellHead>
                                <TableCellHead>Téléchargements</TableCellHead>
                                <TableCellHead>Actions</TableCellHead>
                            </TableRowHead>
                        </TableHead>
                        <TableBody>
                            {filteredBulletins.map((bulletin) => (
                                <TableRow key={bulletin.id}>
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            checked={selectedBulletins.includes(bulletin.id)}
                                            onChange={(e) => handleSelectBulletin(bulletin.id, e.target.checked)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{bulletin.title}</div>
                                            <div className="text-sm text-gray-500">
                                                Généré par {bulletin.generatedBy}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={bulletin.program} />
                                    </TableCell>
                                    <TableCell>{bulletin.period}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} className="text-gray-400" />
                                            {formatDate(bulletin.date)}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusChip(bulletin.status)}</TableCell>
                                    <TableCell>{bulletin.size}</TableCell>
                                    <TableCell>{bulletin.downloads}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                small
                                                icon={<Eye size={14} />}
                                                onClick={() => handleView(bulletin.id)}
                                                title="Visualiser"
                                            />
                                            <Button
                                                small
                                                icon={<Download size={14} />}
                                                onClick={() => handleDownload(bulletin.id)}
                                                title="Télécharger"
                                                disabled={bulletin.status !== 'completed'}
                                            />
                                            <Button
                                                small
                                                destructive
                                                icon={<Trash2 size={14} />}
                                                onClick={() => handleDelete(bulletin.id)}
                                                title="Supprimer"
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{bulletins.length}</div>
                        <div className="text-sm text-gray-600">Total des bulletins</div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {bulletins.filter(b => b.status === 'completed').length}
                        </div>
                        <div className="text-sm text-gray-600">Terminés</div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {bulletins.filter(b => b.status === 'processing').length}
                        </div>
                        <div className="text-sm text-gray-600">En cours</div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">
                            {bulletins.reduce((sum, b) => sum + b.downloads, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Téléchargements</div>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default BulletinHistory