import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="text-center">
                <h1 className="display-1 fw-bold text-muted">404</h1>
                <h2 className="fs-3 fw-semibold text-dark mt-3">Page non trouvée</h2>
                <p className="text-muted mt-2">La page que vous recherchez n'existe pas.</p>
                <Link
                    to="/"
                    className="btn btn-primary d-inline-flex align-items-center mt-4 px-4 py-2"
                >
                    <Home className="me-2" />
                    Retour à l'accueil
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;