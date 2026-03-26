import { useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ProfileAvatar from '../components/ProfileAvatar';

export default function AdminDashboardPage() {
  const { auth, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [complaints, setComplaints] = useState([]);
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const staffUsers = useMemo(() => users.filter((user) => user.role === 'STAFF'), [users]);

  const chartData = useMemo(() => ([
    { name: 'Total', value: summary.total },
    { name: 'Pending', value: summary.pending },
    { name: 'In Progress', value: summary.inProgress },
    { name: 'Resolved', value: summary.resolved },
  ]), [summary]);

  const pieData = useMemo(() => ([
    { name: 'Pending', value: summary.pending },
    { name: 'In Progress', value: summary.inProgress },
    { name: 'Resolved', value: summary.resolved },
  ]), [summary]);

  const loadData = async () => {
    try {
      setError('');
      const [usersRes, summaryRes, complaintsRes] = await Promise.all([
        axiosClient.get('/admin/users'),
        axiosClient.get('/reports/summary'),
        axiosClient.get('/admin/complaints'),
      ]);
      setUsers(usersRes.data);
      setSummary(summaryRes.data);
      setComplaints(complaintsRes.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load admin dashboard data.');
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveUser = async (event) => {
    event.preventDefault();
    try {
      setError('');
      if (editingId) {
        await axiosClient.put(`/admin/users/${editingId}`, form);
      } else {
        await axiosClient.post('/admin/users', form);
      }
      setForm({ name: '', email: '', password: '', role: 'USER' });
      setEditingId(null);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save user.');
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: 'changeme123',
      role: user.role,
    });
  };

  const handleDelete = async (userId) => {
    try {
      setError('');
      await axiosClient.delete(`/admin/users/${userId}`);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleAssign = async (complaintId) => {
    const draft = assignmentDrafts[complaintId] || {};
    try {
      setError('');
      await axiosClient.put(`/admin/complaints/${complaintId}/assign`, {
        adminId: auth.userId,
        staffId: Number(draft.staffId),
        adminRemarks: draft.adminRemarks || '',
      });
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to assign complaint.');
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="page-brand">Smart Digital Complaint Management System</p>
          <h1>Admin Dashboard</h1>
        </div>
        <div>
          <ProfileAvatar auth={auth} logout={logout} />
        </div>
      </header>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="grid summary-grid">
        <div className="summary-card"><span>Total</span><strong>{summary.total}</strong></div>
        <div className="summary-card"><span>Pending</span><strong>{summary.pending}</strong></div>
        <div className="summary-card"><span>In Progress</span><strong>{summary.inProgress}</strong></div>
        <div className="summary-card"><span>Resolved</span><strong>{summary.resolved}</strong></div>
      </section>

      <section className="card">
        <h2>Manage Users and Staff</h2>
        <form className="form-grid" onSubmit={handleSaveUser}>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="USER">User</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit">{editingId ? 'Update' : 'Add'} User</button>
        </form>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button type="button" onClick={() => handleEdit(user)}>Edit</button>
                    <button type="button" className="danger" onClick={() => handleDelete(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>All Complaints and Assignment</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>User</th>
                <th>Status</th>
                <th>Assign</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => {
                const draft = assignmentDrafts[complaint.id] || {};
                return (
                  <tr key={complaint.id}>
                    <td>#{complaint.id}</td>
                    <td>{complaint.title}</td>
                    <td>{complaint.submittedByName}</td>
                    <td>{complaint.status}</td>
                    <td>
                      <select
                        value={draft.staffId || ''}
                        onChange={(e) => setAssignmentDrafts((prev) => ({
                          ...prev,
                          [complaint.id]: { ...draft, staffId: e.target.value },
                        }))}
                      >
                        <option value="">Select staff</option>
                        {staffUsers.map((staff) => (
                          <option key={staff.id} value={staff.id}>{staff.name}</option>
                        ))}
                      </select>
                      <input
                        placeholder="Remarks"
                        value={draft.adminRemarks || ''}
                        onChange={(e) => setAssignmentDrafts((prev) => ({
                          ...prev,
                          [complaint.id]: { ...draft, adminRemarks: e.target.value },
                        }))}
                      />
                      <button type="button" onClick={() => handleAssign(complaint.id)} disabled={!draft.staffId}>Assign</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card chart-grid">
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#1a73b8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={85} label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
