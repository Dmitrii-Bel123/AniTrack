import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import type { AxiosResponse } from 'axios';

interface Stats {
  total_anime: number;
  want: number;
  watching: number;
  watched: number;
  dropped: number;
  avg_rate: number | null;
  total_episodes: number | null;
}

interface AnimeShort {
  id: number;
  anime: {
    id: number;
    title: string;
    poster: string | null;
    episodes: number | null;
    genres: { id: number; title: string }[];
  };
  user_rate: string | null;
  user_status: 'WW' | 'PR' | 'WD' | 'DR';
}

const STATUS_LABEL: Record<string, string> = {
  WW: 'Планирую',
  PR: 'Смотрю',
  WD: 'Просмотрено',
  DR: 'Дропнуто',
};

const STATUS_BADGE: Record<string, string> = {
  WW: 'badge-want',
  PR: 'badge-watching',
  WD: 'badge-watched',
  DR: 'badge-dropped',
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<AnimeShort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/anime/my/stat/'),
      api.get('/anime/my/?ordering=-created_at'),
    ]).then(([statsRes, listRes]: [AxiosResponse<Stats>, AxiosResponse<{ results?: AnimeShort[] } | AnimeShort[]>]) => {
      setStats(statsRes.data);
      const data = listRes.data;
      const items = Array.isArray(data) ? data : (data.results ?? []);
      setRecent(items.slice(0, 6));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="db-loading">
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="db fade-in">

      {/* ── Заголовок ── */}
      <div className="db-hero">
        <div>
          <h2 className="db-heading">Обзор коллекции</h2>
          <p className="db-sub">Всё что ты смотришь, смотрел и планируешь</p>
        </div>
        <div className="db-actions">
          <Link to="/search" className="btn btn-primary">+ Добавить аниме</Link>
          <Link to="/list"   className="btn btn-ghost">Мой список</Link>
        </div>
      </div>

      {/* ── Метрики ── */}
      {stats && (
        <div className="db-metrics">
          <MetricCard label="Всего"        value={stats.total_anime} icon="◈" />
          <MetricCard label="Смотрю"       value={stats.watching}    icon="▶" accent />
          <MetricCard label="Просмотрено"  value={stats.watched}     icon="✓" />
          <MetricCard label="Планирую"     value={stats.want}        icon="◎" />
          <MetricCard label="Дропнуто"     value={stats.dropped}     icon="✕" muted />
          <MetricCard
            label="Средняя оценка"
            value={stats.avg_rate ? Number(stats.avg_rate).toFixed(1) : '—'}
            icon="★"
            accent
          />
          <MetricCard
            label="Эпизодов просмотрено"
            value={stats.total_episodes ?? 0}
            icon="⊞"
          />
        </div>
      )}

      {/* ── Прогресс-бар ── */}
      {stats && stats.total_anime > 0 && (
        <div className="card db-progress-card">
          <p className="db-section-title">Распределение по статусам</p>
          <div className="progress-bar">
            <div
              className="progress-seg seg-watching"
              style={{ width: `${(stats.watching / stats.total_anime) * 100}%` }}
              title={`Смотрю: ${stats.watching}`}
            />
            <div
              className="progress-seg seg-watched"
              style={{ width: `${(stats.watched / stats.total_anime) * 100}%` }}
              title={`Просмотрено: ${stats.watched}`}
            />
            <div
              className="progress-seg seg-want"
              style={{ width: `${(stats.want / stats.total_anime) * 100}%` }}
              title={`Планирую: ${stats.want}`}
            />
            <div
              className="progress-seg seg-dropped"
              style={{ width: `${(stats.dropped / stats.total_anime) * 100}%` }}
              title={`Дропнуто: ${stats.dropped}`}
            />
          </div>
          <div className="progress-legend">
            <LegendItem color="var(--surface-2)" label="Смотрю"      count={stats.watching} />
            <LegendItem color="var(--accent)"    label="Просмотрено" count={stats.watched} />
            <LegendItem color="var(--surface)"   label="Планирую"    count={stats.want} />
            <LegendItem color="#7a3040"           label="Дропнуто"    count={stats.dropped} />
          </div>
        </div>
      )}

      {/* ── Последние добавленные ── */}
      {recent.length > 0 && (
        <div className="db-recent">
          <div className="db-section-header">
            <p className="db-section-title">Последние добавленные</p>
            <Link to="/list" className="db-see-all">Все →</Link>
          </div>
          <div className="db-grid">
            {recent.map(item => (
              <Link to={`/list/${item.id}`} key={item.id} className="anime-card">
                <div className="anime-card__poster">
                  {item.anime.poster
                    ? <img src={item.anime.poster} alt={item.anime.title} />
                    : <div className="anime-card__no-poster">No Image</div>
                  }
                  <span className={`badge ${STATUS_BADGE[item.user_status]} anime-card__badge`}>
                    {STATUS_LABEL[item.user_status]}
                  </span>
                </div>
                <div className="anime-card__info">
                  <p className="anime-card__title">{item.anime.title}</p>
                  <div className="anime-card__meta">
                    {item.anime.episodes && (
                      <span className="anime-card__eps">{item.anime.episodes} эп.</span>
                    )}
                    {item.user_rate && (
                      <span className="anime-card__rate">★ {item.user_rate}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Пустое состояние ── */}
      {!loading && recent.length === 0 && (
        <div className="db-empty card">
          <p className="db-empty__icon">◎</p>
          <p className="db-empty__text">Список пока пуст</p>
          <Link to="/search" className="btn btn-primary">Найти аниме</Link>
        </div>
      )}

    </div>
  );
}

function MetricCard({ label, value, icon, accent, muted }: {
  label: string;
  value: number | string;
  icon: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={`metric-card card ${accent ? 'metric-card--accent' : ''} ${muted ? 'metric-card--muted' : ''}`}>
      <span className="metric-icon">{icon}</span>
      <span className="metric-value">{value}</span>
      <span className="metric-label">{label}</span>
    </div>
  );
}

function LegendItem({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="legend-item">
      <span className="legend-dot" style={{ background: color }} />
      <span className="legend-label">{label}</span>
      <span className="legend-count">{count}</span>
    </div>
  );
}