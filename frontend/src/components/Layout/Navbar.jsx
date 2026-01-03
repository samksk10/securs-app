import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import Button from '../Common/Button';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <h1 className="text-xl font-bold text-gray-800">Sécuris</h1>
                    { user && (
                        <span className="ml-4 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                            { user.role === 'admin' ? 'Administrateur' : 'Agent' }
                        </span>
                    ) }
                </div>

                { user && (
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-gray-700">
                            <User className="w-5 h-5 mr-2" />
                            <span>{ user.fullName }</span>
                        </div>
                        <Button onClick={ logout } variant="secondary">
                            <LogOut className="w-4 h-4 mr-2" />
                            Déconnexion
                        </Button>
                    </div>
                ) }
            </div>
        </nav>
    );
};

export default Navbar;