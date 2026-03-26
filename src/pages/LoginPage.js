import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

function roleRoute(role) {
  if (role === 'ADMIN') {
    return '/admin-dashboard';
  }
  if (role === 'STAFF') {
    return '/staff-dashboard';
  }
  return '/user-dashboard';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { auth, isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={roleRoute(auth.role)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosClient.post('/auth/login', form);
      login(response.data);
      navigate(roleRoute(response.data.role), { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="page-brand">Smart Digital Complaint Management System</p>
        <h1>Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        <p className="switch-link">No account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
}
