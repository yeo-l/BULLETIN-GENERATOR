import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React, { useState } from 'react'
// Router removed to simplify preview without requiring react-router-dom
import classes from './App.module.css'
import Sidebar from './components/Sidebar'
import BulletinConfig from './components/BulletinConfig/BulletinConfig'
import BulletinHistory from './components/BulletinHistory/BulletinHistory'
import BulletinGenerator from './components/BulletinGenerator/BulletinGenerator'
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

    // Do not block the UI on loading/error to allow local preview

    return (
        <>
            <div className={classes.App} style={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar onSelect={(componentName) => {
                    if (componentName === 'config') setActiveContent(<BulletinConfig />)
                    else if (componentName === 'history') setActiveContent(<BulletinHistory />)
                    else if (componentName === 'generate') setActiveContent(<BulletinGenerator />)
                    else setActiveContent(null)
                }} />
                <main style={{ flex: 1, padding: '16px' }}>
                    {loading && (
                        <div style={{
                            marginBottom: '16px',
                            padding: '10px 12px',
                            backgroundColor: '#d1ecf1',
                            border: '1px solid #bee5eb',
                            borderRadius: 6
                        }}>
                            <span>{i18n.t('Chargement...')}</span>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            marginBottom: '16px',
                            padding: '15px',
                            backgroundColor: '#f8d7da',
                            border: '1px solid #f5c6cb',
                            borderRadius: 6
                        }}>
                            <h3 style={{ marginTop: 0 }}>{i18n.t('Erreur de connexion')}</h3>
                            <p style={{ marginBottom: 8 }}>{i18n.t('Impossible de se connecter à DHIS2.')}</p>
                            <ul style={{ paddingLeft: 20, margin: 0 }}>
                                <li>{i18n.t('Vérifiez que vous êtes connecté à DHIS2')}</li>
                                <li>{i18n.t('Rafraîchissez la page après vous être connecté')}</li>
                                <li>{i18n.t('Vérifiez votre connexion internet')}</li>
                                <li>{i18n.t("Contactez l'administrateur si le problème persiste")}</li>
                            </ul>
                            <details style={{ marginTop: 10 }}>
                                <summary>{i18n.t("Détails de l'erreur")}</summary>
                                <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(error, null, 2)}</pre>
                            </details>
                        </div>
                    )}

                    {activeContent || (
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
                                Bienvenue sur le module de génération de bulletin PEV
                            </h2>
                            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
                                <p>Ce module vous permet de générer des bulletins en fonction des données de votre organisation.</p>
                                <ul style={{ marginTop: '16px', paddingLeft: '20px' }}>
                                    <li>Pour commencer si vous n'avez pas encore configuré les paramètres du bulletin, veuillez le faire dans la section "Paramétrage".</li>
                                    <li>Si vous avez déjà configuré les paramètres du bulletin, vous pouvez générer un bulletin dans la section "Générer Bulletin".</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    )
}

export default MyApp
