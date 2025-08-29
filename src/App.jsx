import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React, { useState, useCallback, useMemo } from 'react'
import { BrowserRouter } from 'react-router-dom'
import classes from './App.module.css'
import Sidebar from './components/Sidebar'
import BulletinConfig from './components/BulletinConfig/BulletinConfig'
import BulletinHistory from './components/BulletinHistory/BulletinHistory'
// './locales' will be populated after running start or build scripts
import './locales'

const query = {
    me: {
        resource: 'me',
    },
}

const MyApp = () => {
    const { error, loading, data } = useDataQuery(query)
    const [activeComponent, setActiveComponent] = useState('home')

    // Gestion optimisée de la sélection de composant
    const handleComponentSelect = useCallback((componentName) => {
        setActiveComponent(componentName)
    }, [])

    // Mémorisation du contenu actif pour éviter les re-rendus inutiles
    const activeContent = useMemo(() => {
        switch(activeComponent) {
            case 'config':
                return <BulletinConfig />
            case 'history':
                return <BulletinHistory />
            case 'generate':
                return <BulletinConfig />
            case 'home':
            default:
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">
                            Bienvenue sur le module de génération de bulletin PEV
                        </h2>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-700 mb-4">
                                Ce module vous permet de générer des bulletins en fonction des données de votre organisation.
                            </p>
                            <ul className="space-y-2 list-disc list-inside text-gray-600">
                                <li>Pour commencer si vous n'avez pas encore configuré les paramètres du bulletin, veuillez le faire dans la section "Paramétrage".</li>
                                <li>Si vous avez déjà configuré les paramètres du bulletin, vous pouvez générer un bulletin dans la section "Générer Bulletin".</li>
                            </ul>
                        </div>
                    </div>
                )
        }
    }, [activeComponent])

    if (error) {
        return (
            <div className={classes.container}>
                <div className="max-w-2xl mx-auto p-6">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">
                        {i18n.t('Erreur de connexion')}
                    </h1>
                    <p className="text-gray-700 mb-4">
                        {i18n.t('Impossible de se connecter à DHIS2.')}
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-red-800 mb-2">Solutions possibles :</h3>
                        <ul className="space-y-1 text-red-700 list-disc list-inside">
                            <li>Vérifiez que vous êtes connecté à DHIS2</li>
                            <li>Rafraîchissez la page après vous être connecté</li>
                            <li>Vérifiez votre connexion internet</li>
                            <li>Contactez l'administrateur si le problème persiste</li>
                        </ul>
                    </div>
                    <details className="bg-gray-100 rounded-lg p-4">
                        <summary className="cursor-pointer font-medium text-gray-700">
                            {i18n.t('Détails de l\'erreur')}
                        </summary>
                        <pre className="mt-2 text-sm text-gray-600 overflow-x-auto">
                            {JSON.stringify(error, null, 2)}
                        </pre>
                    </details>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className={`${classes.container} flex items-center justify-center min-h-screen`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <span className="text-gray-600">{i18n.t('Chargement...')}</span>
                </div>
            </div>
        )
    }

    return (
        <BrowserRouter>
            <div className="App flex min-h-screen bg-gray-50">
                <Sidebar 
                    onSelect={handleComponentSelect} 
                    current={activeComponent}
                />
                <main className="flex-1 overflow-auto">
                    {activeContent}
                </main>
            </div>
        </BrowserRouter>
    )
}

export default MyApp
