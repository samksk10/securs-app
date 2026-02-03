import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CheckInFlow from '../components/Agent/CheckInFlow';
import CheckInHistory from '../components/Agent/CheckInHistory';

const CheckIn = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if not authenticated
    if (!isAuthenticated) {
        navigate('/login', { replace: true });
        return null;
    }

    return (
        <div className="container py-4">
            <div className="mb-4">
                <h1 className="h3 fw-bold text-dark">Pointage</h1>
                <p className="text-muted mt-2">Bienvenue, { user?.fullName }</p>
            </div>

            <div className="row g-4">
                <div className="col-12 col-lg-8">
                    <CheckInFlow />
                </div>

                <div className="col-12 col-lg-4">
                    <CheckInHistory />
                </div>
            </div>
        </div>
    );
};

export default CheckIn;
