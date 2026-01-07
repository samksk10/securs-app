import api from './api';


export const qrService = {
  // Générer le QR code du jour (admin seulement)
  generateDailyQR: async () => {
    try {
      const response = await api.post('/qr/generate');
      return response.data;
    } catch (error) {
      console.error('Erreur génération QR:', error);
      throw error;
    }
  },

  // Récupérer le QR code du jour
  getTodayQR: async () => {
    try {
      const response = await api.get('/qr/today');
      return response.data;
    } catch (error) {
      // Si aucun QR actif pour aujourd'hui -> backend renvoie 404
      if (error.response?.status === 404) {
        return { success: false, error: 'Aucun QR code actif pour aujourd\'hui' };
      }
      console.error('Erreur récupération QR:', error);
      throw error;
    }
  },

  // Valider un QR code scanné
  validateQR: async (qrData) => {
    try {
      const response = await api.post('/qr/validate', { qrData });
      return response.data;
    } catch (error) {
      console.error('Erreur validation QR:', error);
      throw error;
    }
  },

  // Désactiver le QR code (admin seulement)
  disableQR: async () => {
    try {
      const response = await api.post('/qr/disable');
      return response.data;
    } catch (error) {
      console.error('Erreur désactivation QR:', error);
      throw error;
    }
  }
};