import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg navbar-securs sticky-top">
            <div className="container-fluid">
                {/* Logo */ }
                <a className="navbar-brand fw-bold d-flex align-items-center" href="/">
                    <div className="bg-securs-blue rounded-circle d-flex align-items-center justify-content-center me-2" style={ { width: '36px', height: '36px' } }>
                        <i className="bi bi-shield-check text-white"></i>
                    </div>
                    Sécuris
                </a>

                {/* Bouton mobile */ }
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Contenu */ }
                <div className="collapse navbar-collapse" id="navbarContent">
                    { user && (
                        <div className="navbar-nav ms-auto align-items-center">
                            {/* Info utilisateur */ }
                            <div className="nav-item me-3">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2" style={ { width: '40px', height: '40px' } }>
                                        <i className="bi bi-person text-primary"></i>
                                    </div>
                                    <div>
                                        <div className="fw-medium">{ user.fullName }</div>
                                        <div className="small text-muted">
                                            <span className={ `badge ${ user.role === 'admin' ? 'bg-purple' : 'bg-primary' }` }>
                                                { user.role === 'admin' ? 'Administrateur' : 'Agent' }
                                            </span>
                                            <span className="ms-2">{ user.employeeId }</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bouton déconnexion */ }
                            <div className="nav-item">
                                <button
                                    onClick={ logout }
                                    className="btn btn-outline-danger btn-sm"
                                >
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