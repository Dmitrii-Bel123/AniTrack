import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconPlus, IconStar } from '@tabler/icons-react';
import api from '../api/axios';
import type { AxiosResponse } from 'axios';
import type { Stats, UserAnime } from '../types/index';
import { STATUS_BADGE, STATUS_LABEL } from '../types/index';

// ── Анимированный счётчик (как на Dashboard) ──────────────────
function useCountUp(target: number, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
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

function MetricCard({ label, value, accent, muted, float, suffix }: {
  label: string;
  value: number;
  accent?: boolean;
  muted?: boolean;
  float?: boolean;
  suffix?: string;
}) {
  const animated = useCountUp(float ? 0 : value);
  return (
    <div className={`metric-card card ${accent ? 'metric-card--accent' : ''} ${muted ? 'metric-card--muted' : ''}`}>
      <span className="metric-value">
        {float ? (value > 0 ? value.toFixed(1) : '—') : animated}{suffix}
      </span>
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

const MONTHS_RU = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function lastNMonths(n: number) {
  const now = new Date();
  const out: { key: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS_RU[d.getMonth()] });
  }
  return out;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [items, setItems] = useState<UserAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    Promise.all([
      api.get('/anime/my/stat/'),
      api.get('/anime/my/?ordering=created_at'),
    ]).then(([sRes, lRes]: [AxiosResponse<Stats>, AxiosResponse<UserAnime[] | { results: UserAnime[] }>]) => {
      setStats(sRes.data);
      const data = lRes.data;
      setItems(Array.isArray(data) ? data : (data.results ?? []));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!stats || stats.total_anime === 0) {
    return (
      <div className="stats-page fade-in">
        <div className="db-hero">
          <div>
            <h2 className="db-heading">Статистика</h2>
            <p className="db-sub">Аналитика твоей коллекции</p>
          </div>
        </div>
        <div className="db-empty card">
          <p className="db-empty__icon">◎</p>
          <p className="db-empty__text">Пока нечего анализировать — добавь первое аниме</p>
          <Link to="/search" className="btn btn-primary">
            <IconPlus size={16} stroke={2} /> Найти аниме
          </Link>
        </div>
      </div>
    );
  }

  // ── Жанры ──────────────────────────────────────────────────
  const genreCounts = new Map<string, number>();
  items.forEach(i => i.anime.genres.forEach(g => {
    genreCounts.set(g.title, (genreCounts.get(g.title) ?? 0) + 1);
  }));
  const topGenres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxGenre = topGenres[0]?.[1] ?? 1;

  // ── Оценки ─────────────────────────────────────────────────
  const rateBuckets = Array.from({ length: 10 }, () => 0);
  items.forEach(i => {
    if (!i.user_rate) return;
    const n = Math.round(Number(i.user_rate));
    if (n >= 1 && n <= 10) rateBuckets[n - 1]++;
  });
  const maxRate = Math.max(...rateBuckets, 1);
  const ratedCount = items.filter(i => i.user_rate).length;

  // ── Активность по месяцам ─────────────────────────────────
  const months = lastNMonths(6);
  const monthCounts = new Map(months.map(m => [m.key, 0]));
  items.forEach(i => {
    const d = new Date(i.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthCounts.has(key)) monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  });
  const maxMonth = Math.max(...monthCounts.values(), 1);

  // ── Топ по оценке ──────────────────────────────────────────
  const topRated = items
    .filter(i => i.user_rate)
    .sort((a, b) => Number(b.user_rate) - Number(a.user_rate))
    .slice(0, 5);

  const hoursWatched = stats.total_episodes ? Math.round(stats.total_episodes * 24 / 60) : 0;

  return (
    <div className="stats-page fade-in">

      <div className="db-hero">
        <div>
          <h2 className="db-heading">Статистика</h2>
          <p className="db-sub">Аналитика твоей коллекции</p>
        </div>
      </div>

      {/* Метрики */}
      <div className="db-metrics">
        <MetricCard label="Всего аниме"    value={stats.total_anime} />
        <MetricCard label="Просмотрено"    value={stats.watched} />
        <MetricCard label="Смотрю"         value={stats.watching} accent />
        <MetricCard label="Планирую"       value={stats.want} />
        <MetricCard label="Дропнуто"       value={stats.dropped} muted />
        <MetricCard label="Средняя оценка" value={stats.avg_rate ?? 0} float accent />
        <MetricCard label="Эпизодов"       value={stats.total_episodes ?? 0} />
        <MetricCard label="Часов просмотра" value={hoursWatched} suffix="ч" />
      </div>

      <div className="stats-grid">

        {/* Распределение по статусам */}
        {stats.total_anime > 0 && (
          <div className="card stats-card">
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
              <LegendItem color="#7a3040"          label="Дропнуто"    count={stats.dropped} />
            </div>
          </div>
        )}

        {/* Активность по месяцам */}
        <div className="card stats-card">
          <p className="db-section-title">Добавлено за 6 месяцев</p>
          <div className="bar-chart bar-chart--months">
            {months.map(m => {
              const count = monthCounts.get(m.key) ?? 0;
              return (
                <div className="bar-col" key={m.key}>
                  <span className="bar-col__count">{count > 0 ? count : ''}</span>
                  <div className="bar-col__track">
                    <div
                      className="bar-col__fill"
                      style={{ height: `${count > 0 ? Math.max((count / maxMonth) * 100, 6) : 0}%` }}
                    />
                  </div>
                  <span className="bar-col__label">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Оценки */}
        <div className="card stats-card">
          <p className="db-section-title">Распределение оценок</p>
          {ratedCount > 0 ? (
            <div className="bar-chart bar-chart--rates">
              {rateBuckets.map((count, i) => (
                <div className="bar-col" key={i}>
                  <span className="bar-col__count">{count > 0 ? count : ''}</span>
                  <div className="bar-col__track">
                    <div
                      className="bar-col__fill bar-col__fill--accent"
                      style={{ height: `${count > 0 ? Math.max((count / maxRate) * 100, 6) : 0}%` }}
                    />
                  </div>
                  <span className="bar-col__label">{i + 1}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="stats-empty-hint">Пока нет оценённых тайтлов</p>
          )}
        </div>

        {/* Жанры */}
        <div className="card stats-card">
          <p className="db-section-title">Любимые жанры</p>
          {topGenres.length > 0 ? (
            <div className="genre-bars">
              {topGenres.map(([title, count]) => (
                <div className="genre-bar" key={title}>
                  <div className="genre-bar__top">
                    <span className="genre-bar__title">{title}</span>
                    <span className="genre-bar__count">{count}</span>
                  </div>
                  <div className="genre-bar__track">
                    <div
                      className="genre-bar__fill"
                      style={{ width: `${(count / maxGenre) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="stats-empty-hint">Нет данных по жанрам</p>
          )}
        </div>

        {/* Топ по оценке */}
        <div className="card stats-card stats-card--wide">
          <p className="db-section-title">Топ по твоей оценке</p>
          {topRated.length > 0 ? (
            <div className="top-rated-list">
              {topRated.map((item, idx) => (
                <Link to={`/list/${item.id}`} key={item.id} className="top-rated-row">
                  <span className="top-rated-row__rank">{idx + 1}</span>
                  <div className="top-rated-row__poster">
                    {item.anime.poster
                      ? <img src={item.anime.poster} alt={item.anime.title} />
                      : <div className="top-rated-row__no-poster">—</div>
                    }
                  </div>
                  <div className="top-rated-row__info">
                    <p className="top-rated-row__title">{item.anime.title}</p>
                    <span className={`badge ${STATUS_BADGE[item.user_status]}`}>
                      {STATUS_LABEL[item.user_status]}
                    </span>
                  </div>
                  <div className="top-rated-row__rate">
                    <IconStar size={14} stroke={1.75} />
                    {item.user_rate}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="stats-empty-hint">Оцени хотя бы одно аниме, чтобы увидеть топ</p>
          )}
        </div>

      </div>
    </div>
  );
}
