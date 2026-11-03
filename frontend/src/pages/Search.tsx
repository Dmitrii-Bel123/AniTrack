import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { IconSearch, IconPlus, IconCheck } from '@tabler/icons-react';
import api from '../api/axios';
import type { AxiosResponse } from 'axios';

interface SearchResult {
  mal_id: number;
  title: string;
  poster: string | null;
  episodes: number | null;
  genres: string[];
  synopsis: string;
}

interface AddedMap { [mal_id: number]: 'adding' | 'added' | 'exists'; }

export default function Search({ onAdded }: { onAdded?: () => void }) {
  const [params] = useSearchParams();
  const [query,   setQuery]   = useState(params.get('q') ?? '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [added,   setAdded]   = useState<AddedMap>({});
  const [entryIds, setEntryIds] = useState<Record<number, number>>({});
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const r: AxiosResponse<SearchResult[]> = await api.get(`/anime/search/?q=${encodeURIComponent(q)}`);
      setResults(r.data);
      setSearched(true);
      if (r.data.length === 0) setError('Ничего не найдено. Попробуй другой запрос.');
    } catch {
      setError('Ошибка поиска. Попробуй позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (mal_id: number, status = 'WW') => {
    setError('');
    setAdded(prev => ({ ...prev, [mal_id]: 'adding' }));
    try {
      const response = await api.post('/anime/my/add/', { mal_id, user_status: status });
      if (response.status === 201 && response.data.id) {
        onAdded?.();
        setEntryIds(prev => ({ ...prev, [mal_id]: response.data.id }));
        setAdded(prev => ({ ...prev, [mal_id]: 'added' }));
      } else if (response.data.detail === 'Аниме уже есть в вашем списке') {
        setAdded(prev => ({ ...prev, [mal_id]: 'exists' }));
      } else {
        throw new Error('add failed');
      }
    } catch {
      setError('Не удалось добавить тайтл. Попробуй ещё раз.');
      setAdded(prev => {
        const next = { ...prev };
        delete next[mal_id];
        return next;
      });
    }
  };

  // Переход из коллекции: /search?q=... запускает поиск сразу
  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current || !params.get('q')) return;
    autoRan.current = true;
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="search-page fade-in">

      {/* Заголовок */}
      <div className="search-hero">
        <p className="kicker">Моя коллекция</p>
        <div className="page-heading"><h1>Добавить аниме</h1></div>
        <p className="db-sub">Ищи по базе MyAnimeList и добавляй в свой список</p>
      </div>

      {/* Строка поиска */}
      <form className="search-bar" onSubmit={handleSearch}>
        <div className="search-bar__wrap">
          <IconSearch size={18} stroke={1.75} className="search-bar__icon" />
          <input
            ref={inputRef}
            className="search-bar__input"
            aria-label="Название аниме" placeholder="Название аниме…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              type="button"
              className="search-bar__clear" aria-label="Очистить поиск"
              onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); }}
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !query.trim()}
        >
          {loading
            ? <span className="spinner" style={{ width:16, height:16 }} />
            : 'Найти'
          }
        </button>
      </form>

      {/* Ошибка */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Скелетон загрузки */}
      {loading && (
        <div className="search-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="search-card search-card--skeleton">
              <div className="skeleton-poster" />
              <div className="skeleton-body">
                <div className="skeleton-line" style={{ width:'80%' }} />
                <div className="skeleton-line" style={{ width:'50%' }} />
                <div className="skeleton-line" style={{ width:'65%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Результаты */}
      {!loading && results.length > 0 && (
        <>
          <p className="search-count">{results.length} результатов</p>
          <div className="search-grid">
            {results.map(item => {
              const state = added[item.mal_id];
              return (
                <div key={item.mal_id} className="search-card">
                  <div className="search-card__poster">
                    {item.poster
                      ? <img src={item.poster} alt={item.title} />
                      : <div className="search-card__no-img">Без обложки</div>
                    }
                  </div>
                  <div className="search-card__body">
                    <p className="search-card__title">{item.title}</p>

                    <div className="search-card__meta">
                      {item.episodes && (
                        <span className="search-card__eps">{item.episodes} эп.</span>
                      )}
                      {item.genres.slice(0, 2).map(g => (
                        <span key={g} className="search-card__genre">{g}</span>
                      ))}
                    </div>

                    {item.synopsis && (
                      <p className="search-card__synopsis">{item.synopsis}</p>
                    )}

                    <button
                      className={`btn btn-sm search-card__add ${
                        state === 'added'  ? 'btn-success' :
                        state === 'exists' ? 'btn-ghost'   : 'btn-primary'
                      }`}
                      onClick={() => handleAdd(item.mal_id)}
                      disabled={!!state}
                    >
                      {state === 'adding' && <span className="spinner" style={{ width:13, height:13 }} />}
                      {state === 'added'  && <><IconCheck size={13} stroke={2} /> Добавлено</>}
                      {state === 'exists' && 'Уже в списке'}
                      {!state            && <><IconPlus  size={13} stroke={2} /> В планы</>}
                    </button>
                    {entryIds[item.mal_id] && <Link className="col-link" to={`/list/${entryIds[item.mal_id]}`}>О тайтле →</Link>}
                    {state === 'exists' && <Link className="col-link" to="/" onClick={e => e.currentTarget.closest('dialog')?.close()}>Открыть коллекцию →</Link>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Пустое начальное состояние */}
      {!loading && !searched && (
        <div className="search-empty">
          <p className="search-empty__icon">◎</p>
          <p className="search-empty__text">Введи название аниме и нажми «Найти»</p>
        </div>
      )}
    </div>
  );
}