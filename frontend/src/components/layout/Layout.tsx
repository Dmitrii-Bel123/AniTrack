import { type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV = [
  { to: '/',        label: 'Коллекция',  end: true },
  { to: '/search',  label: 'Поиск' },
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
      <header className="shell-head">
        <div className="shell-head__in">
          <NavLink to="/" className="wordmark">AniTrack</NavLink>
          <nav className="shell-nav">
            {NAV.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) => (isActive ? 'is-active' : '')}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <button className="shell-out" onClick={logout}>Выйти</button>
        </div>
      </header>
      <main className="shell-body">{children}</main>
    </>
  );
}
