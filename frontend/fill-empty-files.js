import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Récupère le chemin du dossier courant (équivalent de __dirname en ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToFill = [
    // Components/Common
    'src/components/Common/Alert.jsx',
    'src/components/Common/Card.jsx',
    'src/components/Common/Modal.jsx',

    // Components/Layout
    'src/components/Layout/Sidebar.jsx',
    'src/components/Layout/MobileMenu.jsx',

    // Services (on les utilisera plus tard)
    'src/services/checkin.js',
    'src/services/incidents.js',
    'src/services/qr.js',

    // Utils
    'src/utils/constants.js',
    'src/utils/helpers.js',
    'src/utils/validators.js',

    // Pages supplémentaires
    'src/pages/AdminHomePage.jsx',
    'src/pages/AgentHomePage.jsx',
    'src/pages/FaceRegistrationPage.jsx',
];

filesToFill.forEach((file) => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).size === 0) {
        const minimalContent = `// ${ path.basename(file) } - À implémenter plus tard
export default function Placeholder() {
  return null;
}
`;
        fs.writeFileSync(fullPath, minimalContent);
        console.log(`✓ Rempli: ${ file }`);
    }
});

console.log('\n✅ Tous les fichiers vides ont été remplis avec du contenu minimal.');
