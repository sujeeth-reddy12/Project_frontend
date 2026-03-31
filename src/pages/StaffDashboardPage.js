import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ProfileAvatar from '../components/ProfileAvatar';

export default function StaffDashboardPage() {
  const { auth, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setError('');
      const [complaintsRes, profileRes] = await Promise.all([
        axiosClient.get(`/staff/${auth.userId}/complaints`),
        axiosClient.get(`/staff/${auth.userId}/profile`),
      ]);
      setComplaints(complaintsRes.data);
      setAvailable(profileRes.data.available);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load staff dashboard data.');
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleAvailability = async () => {
    try {
      setError('');
      const res = await axiosClient.put(`/staff/${auth.userId}/availability?available=${!available}`);
      setAvailable(res.data.available);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to update availability.');
    }
  };

  const handleUpdate = async (complaintId) => {
    const draft = drafts[complaintId] || {};
    try {
      setError('');
      await axiosClient.put(`/staff/complaints/${complaintId}/status`, {
        staffId: auth.userId,
        status: draft.status || 'IN_PROGRESS',
        staffRemarks: '',
        resolutionNotes: draft.resolutionNotes || '',
      });
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to update complaint.');
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="page-brand">Smart Digital Complaint Management System</p>
          <h1>Staff Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className={`availability-badge ${available ? 'avail-on' : 'avail-off'}`}>
            {available ? '🟢 Available' : '🔴 Unavailable'}
          </div>
          <button type="button" className={available ? 'avail-btn-off' : 'avail-btn-on'} onClick={handleToggleAvailability}>
            {available ? 'Go Unavailable' : 'Go Available'}
          </button>
          <ProfileAvatar auth={auth} logout={logout} />
        </div>
      </header>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="card">
        <h2>Assigned Complaints</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr><td colSpan="4">No assigned complaints.</td></tr>
              ) : complaints.map((complaint) => {
                const draft = drafts[complaint.id] || {};
                return (
                  <tr key={complaint.id}>
                    <td>#{complaint.id}</td>
                    <td>{complaint.title}</td>
                    <td>{complaint.status}</td>
                    <td>
                      <select
                        value={draft.status || 'IN_PROGRESS'}
                        onChange={(e) => setDrafts((prev) => ({
                          ...prev,
                          [complaint.id]: { ...draft, status: e.target.value },
                        }))}
                      >
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                      <input
                        placeholder="Resolution notes"
                        value={draft.resolutionNotes || ''}
                        onChange={(e) => setDrafts((prev) => ({
                          ...prev,
                          [complaint.id]: { ...draft, resolutionNotes: e.target.value },
                        }))}
                      />
                      <button type="button" onClick={() => handleUpdate(complaint.id)}>Save</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
