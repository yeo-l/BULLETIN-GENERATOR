import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React, { useState, useCallback } from 'react'
import { BrowserRouter } from 'react-router-dom'
import classes from './App.module.css'
import Sidebar from './components/Sidebar'
import BulletinConfig from './components/BulletinConfig/BulletinConfig'
import BulletinHistory from './components/BulletinHistory/BulletinHistory'
import BulletinGenerator from './components/BulletinGenerator/BulletinGenerator'
// './locales' will be populated after running start or build scripts
import './locales'

const query = {
    me: {
        resource: 'me',
    },
}

const MyApp = () => {
    const { error, loading, data } = useDataQuery(query)
    const [activeContent, setActiveContent] = useState(null)

    const handleContentChange = useCallback((componentName) => {
        const contentMap = {
            config: <BulletinConfig />,
            history: <BulletinHistory />,
            generate: <BulletinGenerator />,
            home: null
        }
        setActiveContent(contentMap[componentName] || null)
    }, [])

    const renderError = () => (
        <div className={classes.container} role="alert" aria-live="polite">
            <h1 className={classes.errorTitle}>{i18n.t('Erreur de connexion')}</h1>
            <p className={classes.errorMessage}>{i18n.t('Impossible de se connecter à DHIS2.')}</p>
            <div className={classes.errorSolutions}>
                <h3>Solutions possibles :</h3>
                <ul>
                    <li>Vérifiez que vous êtes connecté à DHIS2</li>
                    <li>Rafraîchissez la page après vous être connecté</li>
                    <li>Vérifiez votre connexion internet</li>
                    <li>Contactez l'administrateur si le problème persiste</li>
                </ul>
            </div>
            <details className={classes.errorDetails}>
                <summary>{i18n.t('Détails de l\'erreur')}</summary>
                <pre className={classes.errorPre}>{JSON.stringify(error, null, 2)}</pre>
            </details>
        </div>
    )

    const renderLoading = () => (
        <div className={classes.container} role="status" aria-live="polite">
            <div className={classes.loadingSpinner}></div>
            <span className={classes.loadingText}>{i18n.t('Chargement...')}</span>
        </div>
    )

    const renderWelcome = () => (
        <div className={classes.welcomeSection}>
            <h2 className={classes.welcomeTitle}>
                Bienvenue sur le module de génération de bulletin PEV
            </h2>
            <div className={classes.welcomeCard}>
                <p className={classes.welcomeText}>
                    Ce module vous permet de générer des bulletins en fonction des données de votre organisation.
                </p>
                <ul className={classes.welcomeList}>
                    <li>Pour commencer si vous n'avez pas encore configuré les paramètres du bulletin, veuillez le faire dans la section "Paramétrage".</li>
                    <li>Si vous avez déjà configuré les paramètres du bulletin, vous pouvez générer un bulletin dans la section "Générer Bulletin".</li>
                </ul>
            </div>
        </div>
    )

    if (error) return renderError()
    if (loading) return renderLoading()

    return (
        <BrowserRouter>
            <div className={classes.app} role="application" aria-label="Générateur de bulletins PEV">
                <Sidebar onSelect={handleContentChange} />
                <main className={classes.main} role="main">
                    {activeContent || renderWelcome()}
                </main>
            </div>
        </BrowserRouter>
    )
}

export default MyApp
