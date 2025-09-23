const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = 3001

// Créer le dossier upload s'il n'existe pas
const uploadDir = path.join(__dirname, 'public', 'upload')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

// Configuration multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.originalname.toLowerCase().endsWith('.docx')) {
            cb(null, true)
        } else {
            cb(new Error('Seuls les fichiers .docx sont acceptés'), false)
        }
    }
})

// Middleware CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    if (req.method === 'OPTIONS') {
        res.sendStatus(200)
    } else {
        next()
    }
})

// Servir les fichiers statiques
app.use('/upload', express.static(uploadDir))

// Endpoint d'upload
app.post('/api/upload-docx', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Aucun fichier reçu'
        })
    }

    res.json({
        success: true,
        message: 'Fichier uploadé avec succès',
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/upload/${req.file.filename}`,
        size: req.file.size,
        uploadedAt: new Date().toISOString()
    })
})

// Endpoint pour lister les fichiers
app.get('/api/uploaded-files', (req, res) => {
    try {
        const files = fs.readdirSync(uploadDir)
        const fileDetails = files
            .filter(file => file.toLowerCase().endsWith('.docx'))
            .map(file => {
                const filePath = path.join(uploadDir, file)
                const stats = fs.statSync(filePath)
                return {
                    filename: file,
                    path: `/upload/${file}`,
                    size: stats.size,
                    uploadedAt: stats.birthtime,
                    modifiedAt: stats.mtime
                }
            })
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))

        res.json({
            success: true,
            files: fileDetails,
            count: fileDetails.length
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Erreur lors de la récupération des fichiers: ${error.message}`
        })
    }
})

// Endpoint pour supprimer un fichier
app.delete('/api/uploaded-files/:filename', (req, res) => {
    try {
        const filename = req.params.filename
        
        // Validation du nom de fichier pour éviter les attaques path traversal
        if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({
                success: false,
                message: 'Nom de fichier invalide'
            })
        }
        
        const filePath = path.join(uploadDir, filename)
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Fichier non trouvé'
            })
        }
        
        fs.unlinkSync(filePath)
        
        res.json({
            success: true,
            message: `Fichier "${filename}" supprimé avec succès`
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Erreur lors de la suppression: ${error.message}`
        })
    }
})

app.listen(PORT, () => {
    console.log(`🚀 Serveur d'upload démarré sur http://localhost:${PORT}`)
    console.log(`📁 Dossier d'upload: ${uploadDir}`)
    console.log(`📤 Endpoint: http://localhost:${PORT}/api/upload-docx`)
})


