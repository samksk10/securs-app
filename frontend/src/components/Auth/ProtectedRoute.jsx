import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;