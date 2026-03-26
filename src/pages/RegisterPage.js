import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axiosClient.post('/auth/register', form);
      navigate('/login', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="page-brand">Smart Digital Complaint Management System</p>
        <h1>Register</h1>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
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
        <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
          <option value="USER">User</option>
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </select>
        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
        <p className="switch-link">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
