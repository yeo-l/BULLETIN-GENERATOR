import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React, { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import classes from './App.module.css'
import Sidebar from './components/Sidebar'
import BulletinConfig from './components/BulletinConfig/BulletinConfig'
import BulletinHistory from './components/BulletinHistory/BulletinHistory'
import BulletinGenerator from './components/BulletinGenerator/BulletinGenerator'
import Logo from './components/Logo'
// './locales' will be populated after running start or build scripts
import './locales'
import './styles/globals.css'

const query = {
    me: {
        resource: 'me',
    },
}

const MyApp = () => {
    const { error, loading, data } = useDataQuery(query)
    const [activeContent, setActiveContent] = useState(null)

    if (error) {
        return (
            <div className={classes.container}>
                <h1>{i18n.t('Erreur de connexion')}</h1>
                <p>{i18n.t('Impossible de se connecter à DHIS2.')}</p>
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    backgroundColor: '#f8d7da', 
                    border: '1px solid #f5c6cb',
                    borderRadius: '5px'
                }}>
                    <h3>Solutions possibles :</h3>
                    <ul>
                        <li>Vérifiez que vous êtes connecté à DHIS2</li>
                        <li>Rafraîchissez la page après vous être connecté</li>
                        <li>Vérifiez votre connexion internet</li>
                        <li>Contactez l'administrateur si le problème persiste</li>
                    </ul>
                </div>
                <details>
                    <summary>{i18n.t('Détails de l\'erreur')}</summary>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </details>
            </div>
        )
    }

    if (loading) {
        return (
            <div className={classes.container}>
                <span>{i18n.t('Chargement...')}</span>
            </div>
        )
    }

    return (
        <BrowserRouter>
            <div className="App" style={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar onSelect={(componentName) => {
                    if (componentName === 'config') setActiveContent(<BulletinConfig />)
                    else if (componentName === 'history') setActiveContent(<BulletinHistory />)
                    else if (componentName === 'generate') setActiveContent(<BulletinGenerator />)
                    else setActiveContent(null)
                }} />
                <main style={{ flex: 1, padding: '16px' }}>
                    {activeContent || 
                    <div>
                        {/* Header avec logo */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            marginBottom: '32px',
                            padding: '24px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <Logo size="large" />
                            <div>
                                <h1 style={{ 
                                    fontSize: '28px', 
                                    fontWeight: '700', 
                                    margin: '0 0 8px 0',
                                    color: '#1e293b'
                                }}>
                                    Bienvenue sur Bulletin Generator
                                </h1>
                                <p style={{ 
                                    fontSize: '16px', 
                                    color: '#64748b',
                                    margin: '0'
                                }}>
                                    Module de génération de bulletins sanitaires
                                </p>
                            </div>
                        </div>
                        
                        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '32px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
                                Comment utiliser l'application
                            </h2>
                            <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
                                Ce module vous permet de générer des bulletins sanitaires en fonction des données de votre organisation DHIS2.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                <div style={{ 
                                    padding: '20px', 
                                    backgroundColor: '#f8fafc', 
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>
                                        📋 Configuration
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                                        Configurez les paramètres de votre bulletin
                                    </p>
                                    <ul style={{ fontSize: '14px', color: '#374151', paddingLeft: '20px', margin: '0' }}>
                                        <li>Programme de surveillance</li>
                                        <li>Périodicité de génération</li>
                                        <li>Unités d'organisation</li>
                                        <li>Indicateurs et rubriques</li>
                                    </ul>
                                </div>
                                <div style={{ 
                                    padding: '20px', 
                                    backgroundColor: '#f8fafc', 
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>
                                        📊 Génération
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                                        Générez vos bulletins automatiquement
                                    </p>
                                    <ul style={{ fontSize: '14px', color: '#374151', paddingLeft: '20px', margin: '0' }}>
                                        <li>Génération automatique</li>
                                        <li>Export en PDF</li>
                                        <li>Partage et distribution</li>
                                        <li>Historique des bulletins</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    }
                </main>
            </div>
        </BrowserRouter>
    )
}

export default MyApp
