import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { AxiosResponse } from 'axios';

interface Stats {
  total_anime: number;
  watching: number;
  watched: number;
  want: number;
}

interface User {
  username: string;
  avatar: string | null;
}

export default function TopBar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api.get('/auth/me/').then((r: AxiosResponse<User>) => setUser(r.data)).catch(() => {});
    api.get('/anime/my/stat/').then((r: AxiosResponse<Stats>) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="page-title">
          {user ? `Привет, ${user.username}` : 'AniTrack'}
        </h1>
      </div>

      <div className="topbar-right">
        {stats && (
          <div className="topbar-stats">
            <StatPill label="Всего" value={stats.total_anime} />
            <StatPill label="Смотрю" value={stats.watching} accent />
            <StatPill label="Просмотрено" value={stats.watched} />
            <StatPill label="Планирую" value={stats.want} />
          </div>
        )}

        <div className="topbar-avatar">
          {user?.avatar
            ? <img src={user.avatar} alt="avatar" className="avatar-img" />
            : <span className="avatar-placeholder">
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </span>
          }
        </div>
      </div>

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
          padding: 0 32px;
          z-index: 90;
          backdrop-filter: blur(10px);
        }

        .page-title {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .topbar-stats {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          background: var(--bg-deep);
          border: 1px solid var(--border);
          border-radius: 99px;
          font-size: 0.78rem;
        }

        .stat-pill__label {
          color: var(--text-dim);
          font-family: var(--font-display);
        }

        .stat-pill__value {
          color: var(--text);
          font-weight: 600;
          font-family: var(--font-display);
        }

        .stat-pill--accent .stat-pill__value {
          color: var(--accent);
        }

        .topbar-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid var(--border);
          flex-shrink: 0;
        }

        .avatar-img {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%; height: 100%;
          background: var(--accent-dim);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.9rem;
        }
      `}</style>
    </header>
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