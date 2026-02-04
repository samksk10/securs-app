import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/Auth/LoginForm';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const LoginPage = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner size="lg" />;
    }

    if (user) {
        if (user.role === 'admin' || user.role === 'sub_admin') {
            return <Navigate to="/admin" />;
        }
        return <Navigate to="/agent" />;
    }

    return (
        <div className="min-vh-100 bg-light d-flex flex-column justify-content-center py-5 px-3 px-sm-4 px-lg-5">
            <LoginForm />
        </div>
    );
};

export default LoginPage;