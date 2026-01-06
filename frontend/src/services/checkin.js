import api from './api';

export const checkinService = {
  // Créer un pointage
  createCheckIn: async (data) => {
    try {
      const response = await api.post('/checkin', data);
      return response.data;
    } catch (error) {
      console.error('Erreur création pointage:', error);
      throw error;
    }
  },

  // Récupérer l'historique
  getHistory: async (params = {}) => {
    try {
      const response = await api.get('/checkin/history', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur historique:', error);
      throw error;
    }
  },

  // Récupérer les statistiques
  getStats: async () => {
    try {
      const response = await api.get('/checkin/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur statistiques:', error);
      throw error;
    }
  },

  // ADMIN: Récupérer tous les pointages
  getAllCheckIns: async (params = {}) => {
    try {
      const response = await api.get('/checkin/all', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur récupération pointages:', error);
      throw error;
    }
  },

  // ADMIN: Mettre à jour le statut
  updateStatus: async (checkInId, status) => {
    try {
      const response = await api.put('/checkin/status', {
        checkInId,
        status
      });
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      throw error;
    }
  }
};