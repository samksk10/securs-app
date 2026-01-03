import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import LoginPage from './pages/LoginPage';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

// Composant pour la redirection automatique
const HomeRedirect = () => {
  const { user } = useAuth();

  if (user?.role === 'admin' || user?.role === 'sub_admin') {
    return <Navigate to="/admin" />;
  }

  return <Navigate to="/agent" />;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <>
      { user && <Navbar /> }
      <div className={ user ? "pt-16" : "" }>
        <Routes>
          <Route path="/login" element={ <LoginPage /> } />

          <Route path="/" element={ <HomeRedirect /> } />

          <Route path="/agent" element={
            <ProtectedRoute>
              <AgentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={ <NotFoundPage /> } />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <ToastContainer position="top-right" autoClose={ 3000 } />
      </AuthProvider>
    </Router>
  );
}

export default App;