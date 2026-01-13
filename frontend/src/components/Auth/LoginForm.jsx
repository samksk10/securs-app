import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
    const [ employeeId, setEmployeeId ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const { login, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Détermine si on est sur la page admin (ex: /admin/login) ou agent
    const expectedRole = location.pathname.includes('/admin') ? 'admin' : 'agent';

    useEffect(() => {
        // Si un utilisateur est déjà connecté, redirige s'il correspond à la page;
        // sinon purge le token pour éviter "auto-login" sur la mauvaise page.
        if (!user) return;
        const role = user.userRole || user.role || user.user_role;
        if (!role) return;
        if (expectedRole === 'admin') {
            if (role === 'admin' || role === 'sub_admin') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                logout();
            }
        } else {
            if (role === 'admin' || role === 'sub_admin') {
                // admin already logged in -> keep admin session but avoid auto-redirect to agent area
                logout();
            } else {
                navigate('/agent/dashboard', { replace: true });
            }
        }
    }, [ user, expectedRole, navigate ]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(employeeId, password);

        if (!result.success) {
            alert(result.error || 'Erreur de connexion');
            setLoading(false);
            return;
        }

        const role = result.user?.userRole || result.user?.role || result.user?.user_role;

        // Si le rôle ne correspond pas à la page de login actuelle, annule et purge le token
        if (expectedRole === 'admin' && !(role === 'admin' || role === 'sub_admin')) {
            logout();
            alert('Accès réservé aux administrateurs. Veuillez utiliser la page appropriée.');
            setLoading(false);
            return;
        }

        if (expectedRole === 'agent' && (role === 'admin' || role === 'sub_admin')) {
            logout();
            alert('Vous êtes connecté en tant qu\'administrateur. Veuillez utiliser la page administrateur.');
            setLoading(false);
            return;
        }

        // Redirections selon rôle
        if (role === 'admin' || role === 'sub_admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/agent/dashboard');
        }

        setLoading(false);
    };

    return (
        <div className="min-vh-100 d-flex align-items-center" style={ { background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' } }>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card card-securs fade-in">
                            <div className="card-body p-5">
                                {/* Logo */ }
                                <div className="text-center mb-4">
                                    <div className="bg-securs-blue rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={ { width: '70px', height: '70px' } }>
                                        <i className="bi bi-shield-lock text-white fs-3"></i>
                                    </div>
                                    <h2 className="fw-bold text-securs-blue">Sécuris</h2>
                                    <p className="text-muted">Système de pointage sécurisé</p>
                                </div>

                                {/* Formulaire */ }
                                <form onSubmit={ handleSubmit }>
                                    <div className="mb-4">
                                        <label htmlFor="employeeId" className="form-label fw-medium">ID UTILISATEUR</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            id="employeeId"
                                            placeholder="ADMIN001"
                                            value={ employeeId }
                                            onChange={ (e) => setEmployeeId(e.target.value.toUpperCase()) }
                                            required
                                            disabled={ loading }
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="password" className="form-label fw-medium">Mot de passe</label>
                                        <input
                                            type="password"
                                            className="form-control form-control-lg"
                                            id="password"
                                            placeholder="••••••••"
                                            value={ password }
                                            onChange={ (e) => setPassword(e.target.value) }
                                            required
                                            disabled={ loading }
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-securs-blue btn-lg w-100 py-3 fw-medium"
                                        disabled={ loading }
                                    >
                                        { loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Connexion...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                                Se connecter
                                            </>
                                        ) }
                                    </button>
                                </form>
                                <div className="mt-5 pt-4 border-top">
                                    <div className="mt-3 text-center">
                                        <span className="badge bg-info">
                                            <i className="bi bi-phone me-1"></i>
                                            Optimisé mobile
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;