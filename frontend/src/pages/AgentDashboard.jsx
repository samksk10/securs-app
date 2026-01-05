import { useAuth } from '../contexts/AuthContext';
import { Clock, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import QRScanner from '../components/Agent/QRScanner';

const AgentDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="container py-4">
            <div className="mb-4">
                <h1 className="h3 fw-bold text-dark">Tableau de bord Agent</h1>
                <p className="text-muted mt-2">Bienvenue, { user?.fullName }</p>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card card-securs p-3">
                        <div className="d-flex align-items-center">
                            <div className="p-3 bg-light rounded">
                                <Clock size={ 24 } className="text-primary" />
                            </div>
                            <div className="ms-3">
                                <h6 className="mb-1 fw-semibold">Pointage</h6>
                                <div className="h4 fw-bold mb-0">0/2</div>
                                <small className="text-muted">Rondes aujourd'hui</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card card-securs p-3">
                        <div className="d-flex align-items-center">
                            <div className="p-3 bg-light rounded">
                                <CheckCircle size={ 24 } className="text-success" />
                            </div>
                            <div className="ms-3">
                                <h6 className="mb-1 fw-semibold">Statut</h6>
                                <div className="h4 fw-bold mb-0">En service</div>
                                <small className="text-muted">Prêt pour la ronde</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card card-securs p-3">
                        <div className="d-flex align-items-center">
                            <div className="p-3 bg-light rounded">
                                <AlertCircle size={ 24 } className="text-warning" />
                            </div>
                            <div className="ms-3">
                                <h6 className="mb-1 fw-semibold">Incidents</h6>
                                <div className="h4 fw-bold mb-0">0</div>
                                <small className="text-muted">Signalés aujourd'hui</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3">
                <div className="col-12 col-lg-6">
                    <div className="card card-securs p-3">
                        <h2 className="h5 fw-bold mb-3">Actions rapides</h2>
                        <div className="d-grid gap-2">
                            <QRScanner onScanComplete={ (result) => {
                                console.log('Scan result:', result);
                                if (result.valid) {
                                    alert('QR code valide! Procédez à la vérification faciale.');
                                }
                            } } />
                            <button type="button" className="btn btn-warning w-100 py-3 d-flex align-items-center justify-content-center">
                                <AlertCircle size={ 18 } className="me-2" />
                                Signaler un incident
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-6">
                    <div className="card card-securs p-3">
                        <h2 className="h5 fw-bold mb-3">Historique récent</h2>
                        <div className="text-center py-4 text-muted">
                            <Clock size={ 48 } className="mb-3 text-secondary" />
                            <p className="mb-1">Aucun pointage récent</p>
                            <small className="d-block mt-2">Votre historique de pointage apparaîtra ici</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;