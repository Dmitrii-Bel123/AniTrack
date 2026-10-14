import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import type { AxiosResponse } from 'axios';
import type { UserAnime } from '../types/index';

type Status = UserAnime['user_status'];
type Sort = 'new' | 'old' | 'rate';

// Полки идут в порядке «что важно сейчас → что было → что будет → что не пошло»
const SHELVES: { key: Status; title: string; short: string }[] = [
  { key: 'PR', title: 'Смотрю сейчас', short: 'Смотрю' },
  { key: 'WD', title: 'Просмотрено',   short: 'Просмотрено' },
  { key: 'WW', title: 'Планирую',      short: 'Планирую' },
  { key: 'DR', title: 'Дропнуто',      short: 'Дропнуто' },
];

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

function since(date: string | null): string | null {
  if (!date) return null;
  const t = new Date(date);
  const days = Math.max(0, Math.floor((Date.now() - t.getTime()) / 86_400_000));
  const label = t.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  return `начато ${label} · ${days} ${plural(days, 'день', 'дня', 'дней')}`;
}

// Коллекция одного человека небольшая: грузим целиком, группируем на клиенте.
// Так номера записей стабильны, а поиск мгновенный.
async function fetchAll(): Promise<UserAnime[]> {
  const out: UserAnime[] = [];
  let url: string | null = '/anime/my/';
  while (url) {
    const r: AxiosResponse<UserAnime[] | { results?: UserAnime[]; next?: string | null }> =
      await api.get(url);
    const d = r.data;
    if (Array.isArray(d)) { out.push(...d); break; }
    out.push(...(d.results ?? []));
    url = d.next ?? null;
  }
  return out;
}

function Remove({ armed, onClick, onBlur }: { armed: boolean; onClick: () => void; onBlur: () => void }) {
  return (
    <button className={armed ? 'is-armed' : ''} onClick={onClick} onBlur={onBlur}>
      {armed ? 'Точно?' : 'Удалить'}
    </button>
  );
}

interface ItemProps {
  it: UserAnime;
  no: string;
  armed: boolean;
  onRemove: () => void;
  onDisarm: () => void;
}

// «Смотрю сейчас»: крупная запись с заметкой и датой начала
function Current({ it, no, detail, armed, onRemove, onDisarm }: ItemProps & { detail?: UserAnime }) {
  const genres = it.anime.genres.slice(0, 3).map(g => g.title).join(' · ');
  const started = since(detail?.started_at ?? null);
  const note = detail?.user_note?.trim();
  return (
    <li className="cur">
      <span className="cur-poster">
        {it.anime.poster && <img src={it.anime.poster} alt="" />}
      </span>
      <div className="cur-body">
        <span className="no">№ {no}</span>
        <Link to={`/list/${it.id}`} className="cur-name">{it.anime.title}</Link>
        <p className="cur-meta">
          {[genres, it.anime.episodes ? `${it.anime.episodes} эп.` : null, started]
            .filter(Boolean).join('  /  ')}
        </p>
        {note && <p className="cur-note">{note}</p>}
      </div>
      <div className="cur-side">
        {it.user_rate && <span className="rate">{parseFloat(it.user_rate)}<small>/10</small></span>}
        <span className="act"><Remove armed={armed} onClick={onRemove} onBlur={onDisarm} /></span>
      </div>
    </li>
  );
}

// Остальные полки: плотная строка реестра
function Row({ it, no, armed, onRemove, onDisarm }: ItemProps) {
  const genres = it.anime.genres.slice(0, 3).map(g => g.title).join(' · ');
  return (
    <li className={`row st-${it.user_status}`}>
      <span className="no">{no}</span>
      <span className="row-poster">
        {it.anime.poster && <img src={it.anime.poster} alt="" loading="lazy" />}
      </span>
      <span className="row-main">
        <Link to={`/list/${it.id}`} className="row-name">{it.anime.title}</Link>
        {genres && <span className="row-genres">{genres}</span>}
      </span>
      <span className="row-eps">{it.anime.episodes ? `${it.anime.episodes} эп.` : ''}</span>
      <span className="rate">
        {it.user_rate ? <>{parseFloat(it.user_rate)}<small>/10</small></> : <span className="dash">—</span>}
      </span>
      <span className="act"><Remove armed={armed} onClick={onRemove} onBlur={onDisarm} /></span>
    </li>
  );
}

export default function MyList() {
  const [items,   setItems]   = useState<UserAnime[]>([]);
  const [details, setDetails] = useState<Record<number, UserAnime>>({});
  const [loading, setLoading] = useState(true);
  const [failed,  setFailed]  = useState(false);
  const [query,   setQuery]   = useState('');
  const [sort,    setSort]    = useState<Sort>('new');
  const [armed,   setArmed]   = useState<number | null>(null);
  const [open,    setOpen]    = useState<Record<Status, boolean>>({ PR: true, WD: true, WW: false, DR: false });

  const load = useCallback(() => {
    setLoading(true);
    setFailed(false);
    fetchAll().then(setItems).catch(() => setFailed(true)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Заметка и дата начала есть только в детальной записи — берём её для тех,
  // кого смотрим сейчас (их обычно единицы)
  useEffect(() => {
    const watching = items.filter(i => i.user_status === 'PR');
    if (watching.length === 0) return;
    let alive = true;
    Promise.all(
      watching.map(i =>
        api.get<UserAnime>(`/anime/my/${i.id}/`).then(r => r.data).catch(() => null),
      ),
    ).then(list => {
      if (!alive) return;
      const m: Record<number, UserAnime> = {};
      list.forEach(d => { if (d) m[d.id] = d; });
      setDetails(m);
    });
    return () => { alive = false; };
  }, [items]);

  // № записи = порядок добавления в коллекцию
  const numbers = useMemo(() => {
    const map = new Map<number, string>();
    [...items].sort((a, b) => a.id - b.id)
      .forEach((it, i) => map.set(it.id, String(i + 1).padStart(3, '0')));
    return map;
  }, [items]);

  const q = query.trim().toLowerCase();

  const shelves = useMemo(() => SHELVES.map(s => {
    const all = items.filter(i => i.user_status === s.key);
    const list = all.filter(i => !q || i.anime.title.toLowerCase().includes(q));
    list.sort((a, b) => {
      if (sort === 'rate') {
        const ra = a.user_rate ? parseFloat(a.user_rate) : -1;
        const rb = b.user_rate ? parseFloat(b.user_rate) : -1;
        return rb - ra;
      }
      return sort === 'new' ? b.id - a.id : a.id - b.id;
    });
    return { ...s, total: all.length, list };
  }), [items, q, sort]);

  const shown = shelves.filter(s => s.total > 0 && s.list.length > 0);

  const jump = (key: Status) => {
    setOpen(o => ({ ...o, [key]: true }));
    setTimeout(() => document.getElementById(`shelf-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const remove = async (id: number) => {
    if (armed !== id) { setArmed(id); return; }
    try {
      await api.delete(`/anime/my/${id}/`);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {
      setFailed(true);
    } finally {
      setArmed(null);
    }
  };

  return (
    <div className="col">
      <div className="col-top">
        <input
          className="col-search"
          placeholder="Найти в коллекции или добавить новое"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
        <select className="col-sort" value={sort} onChange={e => setSort(e.target.value as Sort)}>
          <option value="new">Сначала новые</option>
          <option value="old">Сначала старые</option>
          <option value="rate">По оценке</option>
        </select>
      </div>

      {items.length > 0 && (
        <nav className="col-index">
          {shelves.filter(s => s.total > 0).map(s => (
            <button key={s.key} onClick={() => jump(s.key)}>
              {s.short} <b>{s.total}</b>
            </button>
          ))}
        </nav>
      )}

      {failed && (
        <p className="col-note">
          Не получилось связаться с сервером. <button onClick={load}>Повторить</button>
        </p>
      )}

      {loading ? (
        <p className="col-empty">Загружаю записи…</p>
      ) : items.length === 0 && !failed ? (
        <div className="col-empty">
          <p>Здесь пока пусто. Первая запись получит номер 001.</p>
          <Link to="/search" className="col-link">Найти, с чего начать →</Link>
        </div>
      ) : shown.length === 0 && q ? (
        <div className="col-empty">
          <p>«{query.trim()}» в коллекции нет.</p>
          <Link to={`/search?q=${encodeURIComponent(query.trim())}`} className="col-link">
            Поискать в каталоге →
          </Link>
        </div>
      ) : (
        shown.map(s => {
          const isOpen = q ? true : open[s.key];
          return (
            <section key={s.key} id={`shelf-${s.key}`} className="shelf">
              <h2 className="shelf-head">
                <button
                  aria-expanded={isOpen}
                  onClick={() => setOpen(o => ({ ...o, [s.key]: !o[s.key] }))}
                >
                  <span>{s.title}</span>
                  <b>{q ? s.list.length : s.total}</b>
                  <em>{isOpen ? 'свернуть' : 'показать'}</em>
                </button>
              </h2>

              {isOpen && (
                <ul className={s.key === 'PR' ? 'cur-list' : 'row-list'}>
                  {s.list.map(it => {
                    const common = {
                      it,
                      no: numbers.get(it.id) ?? '000',
                      armed: armed === it.id,
                      onRemove: () => remove(it.id),
                      onDisarm: () => setArmed(a => (a === it.id ? null : a)),
                    };
                    return s.key === 'PR'
                      ? <Current key={it.id} {...common} detail={details[it.id]} />
                      : <Row key={it.id} {...common} />;
                  })}
                </ul>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
