import { useState, useRef } from 'react';
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

export default function Search() {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [added,   setAdded]   = useState<AddedMap>({});
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
    setAdded(prev => ({ ...prev, [mal_id]: 'adding' }));
    try {
      await api.post('/anime/my/add/', { mal_id, user_status: status });
      setAdded(prev => ({ ...prev, [mal_id]: 'added' }));
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response: { status: number } }).response?.status === 200
      ) {
        setAdded(prev => ({ ...prev, [mal_id]: 'exists' }));
      } else {
        setAdded(prev => {
          const next = { ...prev };
          delete next[mal_id];
          return next;
        });
      }
    }
  };

  return (
    <div className="search-page fade-in">

      {/* Заголовок */}
      <div className="search-hero">
        <h2 className="db-heading">Поиск аниме</h2>
        <p className="db-sub">Ищи по базе MyAnimeList и добавляй в свой список</p>
      </div>

      {/* Строка поиска */}
      <form className="search-bar" onSubmit={handleSearch}>
        <div className="search-bar__wrap">
          <IconSearch size={18} stroke={1.75} className="search-bar__icon" />
          <input
            ref={inputRef}
            className="search-bar__input"
            placeholder="Название аниме..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              type="button"
              className="search-bar__clear"
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
                      : <div className="search-card__no-img">No Image</div>
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
                      {!state            && <><IconPlus  size={13} stroke={2} /> В список</>}
                    </button>
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