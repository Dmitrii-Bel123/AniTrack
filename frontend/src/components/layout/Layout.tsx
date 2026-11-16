import { type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { IconArrowUpRight, IconLogout } from '@tabler/icons-react';
import Wordmark from '../ui/Wordmark';

const NAV = [
  { to: '/',        label: 'Коллекция',  end: true },
  { to: '/stats',   label: 'Статистика' },
  { to: '/profile', label: 'Профиль' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  return (
    <>
      <a className="skip-link" href="#main-content">К содержимому</a>
      <header className="shell-head">
        <div className="shell-head__in">
          <NavLink to="/" className="wordmark"><Wordmark /></NavLink>
          <nav className="shell-nav" aria-label="Основная навигация">
            {NAV.map((n, index) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) => (isActive ? 'is-active' : '')}
              >
                <span className="nav-index" aria-hidden="true">0{index + 1}</span>{n.label}
              </NavLink>
            ))}
          </nav>
          <button className="shell-out" onClick={logout}><span>Выйти</span><IconLogout size={17} aria-hidden="true" /></button>
        </div>
      </header>
      <main className="shell-body" id="main-content" tabIndex={-1}>{children}</main>
      <footer className="shell-footer"><span>ANITRACK © {new Date().getFullYear()}</span><span>Хорошие истории остаются с тобой <IconArrowUpRight size={14} aria-hidden="true" /></span></footer>
    </>
  );
}
