import { useEffect, useState, useMemo } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ProfileAvatar from '../components/ProfileAvatar';

function statusLabel(status) {
  if (status === 'SUBMITTED' || status === 'ASSIGNED') return 'Pending';
  if (status === 'IN_PROGRESS') return 'In Progress';
  return 'Resolved';
}

function statusClass(status) {
  if (status === 'SUBMITTED' || status === 'ASSIGNED') return 'nbadge nbadge-pending';
  if (status === 'IN_PROGRESS') return 'nbadge nbadge-progress';
  return 'nbadge nbadge-resolved';
}

function eventLabel(event) {
  if (!event) return event;
  return event.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function eventClass(event) {
  if (!event) return 'nbadge';
  if (event.includes('RESOLVED')) return 'nbadge nbadge-resolved';
  if (event.includes('IN_PROGRESS') || event.includes('PROGRESS')) return 'nbadge nbadge-progress';
  if (event.includes('ASSIGNED')) return 'nbadge nbadge-assigned';
  return 'nbadge nbadge-pending';
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function UserDashboardPage() {
  const { auth, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [selectedComplaintId, setSelectedComplaintId] = useState('all');

  const loadData = async () => {
    try {
      setError('');
      const [complaintRes, notificationRes] = await Promise.all([
        axiosClient.get(`/complaints/user/${auth.userId}`),
        axiosClient.get(`/complaints/user/${auth.userId}/notifications`),
      ]);
      setComplaints(complaintRes.data);
      setNotifications(notificationRes.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load user dashboard data.');
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError('');
      await axiosClient.post('/complaints', { ...form, userId: auth.userId });
      setForm({ title: '', description: '', category: '' });
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to submit complaint.');
    }
  };

  const filteredNotifications = useMemo(() => {
    if (selectedComplaintId === 'all') return notifications;
    return notifications.filter((n) => String(n.complaintId) === String(selectedComplaintId));
  }, [notifications, selectedComplaintId]);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="page-brand">Smart Digital Complaint Management System</p>
          <h1>User Dashboard</h1>
        </div>
        <div>
          <ProfileAvatar auth={auth} logout={logout} />
        </div>
      </header>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="card">
        <h2>Submit Complaint</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input
            placeholder="Title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
          <select
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
            required
          >
            <option value="">Select Category</option>
            <option value="Room Cleanliness">Room Cleanliness</option>
            <option value="Room Maintenance">Room Maintenance</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Front Desk Service">Front Desk Service</option>
            <option value="Check-in / Check-out">Check-in / Check-out</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Room Service">Room Service</option>
            <option value="Noise Complaint">Noise Complaint</option>
            <option value="Wi-Fi & Internet">Wi-Fi & Internet</option>
            <option value="Billing & Charges">Billing & Charges</option>
            <option value="Other">Other</option>
          </select>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            required
          />
          <button type="submit">Submit Complaint</button>
        </form>
      </section>

      <section className="card">
        <h2>My Complaints</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr><td colSpan="5">No complaints found.</td></tr>
              ) : complaints.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td><span className={statusClass(item.status)}>{statusLabel(item.status)}</span></td>
                  <td>{item.assignedToName || 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="notif-header">
          <h2>Notifications</h2>
          <select
            className="notif-filter"
            value={selectedComplaintId}
            onChange={(e) => setSelectedComplaintId(e.target.value)}
          >
            <option value="all">All Complaints</option>
            {complaints.map((c) => (
              <option key={c.id} value={c.id}>#{c.id} — {c.title}</option>
            ))}
          </select>
        </div>
        <div className="notif-list">
          {filteredNotifications.length === 0 ? (
            <p className="notif-empty">No notifications for this selection.</p>
          ) : filteredNotifications.map((note) => (
            <div key={note.id} className="notif-item">
              <div className="notif-item-top">
                <span className={eventClass(note.event)}>{eventLabel(note.event)}</span>
                {note.complaintId && <span className="notif-complaint-tag">Complaint #{note.complaintId}</span>}
                <span className="notif-time">{formatTime(note.createdAt)}</span>
              </div>
              <p className="notif-msg">{note.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
