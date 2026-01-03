import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn } from 'lucide-react';
import { toast } from 'react-toastify';

const LoginForm = () => {
    const [ employeeId, setEmployeeId ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(employeeId, password);

        if (result.success) {
            toast.success('Connexion réussie !');
            // Redirection sera gérée par le routeur
        } else {
            toast.error(result.error || 'Erreur de connexion');
        }

        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="card">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                        <LogIn className="w-8 h-8 text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Sécuris</h1>
                    <p className="text-gray-600 mt-2">Connectez-vous à votre compte</p>
                </div>

                <form onSubmit={ handleSubmit } className="space-y-6">
                    <div>
                        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                            ID Employé
                        </label>
                        <input
                            id="employeeId"
                            type="text"
                            value={ employeeId }
                            onChange={ (e) => setEmployeeId(e.target.value.toUpperCase()) }
                            className="input-field"
                            placeholder="ADMIN001"
                            required
                            disabled={ loading }
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={ password }
                            onChange={ (e) => setPassword(e.target.value) }
                            className="input-field"
                            placeholder="••••••••"
                            required
                            disabled={ loading }
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={ loading }
                        className="w-full btn btn-primary py-3"
                    >
                        { loading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Connexion...
                            </div>
                        ) : (
                            'Se connecter'
                        ) }
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 text-center">
                        <strong>Identifiants de test :</strong>
                    </p>
                    <div className="mt-2 text-sm text-gray-500 space-y-1">
                        <p>Admin: <code className="bg-gray-100 px-2 py-1 rounded">ADMIN001</code> / <code className="bg-gray-100 px-2 py-1 rounded">admin</code></p>
                        <p>Agent 1: <code className="bg-gray-100 px-2 py-1 rounded">AGENT001</code> / <code className="bg-gray-100 px-2 py-1 rounded">agent001</code></p>
                        <p>Agent 2: <code className="bg-gray-100 px-2 py-1 rounded">AGENT002</code> / <code className="bg-gray-100 px-2 py-1 rounded">agent002</code></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;