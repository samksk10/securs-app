import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-gray-300">404</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mt-4">Page non trouvée</h2>
                <p className="text-gray-600 mt-2">La page que vous recherchez n'existe pas.</p>
                <Link
                    to="/"
                    className="inline-flex items-center mt-6 px-6 py-3 btn btn-primary"
                >
                    <Home className="w-5 h-5 mr-2" />
                    Retour à l'accueil
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;