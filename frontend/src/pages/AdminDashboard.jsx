import { useAuth } from '../contexts/AuthContext';
import { Users, Clock, AlertTriangle, Download } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();

    const stats = [
        { label: 'Agents actifs', value: '3', icon: Users, color: 'blue' },
        { label: 'Pointages aujourd\'hui', value: '0', icon: Clock, color: 'green' },
        { label: 'Incidents en cours', value: '0', icon: AlertTriangle, color: 'orange' },
    ];

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Administrateur</h1>
                <p className="text-gray-600 mt-2">Bienvenue, { user?.fullName }</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                { stats.map((stat, index) => (
                    <div key={ index } className="card">
                        <div className="flex items-center">
                            <div className={ `p-3 bg-${ stat.color }-100 rounded-lg` }>
                                <stat.icon className={ `w-6 h-6 text-${ stat.color }-600` } />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold">{ stat.label }</h3>
                                <p className="text-2xl font-bold text-gray-900">{ stat.value }</p>
                            </div>
                        </div>
                    </div>
                )) }

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Download className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Exports</h3>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                            <p className="text-sm text-gray-500">Ce mois</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Actions rapides</h2>
                    <div className="space-y-3">
                        <button className="w-full btn btn-primary py-3">
                            <Users className="w-5 h-5 inline mr-2" />
                            Gérer les agents
                        </button>
                        <button className="w-full btn bg-green-100 text-green-700 hover:bg-green-200 py-3">
                            <Clock className="w-5 h-5 inline mr-2" />
                            Générer QR code du jour
                        </button>
                        <button className="w-full btn bg-orange-100 text-orange-700 hover:bg-orange-200 py-3">
                            <AlertTriangle className="w-5 h-5 inline mr-2" />
                            Voir les incidents
                        </button>
                        <button className="w-full btn bg-purple-100 text-purple-700 hover:bg-purple-200 py-3">
                            <Download className="w-5 h-5 inline mr-2" />
                            Exporter les données
                        </button>
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Activité récente</h2>
                    <div className="space-y-4">
                        <div className="text-center py-8 text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Aucune activité récente</p>
                            <p className="text-sm mt-2">Les actions des agents apparaîtront ici</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;