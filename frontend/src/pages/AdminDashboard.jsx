import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { useAuth } from '../contexts/AuthContext';
import { Users, Clock, AlertTriangle, Download } from 'lucide-react';
import QRGenerator from '../components/Admin/QRGenerator';
import DetailedHistory from '../components/Admin/DetailedHistory';

const AdminDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [ activeTab, setActiveTab ] = useState('dashboard');

    // Rediriger vers login si l'utilisateur se déconnecte
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [ isAuthenticated, navigate ]);

    // Écouter l'événement de déconnexion
    useEffect(() => {
        const handleLogout = () => {
            navigate('/login', { replace: true });
        };

        window.addEventListener('userLogout', handleLogout);
        return () => window.removeEventListener('userLogout', handleLogout);
    }, [ navigate ]);

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

            <Tabs
                activeKey={ activeTab }
                onSelect={ (k) => setActiveTab(k) }
                className="mb-4"
            >
                <Tab eventKey="dashboard" title="Dashboard">
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
                                        <button className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center" onClick={ () => setActiveTab('agents') }>
                                            <Users className="me-2" />
                                            <span>Gérer les agents</span>
                                        </button>
                                        <button className="btn btn-success w-100 py-2 d-flex align-items-center justify-content-center" onClick={ () => setActiveTab('qr') }>
                                            <Clock className="me-2" />
                                            <span>Générer QR code du jour</span>
                                        </button>
                                        <button className="btn btn-warning w-100 py-2 d-flex align-items-center justify-content-center" onClick={ () => alert('Fonctionnalité à implémenter : voir les incidents') }>
                                            <AlertTriangle className="me-2" />
                                            <span>Voir les incidents</span>
                                        </button>
                                        <button className="btn btn-secondary w-100 py-2 d-flex align-items-center justify-content-center" onClick={ () => downloadExcel([], 'export-admin') }>
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
                </Tab>

                <Tab eventKey="history" title="Historique Détaillé">
                    <div className="card card-securs">
                        <div className="card-body">
                            <DetailedHistory />
                        </div>
                    </div>
                </Tab>

                <Tab eventKey="agents" title="Gestion Agents">
                    <div className="card card-securs p-3">
                        <div className="card-body">
                            {/* placeholder: keep or replace with actual agent management component */ }
                            <button className="btn btn-primary">Gérer les agents</button>
                        </div>
                    </div>
                </Tab>

                <Tab eventKey="qr" title="QR Codes">
                    <div className="mb-4">
                        <QRGenerator />
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;