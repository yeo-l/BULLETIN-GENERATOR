import {
    Menu,
    MenuItem,
    HeaderBar,
    Button
  } from '@dhis2/ui'
import React, { useState } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
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

    const [activeTab, setActiveTab] = useState('config');

    const menuItems = [
        { id: 'config', label: 'Paramétrage', icon: Settings },
        { id: 'generate', label: 'Générer Bulletin', icon: FileText },
        { id: 'history', label: 'Historique', icon: History }
      ]

    if (error) {
        return (
            <div style={{ 
                padding: '20px', 
                backgroundColor: '#f8d7da', 
                border: '1px solid #f5c6cb',
                borderRadius: '5px',
                margin: '10px 0'
            }}>
                <h3>Erreur de connexion</h3>
                <p>Impossible de récupérer les informations système.</p>
                <details>
                    <summary>Détails de l'erreur</summary>
                    <pre style={{ fontSize: '12px' }}>
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
                backgroundColor: '#d1ecf1', 
                border: '1px solid #bee5eb',
                borderRadius: '5px',
                margin: '10px 0'
            }}>
                <p>Chargement des informations système...</p>
            </div>
        )
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'config':
                return <BulletinConfig />;
            case 'generate':
                return <BulletinGenerator />;
            case 'history':
                return <BulletinHistory />;
            default:
                return <BulletinConfig />;
        }
    };

    return (
    <div className="min-h-screen bg-gray-50">
            {/* Menu lateral */}
            <div className="w-64 bg-gray-500 shadow-sm h-screen overflow-y-auto">
                <div className="absolute flex border-b">
                    <h2 className="text-lg font-semibold text-gray-800">
                    Bulletin PEV
                    </h2>
                </div>
                <div className="relative flex-1">
                <Menu>
                    {menuItems.map(item => {
                    const Icon = item.icon
                    return (
                        <MenuItem
                        key={item.id}
                        label={
                            <div className="flex items-center gap-3">
                            <Icon size={18} />
                            {item.label}
                            </div>
                        }
                        active={activeTab === item.id}
                        onClick={() => setActiveTab(item.id)}
                        />
                    )
                    })}
                </Menu>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="flex-1 p-6 overflow-y-auto">
            {renderContent()}
            </div>
    </div>
  
    )
}

export default SystemInfo 