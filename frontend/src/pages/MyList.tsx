import { useEffect, useRef, useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchCollection } from '../api/collection';
import type { UserAnime } from '../types/index';
import Search from './Search';

const filters = [
  ['PR', 'Смотрю'], ['all', 'Все'], ['WW', 'Планирую'],
  ['WD', 'Просмотрено'], ['DR', 'Дропнуто'],
] as const;

export default function MyList() {
  const [items, setItems] = useState<UserAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('new');
  const [searchOpen, setSearchOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [params, setParams] = useSearchParams();
  const [status, label] = filters.find(([key]) => key === params.get('status')) ?? filters[0];

  useEffect(() => {
    let active = true;
    fetchCollection()
      .then(data => { if (active) setItems(data); })
      .catch(() => { if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  function load() {
    setLoading(true);
    setFailed(false);
    setAttempt(value => value + 1);
  }

  useEffect(() => {
    if (searchOpen) dialog.current?.showModal();
  }, [searchOpen]);

  const visible = items.filter(item =>
    (status === 'all' || item.user_status === status) &&
    item.anime.title.toLowerCase().includes(query.trim().toLowerCase())
  ).sort((a, b) => {
    if (sort === 'rate') return Number(b.user_rate ?? -1) - Number(a.user_rate ?? -1);
    return sort === 'new' ? b.id - a.id : a.id - b.id;
  });

  return (
    <section className="library">
      <p className="library-label">Моя коллекция</p>
      <div className="library-heading">
        <h1>{status === 'PR' ? 'Сейчас смотрю' : status === 'all' ? 'Все тайтлы' : label}</h1>
        <button className="library-add" onClick={() => setSearchOpen(true)}>Добавить аниме</button>
      </div>
      <nav className="library-filters" aria-label="Статус просмотра">
        {filters.map(([key, text]) => <button key={key} aria-pressed={key === status}
          onClick={() => setParams({ status: key })}>{text}</button>)}
      </nav>
      {items.length > 0 && <div className="library-tools">
        <input type="search" aria-label="Поиск в выбранном списке" placeholder="Найти в этом списке"
          value={query} onChange={e => setQuery(e.target.value)} />
        <div className="library-sort">
          <select aria-label="Сортировка" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="new">Сначала новые</option><option value="old">Сначала старые</option>
            <option value="rate">По оценке</option>
          </select>
          <IconChevronDown size={16} stroke={1.75} aria-hidden="true" />
        </div>
      </div>}
      {loading ? <p role="status">Загружаю коллекцию…</p> : failed ?
        <p role="alert">Не удалось загрузить коллекцию. <button onClick={load}>Повторить</button></p> :
        visible.length ? <ul className="library-list">{visible.map(item =>
          <li key={item.id}><Link className="library-entry" to={`/list/${item.id}`}>
            <span className="library-poster">{item.anime.poster && <img src={item.anime.poster} alt="" loading="lazy" />}</span>
            <span><strong>{item.anime.title}</strong><small>{item.anime.genres.map(g => g.title).slice(0, 3).join(' · ')}</small></span>
            <span className="library-status">{filters.find(([key]) => key === item.user_status)?.[1]}</span>
          </Link></li>)}</ul> :
        <p>{query.trim() ? 'По этому запросу ничего не найдено.' : 'В этом списке пока нет аниме.'}</p>}
      {searchOpen && <dialog className="library-dialog" ref={dialog} aria-label="Добавить аниме"
        onClose={() => setSearchOpen(false)}>
        <button className="dialog-close" onClick={() => dialog.current?.close()}>Закрыть</button>
        <Search onAdded={() => { setParams({ status: 'WW' }); setQuery(''); load(); }} />
      </dialog>}
    </section>
  );
}
