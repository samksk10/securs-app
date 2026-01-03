import { useAuth } from '../contexts/AuthContext';
import { Clock, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

const AgentDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Agent</h1>
                <p className="text-gray-600 mt-2">Bienvenue, { user?.fullName }</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="card">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Pointage</h3>
                            <p className="text-2xl font-bold text-gray-900">0/2</p>
                            <p className="text-sm text-gray-500">Rondes aujourd'hui</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Statut</h3>
                            <p className="text-2xl font-bold text-gray-900">En service</p>
                            <p className="text-sm text-gray-500">Prêt pour la ronde</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Incidents</h3>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                            <p className="text-sm text-gray-500">Signalés aujourd'hui</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Actions rapides</h2>
                    <div className="space-y-3">
                        <button className="w-full btn btn-primary py-3">
                            <MapPin className="w-5 h-5 inline mr-2" />
                            Scanner QR Code pour pointer
                        </button>
                        <button className="w-full btn bg-orange-100 text-orange-700 hover:bg-orange-200 py-3">
                            <AlertCircle className="w-5 h-5 inline mr-2" />
                            Signaler un incident
                        </button>
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Historique récent</h2>
                    <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucun pointage récent</p>
                        <p className="text-sm mt-2">Votre historique de pointage apparaîtra ici</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;