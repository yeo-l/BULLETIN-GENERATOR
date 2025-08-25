import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React from 'react'
import classes from './App.module.css'
import SystemInfo from './components/SystemInfo'
// './locales' will be populated after running start or build scripts
import './locales'

const query = {
    me: {
        resource: 'me',
    },
}

const MyApp = () => {
    const { error, loading, data } = useDataQuery(query)

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
        <div className="App">          
            <Sidebar />
        </div>
    )
}

export default MyApp
