/**
 * Service d'upload de fichiers .docx
 * Ce service gère l'upload des fichiers vers le dossier public/upload
 */

export class UploadService {
    /**
     * Upload un fichier .docx vers le serveur
     * @param {File} file - Le fichier à uploader
     * @param {Function} onProgress - Callback pour le suivi du progress
     * @returns {Promise<Object>} Résultat de l'upload
     */
    static async uploadDocx(file, onProgress = null) {
        return new Promise((resolve, reject) => {
            // Validation du fichier
            if (!file) {
                reject(new Error('Aucun fichier fourni'));
                return;
            }

            if (!file.name.toLowerCase().endsWith('.docx')) {
                reject(new Error('Seuls les fichiers .docx sont acceptés'));
                return;
            }

            if (file.size > 10 * 1024 * 1024) { // 10MB
                reject(new Error('Le fichier ne doit pas dépasser 10MB'));
                return;
            }

            // Créer FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('destination', 'public/upload');

            // Utiliser XMLHttpRequest pour le suivi du progress
            const xhr = new XMLHttpRequest();

            // Gestion du progress
            if (onProgress) {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        onProgress(percentComplete);
                    }
                });
            }

            // Gestion de la réponse
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve({
                            success: true,
                            message: `Fichier "${file.name}" uploadé avec succès`,
                            filename: response.filename,
                            path: response.path,
                            size: response.size
                        });
                    } catch (e) {
                        resolve({
                            success: true,
                            message: `Fichier "${file.name}" uploadé avec succès`,
                            filename: file.name
                        });
                    }
                } else {
                    reject(new Error(`Erreur HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            });

            // Gestion des erreurs
            xhr.addEventListener('error', () => {
                reject(new Error('Erreur réseau lors de l\'upload'));
            });

            xhr.addEventListener('timeout', () => {
                reject(new Error('Timeout lors de l\'upload'));
            });

            // Configuration et envoi
            xhr.timeout = 30000; // 30 secondes
            xhr.open('POST', '/api/upload-docx');
            xhr.send(formData);
        });
    }

    /**
     * Valide un fichier avant upload
     * @param {File} file - Le fichier à valider
     * @returns {Object} Résultat de la validation
     */
    static validateFile(file) {
        const errors = [];
        const warnings = [];

        if (!file) {
            errors.push('Aucun fichier sélectionné');
            return { valid: false, errors, warnings };
        }

        // Vérifier l'extension
        if (!file.name.toLowerCase().endsWith('.docx')) {
            errors.push('Seuls les fichiers .docx sont acceptés');
        }

        // Vérifier la taille
        if (file.size > 10 * 1024 * 1024) {
            errors.push('Le fichier ne doit pas dépasser 10MB');
        }

        if (file.size < 10) {
            warnings.push('Le fichier semble très petit, assurez-vous qu\'il contient du contenu');
        }

        // Vérifier le nom du fichier
        if (file.name.includes(' ')) {
            warnings.push('Le nom du fichier contient des espaces, ils seront remplacés par des underscores');
        }

        if (!/^[a-zA-Z0-9._-]+$/.test(file.name.replace(/\s/g, '_'))) {
            warnings.push('Le nom du fichier contient des caractères spéciaux qui pourraient causer des problèmes');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Formate la taille d'un fichier en format lisible
     * @param {number} bytes - Taille en bytes
     * @returns {string} Taille formatée
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Génère un nom de fichier unique pour éviter les conflits
     * @param {string} originalName - Nom original du fichier
     * @returns {string} Nouveau nom de fichier
     */
    static generateUniqueFilename(originalName) {
        const timestamp = new Date().toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .split('.')[0];
        
        const extension = originalName.split('.').pop();
        const nameWithoutExtension = originalName
            .replace(/\.[^/.]+$/, "")
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9._-]/g, '');

        return `${nameWithoutExtension}_${timestamp}.${extension}`;
    }
}

export default UploadService;
