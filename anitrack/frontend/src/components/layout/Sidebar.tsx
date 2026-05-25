import { NavLink, useNavigate } from 'react-router-dom';

const NAV = [
  { to: '/',        icon: '⊞', label: 'Dashboard' },
  { to: '/list',    icon: '◈', label: 'Мой список' },
  { to: '/search',  icon: '◎', label: 'Поиск' },
  { to: '/stats',   icon: '▣', label: 'Статистика' },
  { to: '/profile', icon: '◉', label: 'Профиль' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-mark">A</span>
        <span className="logo-text">AniTrack</span>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item--active' : ''}`
            }
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="nav-item nav-logout" onClick={handleLogout}>
        <span className="nav-icon">⊗</span>
        <span className="nav-label">Выйти</span>
      </button>

      <style>{`
        .sidebar {
          position: fixed;
          top: 0; left: 0;
          width: var(--sidebar-w);
          height: 100vh;
          background: var(--bg-card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          z-index: 100;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 20px 28px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }

        .logo-mark {
          width: 34px; height: 34px;
          background: var(--accent);
          color: #fff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .logo-text {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 12px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all var(--transition);
          background: transparent;
          width: 100%;
          text-align: left;
        }

        .nav-item:hover {
          background: var(--bg-hover);
          color: var(--text);
        }

        .nav-item--active {
          background: var(--accent-dim);
          color: var(--accent) !important;
          font-weight: 600;
        }

        .nav-icon {
          font-size: 1rem;
          width: 20px;
          text-align: center;
          flex-shrink: 0;
        }

        .nav-label {
          font-family: var(--font-display);
          letter-spacing: -0.01em;
        }

        .nav-logout {
          margin: 12px;
          color: var(--text-dim);
          border-top: 1px solid var(--border);
          padding-top: 22px;
          border-radius: 0 0 var(--radius-sm) var(--radius-sm);
        }

        .nav-logout:hover {
          color: var(--accent);
          background: var(--accent-dim);
        }
      `}</style>
    </aside>
  );
}