import { NavLink, useNavigate } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconList,
  IconSearch,
  IconChartBar,
  IconUser,
  IconLogout,
} from '@tabler/icons-react';

const NAV = [
  { to: '/',        icon: IconLayoutDashboard, label: 'Dashboard' },
  { to: '/list',    icon: IconList,            label: 'Мой список' },
  { to: '/search',  icon: IconSearch,          label: 'Поиск' },
  { to: '/stats',   icon: IconChartBar,        label: 'Статистика' },
  { to: '/profile', icon: IconUser,            label: 'Профиль' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">A</div>
          <span className="logo-text">AniTrack</span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item--active' : ''}`
              }
            >
              <Icon size={18} stroke={1.75} className="nav-icon" />
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="nav-item nav-logout" onClick={handleLogout}>
          <IconLogout size={18} stroke={1.75} className="nav-icon" />
          <span className="nav-label">Выйти</span>
        </button>
      </aside>

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
          padding: 20px 0 16px;
          z-index: 100;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 18px 20px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 12px;
        }

        .logo-mark {
          width: 32px; height: 32px;
          background: var(--accent);
          color: #fff;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1rem;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(218,123,147,0.35);
        }

        .logo-text {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1rem;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding: 0 10px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 10px;
          border-radius: 9px;
          color: var(--text-dim);
          font-size: 0.845rem;
          font-weight: 500;
          transition: all var(--transition);
          background: transparent;
          width: 100%;
          text-align: left;
          border: none;
          cursor: pointer;
        }

        .nav-item:hover {
          background: var(--bg-hover);
          color: var(--text-muted);
        }

        .nav-item--active {
          background: var(--accent-dim) !important;
          color: var(--accent) !important;
          font-weight: 600;
        }

        .nav-item--active .nav-icon {
          color: var(--accent);
        }

        .nav-icon {
          flex-shrink: 0;
          transition: color var(--transition);
        }

        .nav-label {
          font-family: var(--font-display);
          letter-spacing: -0.01em;
        }

        .nav-logout {
          margin: 0 10px;
          border-top: 1px solid var(--border);
          padding-top: 14px;
          margin-top: 4px;
          border-radius: 0;
        }

        .nav-logout:hover {
          color: var(--accent) !important;
          background: transparent !important;
        }
      `}</style>
    </>
  );
}