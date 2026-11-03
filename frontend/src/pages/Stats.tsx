import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconPlus, IconStar } from '@tabler/icons-react';
import api from '../api/axios';
import { fetchCollection } from '../api/collection';
import type { Stats, UserAnime } from '../types/index';
import { STATUS_BADGE, STATUS_LABEL } from '../types/index';

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
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([api.get<Stats>('/anime/my/stat/', { signal }), fetchCollection(signal)])
      .then(([summary, collection]) => {
        if (signal.aborted) return;
        setStats(summary.data);
        setItems(collection);
      })
      .catch(() => { if (!signal.aborted) setFailed(true); })
      .finally(() => { if (!signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  const heading = <header className="insights-heading">
    <p>Моя коллекция</p><h1>Статистика</h1>
  </header>;

  if (loading || failed || !stats?.total_anime) {
    return <div className="insights">{heading}
      <section className="insights-state">
        {loading ? <p role="status">Загружаю статистику…</p> : failed ?
          <><p role="alert">Не удалось загрузить статистику.</p>
            <button className="btn btn-primary" onClick={() => {
              setFailed(false); setLoading(true); setAttempt(n => n + 1);
            }}>Повторить</button></> :
          <><h2>Коллекция пока пуста</h2><p>Добавь первое аниме, и здесь появится статистика.</p>
            <Link to="/search" className="btn btn-primary"><IconPlus size={16} /> Добавить аниме</Link></>}
      </section>
    </div>;
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

  const statuses = [
    ['PR', stats.watching], ['WW', stats.want], ['WD', stats.watched], ['DR', stats.dropped],
  ] as const;

  return (
    <div className="insights">
      {heading}
      <dl className="insights-summary">
        <div><dt>Тайтлов в коллекции</dt><dd>{stats.total_anime}</dd></div>
        <div><dt>Тайтлов с оценкой</dt><dd>{ratedCount}</dd></div>
        <div><dt>Средняя оценка</dt><dd>{stats.avg_rate?.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) ?? '—'}
          {stats.avg_rate != null && <small> / 10</small>}</dd></div>
      </dl>
      <div className="stats-grid">
        <section className="card stats-card">
          <h2>Статусы коллекции</h2>
          <div className="status-breakdown">{statuses.map(([key, count]) =>
            <Link key={key} to={`/?status=${key}`}>
              <span>{STATUS_LABEL[key]}</span>
              <span className="status-track" aria-hidden="true"><i style={{ width: `${count / stats.total_anime * 100}%` }} /></span>
              <b>{count}</b>
            </Link>)}</div>
        </section>
        {/* Активность по месяцам */}
        <div className="card stats-card">
          <h2>Добавлено за 6 месяцев</h2>
          <div className="bar-chart bar-chart--months">
            {months.map(m => {
              const count = monthCounts.get(m.key) ?? 0;
              return (
                <div className="bar-col" key={m.key}>
                  <span className="bar-col__count">{count}</span>
                  <div className="bar-col__track">
                    <div
                      className="bar-col__fill"
                      style={{ height: `${count > 0 ? (count / maxMonth) * 100 : 0}%` }}
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
          <h2>Распределение оценок</h2>
          {ratedCount > 0 ? (
            <div className="bar-chart bar-chart--rates">
              {rateBuckets.map((count, i) => (
                <div className="bar-col" key={i}>
                  <span className="bar-col__count">{count}</span>
                  <div className="bar-col__track">
                    <div
                      className="bar-col__fill bar-col__fill--accent"
                      style={{ height: `${count > 0 ? (count / maxRate) * 100 : 0}%` }}
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
          <h2>Частые жанры</h2>
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
          <h2>Тайтлы с высшими оценками</h2>
          {topRated.length > 0 ? (
            <div className="top-rated-list">
              {topRated.map((item, idx) => (
                <Link to={`/list/${item.id}`} key={item.id} className="top-rated-row">
                  <span className="top-rated-row__rank">{idx + 1}</span>
                  <div className="top-rated-row__poster">
                    {item.anime.poster
                      ? <img src={item.anime.poster} alt="" />
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
