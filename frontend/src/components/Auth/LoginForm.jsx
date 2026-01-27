import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
    const [ employeeId, setEmployeeId ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(employeeId, password);

        if (!result.success) {
            alert(result.error || 'Erreur de connexion');
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
                                            name="employeeId"
                                            autoComplete="username"
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
                                            name="password"
                                            autoComplete="current-password"
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