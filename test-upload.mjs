import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Test du serveur d'upload
async function testUploadServer() {
    console.log('🧪 Test du serveur d\'upload automatique...\n');

    try {
        // 1. Test du statut du serveur
        console.log('1️⃣ Test du statut du serveur...');
        const statusResponse = await fetch('http://localhost:3001/api/status');
        const statusData = await statusResponse.json();
        
        if (statusData.success) {
            console.log('✅ Serveur actif sur le port', statusData.port);
            console.log('📁 Dossier d\'upload:', statusData.uploadDir);
        } else {
            throw new Error('Serveur non disponible');
        }

        // 2. Test de création d'un fichier de test
        console.log('\n2️⃣ Création d\'un fichier de test...');
        const testContent = 'Test content for upload';
        const testFileName = 'test-document.docx';
        const testFilePath = testFileName; // Utiliser le nom simple
        
        fs.writeFileSync(testFilePath, testContent);
        console.log('✅ Fichier de test créé:', testFileName);

        // 3. Test d'upload
        console.log('\n3️⃣ Test d\'upload...');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testFilePath));

        const uploadResponse = await fetch('http://localhost:3001/api/upload-docx', {
            method: 'POST',
            body: formData
        });

        const uploadData = await uploadResponse.json();
        
        if (uploadData.success) {
            console.log('✅ Upload réussi!');
            console.log('📄 Fichier:', uploadData.filename);
            console.log('📁 Chemin:', uploadData.path);
            console.log('📊 Taille:', uploadData.size, 'bytes');
        } else {
            throw new Error('Upload échoué: ' + uploadData.message);
        }

        // 4. Vérification que le fichier existe
        console.log('\n4️⃣ Vérification du fichier...');
        const uploadedFilePath = path.join('public', 'upload', uploadData.filename);
        
        if (fs.existsSync(uploadedFilePath)) {
            console.log('✅ Fichier trouvé dans public/upload/');
            console.log('📁 Chemin complet:', uploadedFilePath);
        } else {
            throw new Error('Fichier non trouvé dans public/upload/');
        }

        // 5. Test de la liste des fichiers
        console.log('\n5️⃣ Test de la liste des fichiers...');
        const listResponse = await fetch('http://localhost:3001/api/files');
        const listData = await listResponse.json();
        
        if (listData.success && listData.files.length > 0) {
            console.log('✅ Fichiers listés:', listData.files.length);
            listData.files.forEach(file => {
                console.log(`  📄 ${file.name} (${file.size} bytes)`);
            });
        } else {
            console.log('⚠️ Aucun fichier trouvé dans la liste');
        }

        // 6. Nettoyage
        console.log('\n6️⃣ Nettoyage...');
        fs.unlinkSync(testFilePath);
        console.log('✅ Fichier de test supprimé');

        console.log('\n🎉 Tous les tests sont passés avec succès!');
        console.log('🚀 Le système d\'upload automatique fonctionne parfaitement!');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        process.exit(1);
    }
}

// Attendre que le serveur soit prêt
setTimeout(() => {
    testUploadServer();
}, 3000);
