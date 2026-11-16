import { useEffect, useMemo, useRef, useState } from 'react';
import { IconArrowUpRight, IconChevronDown, IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCollection } from '../hooks/useCollection';
import { collectionInsights, selectWatchingFeature } from '../lib/collectionInsights';
import PageHeading from '../components/ui/PageHeading';
import Poster from '../components/ui/Poster';
import { STATUS_LABEL } from '../types';
import Search from './Search';

const filters = [
  ['PR', 'Смотрю'], ['all', 'Все тайтлы'], ['WW', 'Планирую'],
  ['WD', 'Просмотрено'], ['DR', 'Брошено'],
] as const;

export default function MyList() {
  const { items, loading, failed, reload } = useCollection();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('new');
  const [searchOpen, setSearchOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const filtersRef = useRef<HTMLElement>(null);
  const [params, setParams] = useSearchParams();
  const { counts } = useMemo(() => collectionInsights(items), [items]);
  const defaultFilter = !loading && !failed && counts.PR === 0 ? filters[1] : filters[0];
  const [status, label] = filters.find(([key]) => key === params.get('status')) ?? defaultFilter;
  const featured = selectWatchingFeature(items);

  useEffect(() => {
    if (searchOpen) dialog.current?.showModal();
  }, [searchOpen]);

  useEffect(() => {
    const nav = filtersRef.current;
    const selected = nav?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!nav || !selected) return;
    const left = selected.getBoundingClientRect().left - nav.getBoundingClientRect().left + nav.scrollLeft;
    nav.scrollTo({ left: Math.max(0, left - 16) });
  }, [status]);

  const visible = items.filter(item =>
    (status === 'all' || item.user_status === status) &&
    item.anime.title.toLowerCase().includes(query.trim().toLowerCase())
  ).sort((a, b) => {
    if (sort === 'rate') return Number(b.user_rate ?? -1) - Number(a.user_rate ?? -1);
    return sort === 'new' ? b.id - a.id : a.id - b.id;
  });

  return <section className="library">
    <PageHeading index="01" label="Личный архив аниме" title="Коллекция">
      <button className="btn btn-primary" ref={addButton} onClick={() => setSearchOpen(true)}><IconPlus size={18} aria-hidden="true" /> Добавить аниме</button>
    </PageHeading>

    {!loading && !failed && featured && status === 'PR' && !query.trim() && <Link to={`/list/${featured.id}`} className="watch-feature">
      <div className="watch-feature__copy">
        <p className="eyebrow"><span className="signal-dot" /> Сейчас смотрю <span className="watch-feature__code">(PR — {String(counts.PR).padStart(2, '0')})</span></p>
        <h2>{featured.anime.title}</h2>
        <p className="watch-feature__meta">{featured.anime.genres.slice(0, 2).map(g => g.title).join(' / ')}{featured.anime.episodes != null && ` · ${featured.anime.episodes} эп.`}</p>
        <span className="watch-feature__action">Вернуться к истории <span className="circle-arrow"><IconArrowUpRight size={22} aria-hidden="true" /></span></span>
      </div>
      <div className="watch-feature__art" aria-hidden="true">
        <span className="watch-feature__serial">В ПРОЦЕССЕ / 01</span>
        <span className="watch-feature__orbit" />
        <Poster src={featured.anime.poster} eager />
        <span className="watch-feature__caption">Ещё одна серия.</span>
      </div>
    </Link>}

    <nav className="library-filters" aria-label="Статус просмотра" ref={filtersRef}>
      {filters.map(([key, text]) => <button key={key} aria-pressed={key === status}
        onClick={() => setParams({ status: key })}>{text}<span>{loading || failed ? '—' : String(key === 'all' ? items.length : counts[key]).padStart(2, '0')}</span></button>)}
    </nav>

    {!loading && !failed && items.length > 0 && <div className="library-tools">
      <label className="library-search"><IconSearch size={18} aria-hidden="true" /><input type="search" aria-label="Поиск в выбранном списке" placeholder="Найти в коллекции"
        value={query} onChange={e => setQuery(e.target.value)} /></label>
      <span className="library-result-count" aria-live="polite">Найдено: {visible.length}</span>
      <div className="library-sort">
        <select aria-label="Сортировка" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="new">Сначала новые</option><option value="old">Сначала старые</option><option value="rate">По оценке</option>
        </select><IconChevronDown size={16} aria-hidden="true" />
      </div>
    </div>}

    {loading ? <div className="page-state" role="status"><span className="spinner" /><p>Загружаю коллекцию…</p></div> : failed ?
      <div className="page-state"><p role="alert">Не удалось загрузить коллекцию.</p><button className="btn btn-ghost" onClick={reload}>Попробовать снова</button></div> :
      visible.length ? <ul className="library-grid">{visible.map((item, index) =>
        <li key={item.id}><Link className="anime-card" to={`/list/${item.id}`}>
          <div className="anime-card__art">
            <Poster src={item.anime.poster} />
            <span className="anime-card__number">{String(index + 1).padStart(2, '0')}</span>
            <span className="anime-card__open"><IconArrowUpRight size={20} aria-hidden="true" /></span>
          </div>
          <div className="anime-card__meta"><span data-status={item.user_status}>{STATUS_LABEL[item.user_status]}</span><span>{item.anime.episodes != null ? `${item.anime.episodes} эп.` : 'Эпизоды —'}</span></div>
          <h2>{item.anime.title}</h2>
          <p className="anime-card__genres">{item.anime.genres.slice(0, 2).map(g => g.title).join(' / ') || 'Жанр не указан'}</p>
          {Number(item.user_rate) > 0 && <span className="anime-card__rate">{item.user_rate}<small> / 10 · твоя оценка</small></span>}
        </Link></li>)}</ul> :
      <div className="page-state"><span className="empty-mark" aria-hidden="true">( {query.trim() ? '?' : '0'} )</span>
        <h2>{query.trim() ? 'Ничего не нашлось' : items.length ? `В списке «${label}» пока пусто` : 'Первая история — за тобой'}</h2>
        <p>{query.trim() ? 'Попробуй другое название или очисти поиск.' : 'Добавляй аниме, сохраняй впечатления и возвращайся к любимому.'}</p>
        {query.trim() ? <button className="btn btn-ghost" onClick={() => setQuery('')}>Очистить поиск</button> : <button className="btn btn-primary" onClick={() => setSearchOpen(true)}><IconPlus size={18} aria-hidden="true" /> Найти аниме</button>}
      </div>}

    {searchOpen && <dialog className="library-dialog" ref={dialog} aria-label="Добавить аниме"
      onClose={() => { setSearchOpen(false); addButton.current?.focus(); }}>
      <button className="dialog-close" aria-label="Закрыть поиск" onClick={() => dialog.current?.close()}><IconX size={22} aria-hidden="true" /></button>
      <Search onAdded={() => { setParams({ status: 'WW' }); setQuery(''); reload(); }} />
    </dialog>}
  </section>;
}
