import api from './api';

export const faceService = {
    // Vérifier si l'agent a enregistré son visage
    checkFaceRegistered: async () => {
        try {
            const response = await api.get('/face/check');
            return response.data;
        } catch (error) {
            console.error('Erreur vérification visage:', error);
            throw error;
        }
    },

    // Enregistrer le visage (première fois)
    registerFace: async (faceData) => {
        try {
            const response = await api.post('/face/register', { faceData });
            return response.data;
        } catch (error) {
            console.error('Erreur enregistrement visage:', error);
            throw error;
        }
    },

    // Vérifier la correspondance
    verifyFace: async (faceData) => {
        try {
            const response = await api.post('/face/verify', { faceData });
            return response.data;
        } catch (error) {
            console.error('Erreur vérification faciale:', error);
            throw error;
        }
    }
};