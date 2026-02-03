import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import LoginPage from './pages/LoginPage';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CheckIn from './pages/CheckIn';
import NotFoundPage from './pages/NotFoundPage';

// Composant pour la redirection automatique
const HomeRedirect = () => {
  const { user } = useAuth();

  if (user?.role === 'admin' || user?.role === 'sub_admin') {
    return <Navigate to="/admin" />;
  }

  return <Navigate to="/agent" />;
};

// Layout avec Navbar conditionnelle
const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <>
      { user && <Navbar /> }
      <div className={ user ? "pt-4" : "" }>
        { children }
      </div>
    </>
  );
};

// Contenu principal
const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={ <LoginPage /> } />

      <Route path="/" element={ <HomeRedirect /> } />

      <Route path="/agent" element={
        <ProtectedRoute>
          <Layout>
            <AgentDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/checkin" element={
        <ProtectedRoute>
          <Layout>
            <CheckIn />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={ true }>
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={ <NotFoundPage /> } />
    </Routes>
  );
};

// App principale
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;