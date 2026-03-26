import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ProfileAvatar from '../components/ProfileAvatar';

function statusLabel(status) {
  if (status === 'SUBMITTED' || status === 'ASSIGNED') {
    return 'Pending';
  }
  if (status === 'IN_PROGRESS') {
    return 'In Progress';
  }
  return 'Resolved';
}

export default function UserDashboardPage() {
  const { auth, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: '' });

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
      await axiosClient.post('/complaints', {
        ...form,
        userId: auth.userId,
      });
      setForm({ title: '', description: '', category: '' });
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to submit complaint.');
    }
  };

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
            <option value="Air Conditioning">Air Conditioning</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Front Desk Service">Front Desk Service</option>
            <option value="Check-in / Check-out">Check-in / Check-out</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Restaurant Service">Restaurant Service</option>
            <option value="Room Service">Room Service</option>
            <option value="Swimming Pool">Swimming Pool</option>
            <option value="Gym & Fitness">Gym & Fitness</option>
            <option value="Spa & Wellness">Spa & Wellness</option>
            <option value="Noise Complaint">Noise Complaint</option>
            <option value="Wi-Fi & Internet">Wi-Fi & Internet</option>
            <option value="Billing & Charges">Billing & Charges</option>
            <option value="Parking">Parking</option>
            <option value="Security">Security</option>
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
                  <td>{statusLabel(item.status)}</td>
                  <td>{item.assignedToName || 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Notifications</h2>
        <ul className="notification-list">
          {notifications.length === 0 ? (
            <li>No notifications yet.</li>
          ) : notifications.map((note) => (
            <li key={note.id}><strong>{note.event}</strong> - {note.message}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
