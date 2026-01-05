import { useAuth } from '../contexts/AuthContext';
import { Users, Clock, AlertTriangle, Download } from 'lucide-react';
import QRGenerator from '../components/Admin/QRGenerator';

const AdminDashboard = () => {
    const { user } = useAuth();

    const stats = [
        { label: "Agents actifs", value: "3", icon: Users, color: "primary" },
        { label: "Pointages aujourd'hui", value: "0", icon: Clock, color: "success" },
        { label: "Incidents en cours", value: "0", icon: AlertTriangle, color: "warning" },
    ];

    return (
        <div className="container py-4">
            <div className="mb-4">
                <h1 className="h3 fw-bold text-dark">Tableau de bord Administrateur</h1>
                <p className="text-muted mt-2">Bienvenue, { user?.fullName }</p>
            </div>

            <div className="row g-3 mb-4">
                { stats.map((stat, index) => (
                    <div key={ index } className="col-12 col-md-6 col-lg-3">
                        <div className="card card-securs h-100">
                            <div className="card-body d-flex align-items-center">
                                <div className={ `p-3 rounded me-3 bg-${ stat.color } text-white` }>
                                    <stat.icon className="" />
                                </div>
                                <div>
                                    <h3 className="mb-1 fs-6 fw-semibold text-dark">{ stat.label }</h3>
                                    <p className="mb-0 fs-4 fw-bold text-dark">{ stat.value }</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )) }

                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card card-securs h-100">
                        <div className="card-body d-flex align-items-center">
                            <div className="p-3 rounded me-3 bg-secondary text-white">
                                <Download />
                            </div>
                            <div>
                                <h3 className="mb-1 fs-6 fw-semibold text-dark">Exports</h3>
                                <p className="mb-0 fs-4 fw-bold text-dark">0</p>
                                <p className="mb-0 text-muted small">Ce mois</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3">
                <div className="col-12 col-lg-6">
                    <div className="card card-securs">
                        <div className="card-body">
                            <h2 className="h5 fw-bold mb-3">Actions rapides</h2>
                            <div className="d-grid gap-2">
                                <button className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center">
                                    <Users className="me-2" />
                                    <span>Gérer les agents</span>
                                </button>
                                <button className="btn btn-success w-100 py-2 d-flex align-items-center justify-content-center">
                                    <Clock className="me-2" />
                                    <span>Générer QR code du jour</span>
                                </button>
                                <button className="btn btn-warning w-100 py-2 d-flex align-items-center justify-content-center">
                                    <AlertTriangle className="me-2" />
                                    <span>Voir les incidents</span>
                                </button>
                                <button className="btn btn-secondary w-100 py-2 d-flex align-items-center justify-content-center">
                                    <Download className="me-2" />
                                    <span>Exporter les données</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-6">
                    <div className="card card-securs">
                        <div className="card-body">
                            <h2 className="h5 fw-bold mb-3">Activité récente</h2>
                            <div className="text-center py-5 text-muted">
                                <Clock className="mb-3" />
                                <p className="mb-1">Aucune activité récente</p>
                                <p className="small">Les actions des agents apparaîtront ici</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <QRGenerator />
            </div>
        </div>
    );
};

export default AdminDashboard;