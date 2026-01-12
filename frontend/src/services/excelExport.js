import * as XLSX from 'xlsx';

/**
 * Exporte des données vers un fichier Excel
 * @param {Array} data - Données à exporter
 * @param {string} fileName - Nom du fichier (sans extension)
 * @param {Array} headers - En-têtes personnalisés (optionnel)
 */
export const downloadExcel = (data, fileName = 'export', headers = null) => {
    if (!data || data.length === 0) {
        alert('Aucune donnée à exporter');
        return;
    }

    try {
        // Créer un nouveau workbook
        const wb = XLSX.utils.book_new();

        // Préparer les données
        let wsData;

        if (headers) {
            // Utiliser les en-têtes personnalisés
            wsData = [ headers, ...data ];
        } else {
            // Générer automatiquement les en-têtes à partir des clés du premier objet
            const firstRow = data[ 0 ];
            const autoHeaders = Object.keys(firstRow);
            wsData = [ autoHeaders, ...data.map(row => Object.values(row)) ];
        }

        // Créer la worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Ajouter des styles (largeur de colonne automatique)
        const colWidths = wsData[ 0 ].map((_, i) => ({ wch: 20 }));
        ws[ '!cols' ] = colWidths;

        // Ajouter la worksheet au workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Données');

        // Générer et télécharger le fichier
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([ excelBuffer ], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${ fileName }.xlsx`;
        link.click();

        // Nettoyer
        URL.revokeObjectURL(url);

        console.log('Export Excel réussi:', data.length, 'lignes exportées');

    } catch (error) {
        console.error('Erreur lors de l\'export Excel:', error);
        alert('Erreur lors de l\'export. Veuillez réessayer.');
    }
};

/**
 * Exporte les pointages avec formatage spécifique
 */
export const exportCheckIns = (checkIns, filters = {}) => {
    const formattedData = checkIns.map(checkIn => ({
        'ID': checkIn.id,
        'Date': new Date(checkIn.createdAt).toLocaleDateString('fr-FR'),
        'Heure': new Date(checkIn.createdAt).toLocaleTimeString('fr-FR'),
        'Agent': checkIn.user?.fullName || 'N/A',
        'Matricule': checkIn.user?.employeeId || 'N/A',
        'Département': checkIn.user?.department || 'N/A',
        'Type': checkIn.type === 'in' ? 'Entrée' : 'Sortie',
        'Statut': checkIn.status === 'success' ? 'Succès' : 'Échec',
        'Méthode': checkIn.method === 'qr' ? 'QR Code' : 'Manuel',
        'Notes': checkIn.notes || '',
        'Photo': checkIn.photoUrl ? 'Oui' : 'Non'
    }));

    const fileName = `pointages-${ filters.startDate || 'debut' }-${ filters.endDate || 'fin' }-${ new Date().getTime() }`;

    downloadExcel(formattedData, fileName);
};

/**
 * Exporte les incidents
 */
export const exportIncidents = (incidents) => {
    const formattedData = incidents.map(incident => ({
        'ID': incident.id,
        'Date': new Date(incident.createdAt).toLocaleDateString('fr-FR'),
        'Heure': new Date(incident.createdAt).toLocaleTimeString('fr-FR'),
        'Agent': incident.user?.fullName || 'N/A',
        'Type': incident.type,
        'Urgence': incident.priority,
        'Statut': incident.status,
        'Description': incident.description,
        'Lieu': incident.location,
        'Actions Prises': incident.actionsTaken || '',
        'Commentaires': incident.comments || ''
    }));

    const fileName = `incidents-${ new Date().toISOString().split('T')[ 0 ] }`;

    downloadExcel(formattedData, fileName);
};