import React from 'react'

const BulletinGenerator = () => {
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                marginBottom: '24px',
                color: '#1e293b'
            }}>
                Génération de Bulletin
            </h2>
            <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0',
                padding: '32px' 
            }}>
                <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    marginBottom: '16px',
                    color: '#1e293b'
                }}>
                    Générateur de Bulletins Sanitaires
                </h3>
                <p style={{ 
                    fontSize: '16px', 
                    color: '#64748b',
                    marginBottom: '20px'
                }}>
                    Cette fonctionnalité vous permettra de générer automatiquement des bulletins sanitaires 
                    basés sur vos configurations sauvegardées.
                </p>
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                }}>
                    <p style={{ 
                        fontSize: '14px', 
                        color: '#64748b',
                        margin: '0',
                        fontStyle: 'italic'
                    }}>
                        ⚠️ Cette fonctionnalité est en cours de développement. 
                        Veuillez d'abord configurer vos paramètres dans la section "Paramétrage".
                    </p>
                </div>
            </div>
        </div>
    )
}

export default BulletinGenerator