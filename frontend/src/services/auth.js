import api from './api';

export const authService = {
    login: async (employeeId, password) => {
        const response = await api.post('/auth/login', { employeeId, password });

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            // Normaliser role/userRole
            if (user.userRole && !user.role) {
                user.role = user.userRole;
            }
            return user;
        }
        return null;
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    isAdmin: () => {
        const user = authService.getCurrentUser();
        return user?.role === 'admin' || user?.role === 'sub_admin';
    },

    isAgent: () => {
        const user = authService.getCurrentUser();
        return user?.role === 'agent';
    },

    login: async (employeeId, password) => {
        const response = await api.post('/auth/login', { employeeId, password });

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);

            // Normaliser les données utilisateur
            const user = response.data.user;
            // S'assurer que 'role' existe (copier de userRole si nécessaire)
            if (user.userRole && !user.role) {
                user.role = user.userRole;
            }

            localStorage.setItem('user', JSON.stringify(user));
        }

        return response.data;
    },
};