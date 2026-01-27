import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [ user, setUser ] = useState(null);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        // Vérifier si l'utilisateur est déjà connecté
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = async (employeeId, password) => {
        try {
            const data = await authService.login(employeeId, password);
            setUser(data.user);
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Erreur de connexion'
            };
        }
    };

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
        // Dispatch custom event pour la redirection globale
        window.dispatchEvent(new CustomEvent('userLogout'));
    }, []);

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'sub_admin',
        isAgent: user?.role === 'agent'
    };

    return (
        <AuthContext.Provider value={ value }>
            { children }
        </AuthContext.Provider>
    );
};