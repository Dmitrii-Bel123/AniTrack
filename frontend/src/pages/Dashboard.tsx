import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconPlayerPlay, IconPlus, IconChartBar } from '@tabler/icons-react';
import api from '../api/axios';
import type { AxiosResponse } from 'axios';
import type { Stats, UserAnime } from '../types/index';
import { STATUS_LABEL, STATUS_BADGE } from '../types/index';

// ── Анимированный счётчик ─────────────────────────────────────
function useCountUp(target: number, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
      else setVal(target);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

// ── Spotlight — аниме которое сейчас смотришь ─────────────────
function Spotlight({ item }: { item: UserAnime }) {
  return (
    <Link to={`/list/${item.id}`} className="spotlight">
      {item.anime.poster && (
        <div
          className="spotlight-bg"
          style={{ backgroundImage: `url(${item.anime.poster})` }}
        />
      )}
      <div className="spotlight-overlay" />
      <div className="spotlight-content">
        <div className="spotlight-poster">
          {item.anime.poster
            ? <img src={item.anime.poster} alt={item.anime.title} />
            : <IconPlayerPlay size={28} stroke={1.5} />
          }
        </div>
        <div className="spotlight-info">
          <span className="spotlight-tag">▶ сейчас смотришь</span>
          <h2 className="spotlight-title">{item.anime.title}</h2>
          <p className="spotlight-meta">
            {item.anime.episodes && `${item.anime.episodes} эп.`}
            {item.anime.genres.length > 0 && ` · ${item.anime.genres.slice(0, 2).map(g => g.title).join(', ')}`}
          </p>
          <div className="spotlight-btns">
            <span className="btn btn-primary btn-sm">Открыть</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Метрика ───────────────────────────────────────────────────
function MetricCard({ label, value, accent, muted, float }: {
  label: string;
  value: number;
  accent?: boolean;
  muted?: boolean;
  float?: boolean;
}) {
  const animated = useCountUp(float ? 0 : value);
  return (
    <div className={`metric-card card ${accent ? 'metric-card--accent' : ''} ${muted ? 'metric-card--muted' : ''}`}>
      <span className="metric-value">
        {float ? (value > 0 ? value.toFixed(1) : '—') : animated}
      </span>
      <span className="metric-label">{label}</span>
    </div>
  );
}

// ── Главный компонент ─────────────────────────────────────────
export default function Dashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [recent,  setRecent]  = useState<UserAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    Promise.all([
      api.get('/anime/my/stat/'),
      api.get('/anime/my/?ordering=-created_at'),
    ]).then(([sRes, lRes]: [AxiosResponse<Stats>, AxiosResponse<UserAnime[] | { results: UserAnime[] }>]) => {
      setStats(sRes.data);
      const data = lRes.data;
      const items = Array.isArray(data) ? data : (data.results ?? []);
      setRecent(items.slice(0, 6));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const watching = recent.find(i => i.user_status === 'PR');

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
        <span className="spinner" style={{ width:32, height:32 }} />
      </div>
    );
  }

  return (
    <div className="db fade-in">

      {/* Заголовок + кнопки */}
      <div className="db-hero">
        <div>
          <h2 className="db-heading">Обзор коллекции</h2>
          <p className="db-sub">Всё что ты смотришь, смотрел и планируешь</p>
        </div>
        <div className="db-actions">
          <Link to="/search" className="btn btn-primary">
            <IconPlus size={16} stroke={2} /> Добавить
          </Link>
          <Link to="/stats" className="btn btn-ghost">
            <IconChartBar size={16} stroke={1.75} /> Статистика
          </Link>
        </div>
      </div>

      {/* Spotlight */}
      {watching && <Spotlight item={watching} />}

      {/* Метрики */}
      {stats && (
        <div className="db-metrics">
          <MetricCard label="Всего аниме"    value={stats.total_anime} />
          <MetricCard label="Просмотрено"    value={stats.watched} />
          <MetricCard label="Смотрю"         value={stats.watching} accent />
          <MetricCard label="Планирую"       value={stats.want} />
          <MetricCard label="Дропнуто"       value={stats.dropped} muted />
          <MetricCard label="Средняя оценка" value={stats.avg_rate ?? 0} float accent />
          <MetricCard label="Эпизодов"       value={stats.total_episodes ?? 0} />
        </div>
      )}

      {/* Прогресс-бар */}
      {stats && stats.total_anime > 0 && (
        <div className="card db-progress-card">
          <p className="db-section-title">Распределение по статусам</p>
          <div className="progress-bar">
            {[
              { key: 'watched',  width: stats.watched,  cls: 'seg-watched' },
              { key: 'watching', width: stats.watching, cls: 'seg-watching' },
              { key: 'want',     width: stats.want,     cls: 'seg-want' },
              { key: 'dropped',  width: stats.dropped,  cls: 'seg-dropped' },
            ].map(({ key, width, cls }) => (
              <div
                key={key}
                className={`progress-seg ${cls}`}
                style={{ width: `${(width / stats.total_anime) * 100}%` }}
              />
            ))}
          </div>
          <div className="progress-legend">
            <LegendItem color="var(--accent)"    label="Просмотрено" count={stats.watched} />
            <LegendItem color="var(--surface-2)" label="Смотрю"      count={stats.watching} />
            <LegendItem color="var(--surface)"   label="Планирую"    count={stats.want} />
            <LegendItem color="#7a3040"           label="Дропнуто"    count={stats.dropped} />
          </div>
        </div>
      )}

      {/* Последние добавленные */}
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

      {/* Пустое состояние */}
      {!loading && recent.length === 0 && (
        <div className="db-empty card">
          <p className="db-empty__icon">◎</p>
          <p className="db-empty__text">Список пока пуст — найди первое аниме</p>
          <Link to="/search" className="btn btn-primary">
            <IconPlus size={16} stroke={2} /> Найти аниме
          </Link>
        </div>
      )}
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