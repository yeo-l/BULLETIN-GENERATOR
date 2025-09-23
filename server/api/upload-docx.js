/**
 * API Endpoint pour l'upload de fichiers .docx
 * 
 * Ce fichier doit être placé dans votre serveur backend
 * Exemple d'implémentation avec Express.js et multer
 * 
 * Installation requise:
 * npm install express multer path fs-extra
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

const router = express.Router();

// Configuration du stockage avec multer
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../public/upload');
        
        // Créer le dossier s'il n'existe pas
        try {
            await fs.ensureDir(uploadDir);
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        // Générer un nom de fichier unique
        const timestamp = new Date().toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .split('.')[0];
        
        const originalName = file.originalname
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9._-]/g, '');
        
        const extension = path.extname(originalName);
        const nameWithoutExtension = path.basename(originalName, extension);
        
        const uniqueFilename = `${nameWithoutExtension}_${timestamp}${extension}`;
        cb(null, uniqueFilename);
    }
});

// Configuration de multer avec validation
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
        files: 1 // Un seul fichier à la fois
    },
    fileFilter: (req, file, cb) => {
        // Vérifier que c'est un fichier .docx
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.originalname.toLowerCase().endsWith('.docx')) {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers .docx sont acceptés'), false);
        }
    }
});

// Endpoint POST pour l'upload
router.post('/upload-docx', (req, res) => {
    const uploadSingle = upload.single('file');
    
    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Erreurs spécifiques à multer
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'Le fichier ne doit pas dépasser 10MB'
                });
            } else if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: 'Un seul fichier autorisé à la fois'
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: `Erreur d'upload: ${err.message}`
                });
            }
        } else if (err) {
            // Autres erreurs
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        
        // Vérifier que le fichier a été uploadé
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier reçu'
            });
        }
        
        // Succès
        res.json({
            success: true,
            message: 'Fichier uploadé avec succès',
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: `/upload/${req.file.filename}`,
            size: req.file.size,
            uploadedAt: new Date().toISOString()
        });
    });
});

// Endpoint GET pour lister les fichiers uploadés
router.get('/uploaded-files', async (req, res) => {
    try {
        const uploadDir = path.join(__dirname, '../../public/upload');
        const files = await fs.readdir(uploadDir);
        
        const fileDetails = await Promise.all(
            files
                .filter(file => file.toLowerCase().endsWith('.docx'))
                .map(async (file) => {
                    const filePath = path.join(uploadDir, file);
                    const stats = await fs.stat(filePath);
                    
                    return {
                        filename: file,
                        path: `/upload/${file}`,
                        size: stats.size,
                        uploadedAt: stats.birthtime,
                        modifiedAt: stats.mtime
                    };
                })
        );
        
        // Trier par date d'upload (plus récent en premier)
        fileDetails.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        
        res.json({
            success: true,
            files: fileDetails,
            count: fileDetails.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Erreur lors de la récupération des fichiers: ${error.message}`
        });
    }
});

// Endpoint DELETE pour supprimer un fichier
router.delete('/uploaded-files/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        
        // Validation du nom de fichier pour éviter les attaques path traversal
        if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({
                success: false,
                message: 'Nom de fichier invalide'
            });
        }
        
        const filePath = path.join(__dirname, '../../public/upload', filename);
        
        // Vérifier que le fichier existe
        if (!(await fs.pathExists(filePath))) {
            return res.status(404).json({
                success: false,
                message: 'Fichier non trouvé'
            });
        }
        
        // Supprimer le fichier
        await fs.remove(filePath);
        
        res.json({
            success: true,
            message: `Fichier "${filename}" supprimé avec succès`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Erreur lors de la suppression: ${error.message}`
        });
    }
});

module.exports = router;

/**
 * Instructions d'intégration:
 * 
 * 1. Dans votre serveur principal (app.js ou server.js), ajoutez:
 *    const uploadRoutes = require('./api/upload-docx');
 *    app.use('/api', uploadRoutes);
 * 
 * 2. Assurez-vous que le dossier public/upload existe et est accessible
 * 
 * 3. Pour servir les fichiers statiques:
 *    app.use('/upload', express.static(path.join(__dirname, 'public/upload')));
 * 
 * 4. Configuration CORS si nécessaire:
 *    app.use(cors({
 *        origin: 'http://localhost:3000', // URL de votre app React
 *        credentials: true
 *    }));
 */
