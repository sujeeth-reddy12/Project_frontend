import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ allowedRoles, children }) {
  const { auth, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return (
      <div className="unauthorized-wrap">
        <div className="unauthorized-card">
          <h2>Access Denied</h2>
          <p>
            You are logged in as <strong>{auth.role}</strong> and do not have permission to view this dashboard.
          </p>
          <button type="button" onClick={logout}>Logout</button>
        </div>
      </div>
    );
  }

  return children;
}
