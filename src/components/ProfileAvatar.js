import { useState, useRef, useEffect } from 'react';

export default function ProfileAvatar({ auth, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = auth.name
    ? auth.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const roleColor = { ADMIN: '#9a680a', STAFF: '#1a4f9c', USER: '#1c7052' }[auth.role] || '#555';
  const roleBg   = { ADMIN: '#ffeec9', STAFF: '#ddeaff', USER: '#d5f4e8' }[auth.role] || '#eee';

  return (
    <div className="profile-wrap" ref={ref}>
      <button type="button" className="avatar-btn" onClick={() => setOpen((o) => !o)} aria-label="Profile">
        <span className="avatar-circle">{initials}</span>
      </button>

      {open && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-top">
            <span className="avatar-circle avatar-lg">{initials}</span>
            <div>
              <p className="profile-name">{auth.name}</p>
              <p className="profile-email">{auth.email}</p>
            </div>
          </div>
          <div className="profile-divider" />
          <div className="profile-row">
            <span className="profile-label">Role</span>
            <span className="profile-badge" style={{ background: roleBg, color: roleColor }}>{auth.role}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">ID</span>
            <span className="profile-value">#{auth.userId}</span>
          </div>
          <div className="profile-divider" />
          <button type="button" className="profile-logout" onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}
