import { Menu, MenuItem } from '@dhis2/ui'
import React, { useState } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import BulletinConfig from './BulletinConfig/BulletinConfig'
import BulletinGenerator from './BulletinGenerator/BulletinGenerator'
import BulletinHistory from './BulletinHistory/BulletinHistory'
import { FileText, Settings, History } from 'lucide-react'

const SystemInfo = () => {
    const { error, loading, data } = useDataQuery({
        systemInfo: {
            resource: 'system/info',
        },
    })

    const [activeTab, setActiveTab] = useState('generate')
    const [configToEdit, setConfigToEdit] = useState(null)

    const menuItems = [
        { id: 'config', label: 'Paramétrage', icon: Settings },
        { id: 'generate', label: 'Générer Bulletin', icon: FileText },
        { id: 'history', label: 'Historique', icon: History }
    ]

    // Fonction pour naviguer vers un onglet avec une configuration à modifier
    const handleNavigateToConfig = (config) => {
    setConfigToEdit(config) // config peut être null pour une nouvelle configuration
    setActiveView('config') // Naviguer vers l'onglet de configuration
    }

    // Fonction appelée quand une configuration est sauvegardée
    const handleConfigSaved = () => {
        console.log('Configuration sauvegardée, retour à l\'historique')
        setConfigToEdit(null)
        setActiveTab('history')
    }

    if (error) {
        return (
            <div style={{ 
                padding: '20px', 
                backgroundColor: '#fee', 
                border: '1px solid #fcc',
                borderRadius: '8px',
                margin: '20px'
            }}>
                <h3 style={{ color: '#c00' }}>Erreur de connexion</h3>
                <p>Impossible de récupérer les informations système.</p>
                <details>
                    <summary>Détails de l'erreur</summary>
                    <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                        {JSON.stringify(error, null, 2)}
                    </pre>
                </details>
            </div>
        )
    }

    if (loading) {
        return (
            <div style={{ 
                padding: '20px', 
                textAlign: 'center'
            }}>
                <p>Chargement des informations système...</p>
            </div>
        )
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'config':
                return (
                    <BulletinConfig 
                        configToEdit={configToEdit} 
                        onConfigSaved={handleConfigSaved}
                    />
                )
            case 'generate':
                return <BulletinGenerator />
            case 'history':
                return (
                    <BulletinHistory 
                        onNavigateToConfig={handleNavigateToConfig}
                    />
                )
            default:
                return <BulletinGenerator />
        }
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Menu latéral */}
            <div style={{
                width: '260px',
                backgroundColor: '#1e293b',
                color: 'white',
                boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '24px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h2 style={{ 
                        fontSize: '20px', 
                        fontWeight: '700',
                        margin: 0,
                        color: 'white'
                    }}>
                        Bulletin DHIS2
                    </h2>
                    <p style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        margin: '4px 0 0 0'
                    }}>
                        Génération automatique
                    </p>
                </div>
                
                <div style={{ flex: 1, padding: '16px 0' }}>
                    <Menu>
                        {menuItems.map(item => {
                            const Icon = item.icon
                            return (
                                <MenuItem
                                    key={item.id}
                                    label={
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '12px',
                                            color: activeTab === item.id ? '#f97316' : 'white'
                                        }}>
                                            <Icon size={18} />
                                            <span>{item.label}</span>
                                        </div>
                                    }
                                    active={activeTab === item.id}
                                    onClick={() => {
                                        setActiveTab(item.id)
                                        // Réinitialiser la configuration à éditer quand on change d'onglet via le menu
                                        if (item.id !== 'config') {
                                            setConfigToEdit(null)
                                        }
                                    }}
                                />
                            )
                        })}
                    </Menu>
                </div>
            </div>

            {/* Contenu principal */}
            <div style={{ 
                flex: 1, 
                overflow: 'auto',
                backgroundColor: '#f8fafc'
            }}>
                {renderContent()}
            </div>
        </div>
    )
}

export default SystemInfo