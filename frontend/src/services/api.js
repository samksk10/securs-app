import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor pour ajouter le token aux requêtes
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${ token }`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor pour gérer les erreurs
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
// Ajouter ces fonctions
export const getDetailedHistory = async (queryParams = '') => {
    try {
        const response = await fetch(`${ API_URL }/checkins/detailed-history?${ queryParams }`, {
            headers: {
                'Authorization': `Bearer ${ localStorage.getItem('token') }`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Erreur API historique:', error);
        throw error;
    }
};

export const exportCheckInsToExcel = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${ API_URL }/checkins/export?${ queryParams }`, {
            headers: {
                'Authorization': `Bearer ${ localStorage.getItem('token') }`
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pointages-export-${ new Date().toISOString().split('T')[ 0 ] }.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
    } catch (error) {
        console.error('Erreur export:', error);
    }
};
export default api;