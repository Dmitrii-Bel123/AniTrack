import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { IconArrowUpRight, IconPlus } from '@tabler/icons-react';
import { useCollection } from '../hooks/useCollection';
import { collectionInsights } from '../lib/collectionInsights';
import PageHeading from '../components/ui/PageHeading';
import Poster from '../components/ui/Poster';
import { STATUS_LABEL } from '../types';

export default function StatsPage() {
  const { items, loading, failed, reload } = useCollection();
  const { counts, episodes, unknownEpisodes, completedPercent, months, topGenres, topRated } = useMemo(() => collectionInsights(items), [items]);
  const maxMonth = Math.max(...months.map(m => m.count), 1);
  const maxGenre = topGenres[0]?.[1] ?? 1;
  const heading = <PageHeading index="02" label="Коллекция в деталях" title="Статистика"><p className="heading-note">Каждая история оставляет след.<br />Здесь — твой.</p></PageHeading>;

  if (loading || failed || !items.length) return <div className="insights">{heading}<section className="page-state">
    {loading ? <><span className="spinner" /><p role="status">Загружаю статистику…</p></> : failed ?
      <><p role="alert">Не удалось загрузить статистику.</p><button className="btn btn-primary" onClick={reload}>Попробовать снова</button></> :
      <><span className="empty-mark" aria-hidden="true">( 0 )</span><h2>Здесь начинается твоя история</h2><p>Добавь первое аниме, и коллекция обретёт форму.</p><Link to="/search" className="btn btn-primary"><IconPlus size={18} aria-hidden="true" /> Найти аниме</Link></>}
  </section></div>;

  return <div className="insights">{heading}
    <section className="stats-overview" aria-label="Обзор коллекции">
      <div className="stats-overview__lead"><p className="eyebrow"><span className="signal-dot" /> Твой путь в аниме</p><h2>Истории<br /><em>в цифрах.</em></h2><p>Уже {counts.WD} из {items.length} тайтлов<br />досмотрены до финальных титров.</p></div>
      <div className="stats-completion"><span className="eyebrow">Просмотрено / от всей коллекции</span><div className="stats-completion__value">{completedPercent}<span>%</span></div><div className="completion-dots" aria-hidden="true">{Array.from({ length: 50 }, (_, i) => <i className={i < Math.round(completedPercent / 2) ? 'is-filled' : ''} key={i} />)}</div><Link to="/?status=WD">К просмотренному <IconArrowUpRight size={18} aria-hidden="true" /></Link></div>
    </section>

    <dl className="stats-metrics">
      <div><dt><span>01 /</span> В коллекции</dt><dd>{items.length.toLocaleString('ru-RU')}</dd></div>
      <div><dt><span>02 /</span> Сейчас смотрю</dt><dd>{counts.PR.toLocaleString('ru-RU')}</dd></div>
      <div><dt><span>03 /</span> В планах</dt><dd>{counts.WW.toLocaleString('ru-RU')}</dd></div>
      <div><dt><span>04 /</span> Эпизодов просмотрено</dt><dd>{episodes.toLocaleString('ru-RU')}{unknownEpisodes > 0 && <small>+</small>}</dd><p>В завершённых тайтлах{unknownEpisodes > 0 ? '; часть данных отсутствует' : ''}</p></div>
    </dl>

    <div className="stats-grid">
      <section className="stats-panel"><div className="section-caption"><span className="eyebrow">( A ) — Коллекция</span><span>04 статуса</span></div><h2>На каком ты этапе</h2>
        <div className="status-breakdown">{(['PR', 'WW', 'WD', 'DR'] as const).map(key => <Link key={key} to={`/?status=${key}`}><span className="status-label"><i data-status={key} />{STATUS_LABEL[key]}</span><span className="status-track" aria-hidden="true"><i data-status={key} style={{ width: `${counts[key] / items.length * 100}%` }} /></span><b>{counts[key]}</b><IconArrowUpRight size={17} aria-hidden="true" /></Link>)}</div>
      </section>

      <section className="stats-panel"><div className="section-caption"><span className="eyebrow">( B ) — Активность</span><span>Последние 6 месяцев</span></div><h2>Коллекция растёт</h2>
        <p className="stats-panel__hint">Добавленные тайтлы по месяцам</p><div className="month-chart">{months.map((m, index) => <div className="month-column" key={m.key} aria-label={`${m.fullLabel}: ${m.count}`}><span>{m.count}</span><div className="month-column__track"><i className={index === months.length - 1 ? 'is-current' : ''} style={{ height: `${m.count / maxMonth * 100}%` }} /></div><span>{m.label}</span></div>)}</div>
      </section>

      <section className="stats-panel"><div className="section-caption"><span className="eyebrow">( C ) — Предпочтения</span><span>По всей коллекции</span></div><h2>Твоя территория</h2>
        {topGenres.length ? <div className="genre-bars">{topGenres.map(([title, count], index) => <div className="genre-bar" key={title}><div className="genre-bar__top"><span><small>{String(index + 1).padStart(2, '0')}</small>{title}</span><b>{count}</b></div><div className="genre-bar__track" aria-hidden="true"><i style={{ width: `${count / maxGenre * 100}%` }} /></div></div>)}</div> : <p className="stats-empty-hint">В добавленных тайтлах пока не указаны жанры.</p>}
      </section>

      <section className="stats-panel"><div className="section-caption"><span className="eyebrow">( D ) — Личное</span><span>Твои высшие оценки</span></div><h2>Особое место</h2>
        {topRated.length ? <ol className="top-rated-list">{topRated.map((item, index) => <li key={item.id}><Link to={`/list/${item.id}`} className="top-rated-row"><span className="top-rated-row__rank">{String(index + 1).padStart(2, '0')}</span><span className="top-rated-row__poster"><Poster src={item.anime.poster} /></span><span className="top-rated-row__info"><strong>{item.anime.title}</strong><small>{STATUS_LABEL[item.user_status]}</small></span><span className="top-rated-row__rate">{item.user_rate}<small>/10</small></span></Link></li>)}</ol> : <p className="stats-empty-hint">Поставь оценку любимому аниме — оно появится здесь.</p>}
      </section>
    </div>
  </div>;
}
