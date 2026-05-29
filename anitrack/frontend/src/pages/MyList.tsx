import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  IconSearch, IconAdjustments, IconEdit,
  IconTrash, IconSortAscending, IconSortDescending,
} from '@tabler/icons-react';
import api from '../api/axios';
import type { AxiosResponse } from 'axios';
import type { UserAnime } from '../types/index';
import { STATUS_LABEL, STATUS_BADGE } from '../types/index';

type Status = 'ALL' | 'WW' | 'PR' | 'WD' | 'DR';
type OrderDir = 'asc' | 'desc';

const FILTERS: { key: Status; label: string }[] = [
  { key: 'ALL', label: 'Все'          },
  { key: 'PR',  label: 'Смотрю'       },
  { key: 'WD',  label: 'Просмотрено'  },
  { key: 'WW',  label: 'Планирую'     },
  { key: 'DR',  label: 'Дропнуто'     },
];

export default function MyList() {
  const [items,     setItems]     = useState<UserAnime[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [status,    setStatus]    = useState<Status>('ALL');
  const [orderDir,  setOrderDir]  = useState<OrderDir>('desc');
  const [orderBy,   setOrderBy]   = useState('created_at');
  const [deleting,  setDeleting]  = useState<number | null>(null);

  const fetchList = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'ALL') params.set('user_status', status);
    if (search)           params.set('search', search);
    params.set('ordering', `${orderDir === 'desc' ? '-' : ''}${orderBy}`);

    api.get(`/anime/my/?${params}`)
      .then((r: AxiosResponse<UserAnime[] | { results: UserAnime[] }>) => {
        const data = r.data;
        setItems(Array.isArray(data) ? data : (data.results ?? []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, search, orderDir, orderBy]);

  useEffect(() => {
    const t = setTimeout(fetchList, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchList, search]);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить аниме из списка?')) return;
    setDeleting(id);
    try {
      await api.delete(`/anime/my/${id}/`);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {}
    finally { setDeleting(null); }
  };

  const toggleOrder = () => setOrderDir(d => d === 'desc' ? 'asc' : 'desc');

  return (
    <div className="list-page fade-in">

      {/* Заголовок */}
      <div className="list-header">
        <div>
          <h2 className="db-heading">Мой список</h2>
          <p className="db-sub">{items.length} аниме</p>
        </div>
        <Link to="/search" className="btn btn-primary">+ Добавить</Link>
      </div>

      {/* Тулбар */}
      <div className="list-toolbar">

        {/* Фильтры по статусу */}
        <div className="list-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-btn ${status === f.key ? 'filter-btn--active' : ''}`}
              onClick={() => setStatus(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Поиск + сортировка */}
        <div className="list-controls">
          <div className="search-wrap">
            <IconSearch size={15} stroke={1.75} className="search-icon" />
            <input
              className="search-input"
              placeholder="Поиск по названию..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="sort-wrap">
            <select
              className="sort-select"
              value={orderBy}
              onChange={e => setOrderBy(e.target.value)}
            >
              <option value="created_at">По дате</option>
              <option value="user_rate">По оценке</option>
            </select>
            <button className="sort-dir-btn" onClick={toggleOrder} title="Сменить направление">
              {orderDir === 'desc'
                ? <IconSortDescending size={16} stroke={1.75} />
                : <IconSortAscending  size={16} stroke={1.75} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Список */}
      {loading ? (
        <div className="list-loading">
          <span className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : items.length === 0 ? (
        <div className="list-empty card">
          <IconAdjustments size={32} stroke={1.5} style={{ color: 'var(--text-dim)' }} />
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            {search ? 'Ничего не найдено' : 'Список пуст'}
          </p>
          {!search && (
            <Link to="/search" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
              Найти аниме
            </Link>
          )}
        </div>
      ) : (
        <div className="list-grid">
          {items.map(item => (
            <div key={item.id} className="list-card">
              <Link to={`/list/${item.id}`} className="list-card__poster">
                {item.anime.poster
                  ? <img src={item.anime.poster} alt={item.anime.title} />
                  : <div className="list-card__no-img">No Image</div>
                }
              </Link>
              <div className="list-card__body">
                <div className="list-card__top">
                  <Link to={`/list/${item.id}`} className="list-card__title">
                    {item.anime.title}
                  </Link>
                  <span className={`badge ${STATUS_BADGE[item.user_status]}`}>
                    {STATUS_LABEL[item.user_status]}
                  </span>
                </div>

                <div className="list-card__meta">
                  {item.anime.episodes && (
                    <span className="list-card__eps">{item.anime.episodes} эп.</span>
                  )}
                  {item.anime.genres.slice(0, 2).map(g => (
                    <span key={g.id} className="list-card__genre">{g.title}</span>
                  ))}
                </div>

                {item.user_rate && (
                  <div className="list-card__rate">
                    <span className="rate-star">★</span>
                    <span className="rate-val">{item.user_rate}</span>
                    <span className="rate-max">/10</span>
                  </div>
                )}

                {item.user_note && (
                  <p className="list-card__note">{item.user_note}</p>
                )}
              </div>

              <div className="list-card__actions">
                <Link
                  to={`/list/${item.id}`}
                  className="action-btn action-btn--edit"
                  title="Редактировать"
                >
                  <IconEdit size={15} stroke={1.75} />
                </Link>
                <button
                  className="action-btn action-btn--delete"
                  title="Удалить"
                  disabled={deleting === item.id}
                  onClick={() => handleDelete(item.id)}
                >
                  {deleting === item.id
                    ? <span className="spinner" style={{ width: 14, height: 14 }} />
                    : <IconTrash size={15} stroke={1.75} />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}