import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
            logout();
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-securs shadow-sm">
            <div className="container-fluid">
                {/* Logo */ }
                <a className="navbar-brand d-flex align-items-center fw-bold" href="/">
                    <div className="bg-securs-blue rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={ { width: '36px', height: '36px' } }>
                        <i className="bi bi-shield-check text-white"></i>
                    </div>
                    Sécuris
                </a>

                {/* Bouton mobile */ }
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarSecurs" aria-controls="navbarSecurs">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Contenu */ }
                <div className="collapse navbar-collapse" id="navbarSecurs">
                    { user && (
                        <div className="navbar-nav ms-auto align-items-center">
                            {/* Info utilisateur */ }
                            <div className="nav-item me-4">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                                        style={ { width: '42px', height: '42px' } }>
                                        <i className="bi bi-person-fill text-primary"></i>
                                    </div>
                                    <div>
                                        <div className="fw-medium">{ user.fullName }</div>
                                        <div>
                                            <span className={ `badge ${ user.role === 'admin' ? 'bg-purple' : 'bg-primary' } me-2` }>
                                                { user.role === 'admin' ? 'Admin' : 'Agent' }
                                            </span>
                                            <small className="text-muted">{ user.employeeId }</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bouton déconnexion */ }
                            <div className="nav-item">
                                <button onClick={ handleLogout } className="btn btn-outline-danger btn-sm">
                                    <i className="bi bi-box-arrow-right me-1"></i>
                                    Déconnexion
                                </button>
                            </div>
                        </div>
                    ) }
                </div>
            </div>
        </nav>
    );
};

export default Navbar;