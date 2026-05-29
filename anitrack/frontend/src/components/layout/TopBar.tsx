import { useEffect, useState } from 'react';
import { IconBell } from '@tabler/icons-react';
import api from '../../api/axios';
import type { AxiosResponse } from 'axios';
import type { Stats, User } from '../../types/index';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6)  return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export default function TopBar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [user, setUser]   = useState<User | null>(null);

  useEffect(() => {
    api.get('/auth/me/').then((r: AxiosResponse<User>) => setUser(r.data)).catch(() => {});
    api.get('/anime/my/stat/').then((r: AxiosResponse<Stats>) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="topbar-greeting">
          <span className="greeting-text">
            {getGreeting()}{user ? `, ${user.username}` : ''}
          </span>
        </div>

        <div className="topbar-right">
          {stats && (
            <div className="topbar-stats">
              <StatPill label="Всего"        value={stats.total_anime} />
              <StatPill label="Смотрю"       value={stats.watching} accent />
              <StatPill label="Просмотрено"  value={stats.watched} />
              <StatPill label="Планирую"     value={stats.want} />
            </div>
          )}

          <button className="topbar-icon-btn" aria-label="Уведомления">
            <IconBell size={18} stroke={1.75} />
          </button>

          <div className="topbar-avatar" title={user?.username}>
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" />
              : <span>{user?.username?.[0]?.toUpperCase() ?? '?'}</span>
            }
          </div>
        </div>
      </header>

      <style>{`
        .topbar {
          position: fixed;
          top: 0;
          left: var(--sidebar-w);
          right: 0;
          height: var(--topbar-h);
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          z-index: 90;
        }

        .greeting-text {
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .topbar-stats {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 11px;
          background: var(--bg-deep);
          border: 1px solid var(--border);
          border-radius: 99px;
          font-size: 0.75rem;
          transition: border-color var(--transition);
        }

        .stat-pill:hover { border-color: var(--border-hover); }

        .stat-pill__label { color: var(--text-dim); font-family: var(--font-display); }
        .stat-pill__value { color: var(--text); font-weight: 600; font-family: var(--font-display); }
        .stat-pill--accent .stat-pill__value { color: var(--accent); }

        .topbar-icon-btn {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: var(--bg-deep);
          border: 1px solid var(--border);
          color: var(--text-dim);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition);
        }

        .topbar-icon-btn:hover {
          color: var(--text);
          border-color: var(--border-hover);
        }

        .topbar-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          border: 2px solid var(--border);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-dim);
          color: var(--accent);
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
          transition: border-color var(--transition);
          cursor: pointer;
        }

        .topbar-avatar:hover { border-color: var(--accent); }
        .topbar-avatar img { width: 100%; height: 100%; object-fit: cover; }
      `}</style>
    </>
  );
}

function StatPill({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`stat-pill ${accent ? 'stat-pill--accent' : ''}`}>
      <span className="stat-pill__label">{label}</span>
      <span className="stat-pill__value">{value}</span>
    </div>
  );
}