import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import UserDashboardPage from './pages/UserDashboardPage';

function getRouteByRole(role) {
  if (role === 'ADMIN') {
    return '/admin-dashboard';
  }
  if (role === 'STAFF') {
    return '/staff-dashboard';
  }
  return '/user-dashboard';
}

function RootRedirect() {
  const { auth, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getRouteByRole(auth.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/user-dashboard"
        element={(
          <PrivateRoute allowedRoles={['USER']}>
            <UserDashboardPage />
          </PrivateRoute>
        )}
      />
      <Route
        path="/admin-dashboard"
        element={(
          <PrivateRoute allowedRoles={['ADMIN']}>
            <AdminDashboardPage />
          </PrivateRoute>
        )}
      />
      <Route
        path="/staff-dashboard"
        element={(
          <PrivateRoute allowedRoles={['STAFF']}>
            <StaffDashboardPage />
          </PrivateRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
