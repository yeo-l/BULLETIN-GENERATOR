/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    type: 'app',

    entryPoints: {
        app: './src/App.jsx',
    },

    direction: 'auto',
    
    // Configuration pour votre instance DHIS2
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'https://dev.sigsante.ci',
                changeOrigin: true,
                secure: true,
            },
        },
    },
}

module.exports = config
