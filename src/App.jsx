import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React, { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import classes from './App.module.css'
import Sidebar from './components/Sidebar'
import BulletinConfig from './components/BulletinConfig/BulletinConfig'
import BulletinHistory from './components/BulletinHistory/BulletinHistory'
import BulletinGenerator from './components/BulletinGenerator/BulletinGenerator'
import DocumentImport from './components/DocumentImport/DocumentImport'
import Logo from './components/Logo'
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
    const [configToEdit, setConfigToEdit] = useState(null)

    if (error) {
        return (
            <div className={classes.container}>
                <div className={classes.errorContent}>
                    <h1 className={classes.errorTitle}>{i18n.t('Erreur de connexion')}</h1>
                    <p className={classes.errorMessage}>{i18n.t('Impossible de se connecter à DHIS2.')}</p>
                    
                    <div className={classes.troubleshooting}>
                        <h3>Solutions possibles :</h3>
                        <ul className={classes.solutionsList}>
                            <li>Vérifiez que vous êtes connecté à DHIS2</li>
                            <li>Rafraîchissez la page après vous être connecté</li>
                            <li>Vérifiez votre connexion internet</li>
                            <li>Contactez l'administrateur si le problème persiste</li>
                        </ul>
                    </div>
                    
                    <details className={classes.errorDetails}>
                        <summary>{i18n.t('Détails de l\'erreur')}</summary>
                        <pre>{JSON.stringify(error, null, 2)}</pre>
                    </details>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className={classes.loadingContainer}>
                <div className={classes.loadingSpinner}></div>
                <span className={classes.loadingText}>{i18n.t('Chargement...')}</span>
            </div>
        )
    }

    return (
        <BrowserRouter>
            <div className={classes.appContainer}>
                <Sidebar onSelect={(componentName) => {
                    if (componentName === 'config') 
                        setActiveContent(<BulletinConfig configToEdit={configToEdit} onConfigSaved={() => setConfigToEdit(null)} />)
                    else if (componentName === 'history') 
                        setActiveContent(<BulletinHistory onNavigateToConfig={(component, config) => {
                            setConfigToEdit(config)
                            setActiveContent(<BulletinConfig configToEdit={config} onConfigSaved={() => setConfigToEdit(null)} />)
                        }} />)
                    else if (componentName === 'generate') 
                        setActiveContent(<BulletinGenerator />)
                    else if (componentName === 'import') 
                        setActiveContent(<DocumentImport />)
                    else 
                        setActiveContent(null)
                }} />
                
                <main className={classes.mainContent}>
                    {activeContent || 
                    <div className={classes.homeContent}>
                        {/* SECTION: En-tête de la page d'accueil */}
                        <div className={classes.heroSection}>
                            <Logo size="large" />
                            
                            <div className={classes.heroContent}>
                                <h1 className={classes.heroTitle}>
                                    Bienvenue sur Bulletin Generator
                                </h1>
                                <p className={classes.heroSubtitle}>
                                    Module de génération de bulletins sanitaires
                                </p>
                            </div>
                        </div>
                        
                        {/* SECTION: Guide d'utilisation */}
                        <div className={classes.featuresSection}>
                            
                            <h2 className={classes.featuresTitle}>
                                Comment utiliser l'application
                            </h2>
                            
                            <p className={classes.featuresDescription}>
                                Ce module vous permet de générer des bulletins sanitaires en fonction des données de votre organisation DHIS2.
                            </p>
                            
                            <div className={classes.featuresGrid}>
                                
                                {/* CARTE 1: Configuration */}
                                <div className={classes.featureCard}>
                                    <h3 className={classes.featureCardTitle}>
                                        📋 Configuration
                                    </h3>
                                    <p className={classes.featureCardDescription}>
                                        Configurez les paramètres de votre bulletin
                                    </p>
                                    <ul className={classes.featureList}>
                                        <li className={classes.featureItem}>Programme de surveillance</li>
                                        <li className={classes.featureItem}>Périodicité de génération</li>
                                        <li className={classes.featureItem}>Unités d'organisation</li>
                                        <li className={classes.featureItem}>Indicateurs et rubriques</li>
                                    </ul>
                                </div>
                                
                                {/* CARTE 2: Génération */}
                                <div className={classes.featureCard}>
                                    <h3 className={classes.featureCardTitle}>
                                        📊 Génération
                                    </h3>
                                    <p className={classes.featureCardDescription}>
                                        Générez vos bulletins automatiquement
                                    </p>
                                    <ul className={classes.featureList}>
                                        <li className={classes.featureItem}>Génération automatique</li>
                                        <li className={classes.featureItem}>Export en PDF</li>
                                        <li className={classes.featureItem}>Partage et distribution</li>
                                        <li className={classes.featureItem}>Historique des bulletins</li>
                                    </ul>
                                </div>
                                
                                {/* CARTE 3: Historique */}
                                <div className={classes.featureCard}>
                                    <h3 className={classes.featureCardTitle}>
                                        📋 Historique
                                    </h3>
                                    <p className={classes.featureCardDescription}>
                                        Consultez et gérez vos bulletins précédents
                                    </p>
                                    <ul className={classes.featureList}>
                                        <li className={classes.featureItem}>Consultations des archives</li>
                                        <li className={classes.featureItem}>Modification des configurations</li>
                                        <li className={classes.featureItem}>Téléchargement des documents</li>
                                        <li className={classes.featureItem}>Suivi des générations</li>
                                    </ul>
                                </div>
                                
                                {/* CARTE 4: Import */}
                                <div className={classes.featureCard}>
                                    <h3 className={classes.featureCardTitle}>
                                        📤 Import
                                    </h3>
                                    <p className={classes.featureCardDescription}>
                                       Importez vos documents externes
                                    </p>
                                    <ul className={classes.featureList}>
                                        <li className={classes.featureItem}>Support multiple formats</li>
                                        <li className={classes.featureItem}>Intégrations des données</li>
                                        <li className={classes.featureItem}>Traitement automatique</li>
                                        <li className={classes.featureItem}>Validation des imports</li>
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