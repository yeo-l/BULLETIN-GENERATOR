const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware CORS pour permettre les requêtes depuis l'application
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));

app.use(express.json());

// Créer le dossier public/upload s'il n'existe pas
const uploadDir = path.join(__dirname, 'public', 'upload');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Dossier public/upload créé');
}

// Configuration Multer pour sauvegarder les fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Garder le nom original du fichier
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: (req, file, cb) => {
        // Accepter seulement les fichiers .docx
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.originalname.toLowerCase().endsWith('.docx')) {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers .docx sont acceptés'), false);
        }
    }
});

// Route d'upload
app.post('/api/upload-docx', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier reçu'
            });
        }

        console.log(`✅ Fichier uploadé: ${req.file.originalname}`);
        console.log(`📁 Sauvegardé dans: ${req.file.path}`);

        res.json({
            success: true,
            message: `Fichier "${req.file.originalname}" sauvegardé automatiquement dans public/upload/`,
            filename: req.file.originalname,
            path: `/upload/${req.file.originalname}`,
            size: req.file.size
        });

    } catch (error) {
        console.error('❌ Erreur lors de l\'upload:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la sauvegarde du fichier',
            error: error.message
        });
    }
});

// Route pour lister les fichiers uploadés
app.get('/api/files', (req, res) => {
    try {
        const files = fs.readdirSync(uploadDir);
        const fileList = files.map(file => {
            const filePath = path.join(uploadDir, file);
            const stats = fs.statSync(filePath);
            return {
                name: file,
                size: stats.size,
                modified: stats.mtime,
                path: `/upload/${file}`
            };
        });

        res.json({
            success: true,
            files: fileList
        });
    } catch (error) {
        console.error('❌ Erreur lors de la lecture des fichiers:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la lecture des fichiers',
            error: error.message
        });
    }
});

// Route de test
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'Serveur d\'upload actif',
        port: PORT,
        uploadDir: uploadDir,
        timestamp: new Date().toISOString()
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur d'upload démarré sur le port ${PORT}`);
    console.log(`📁 Dossier d'upload: ${uploadDir}`);
    console.log(`🌐 API disponible: http://localhost:${PORT}/api/upload-docx`);
    console.log(`📋 Status: http://localhost:${PORT}/api/status`);
});

// Gestion des erreurs
process.on('uncaughtException', (error) => {
    console.error('❌ Erreur non gérée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesse rejetée:', reason);
});


