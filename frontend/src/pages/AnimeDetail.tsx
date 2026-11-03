import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { IconArrowLeft, IconEdit } from '@tabler/icons-react';
import api from '../api/axios';
import type { AxiosResponse } from 'axios';




interface DetailData {
  mal_id: number;
  url: string;
  title: string;
  title_japanese: string;
  synopsis: string;
  episodes: number;
  status: string;
  score: number;
  year: number;
  poster: string;
  genres: string[];
  studios: string[];
  trailer: string | null;
  airing: boolean;
  source: string;
  user_anime_id: number;
  user_status: 'WW' | 'PR' | 'WD' | 'DR';
  user_rate: string | null;
  user_note: string | null;
  user_fav_character: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS = { PR: 'Смотрю', WW: 'Планирую', WD: 'Просмотрено', DR: 'Дропнуто' };

function recordFields(data: DetailData) {
  return {
    user_status: data.user_status, user_rate: data.user_rate ?? '',
    started_at: data.started_at ?? '', finished_at: data.finished_at ?? '',
    user_note: data.user_note ?? '', user_fav_character: data.user_fav_character ?? '',
  };
}

function displayDate(value: string) {
  return new Date(value + 'T00:00:00').toLocaleDateString('ru-RU');
}

export default function AnimeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data,    setData]    = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [deleting,setDeleting]= useState(false);

  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [form, setForm] = useState({
    user_status:        'WW' as DetailData['user_status'],
    user_rate:          '' as string,
    user_note:          '' as string,
    user_fav_character: '' as string,
    started_at:         '' as string,
    finished_at:        '' as string,
  });

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    api.get(`/anime/my/${id}/`, { signal: controller.signal })
      .then((r: AxiosResponse<DetailData>) => {
        setData(r.data);
        setForm(recordFields(r.data));
      })
      .catch(() => { if (!controller.signal.aborted) setError('Не удалось загрузить запись.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, attempt]);

  const handleSave = async () => {
    if (!id) return;
    setError('');
    setSaving(true);
    try {
      const payload = {
        user_status:        form.user_status,
        user_rate:          form.user_rate || null,
        user_note:          form.user_note || null,
        user_fav_character: form.user_fav_character || null,
        started_at:         form.started_at || null,
        finished_at:        form.finished_at || null,
      };
      await api.patch(`/anime/my/${id}/`, payload);
      setData(prev => prev ? { ...prev, ...payload } : prev);
      setEditing(false);
    } catch { setError('Не удалось сохранить изменения. Попробуй ещё раз.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Удалить аниме из списка?')) return;
    setDeleting(true);
    try {
      await api.delete(`/anime/my/${id}/`);
      navigate('/list');
    } catch { setError('Не удалось удалить запись. Попробуй ещё раз.'); }
    finally { setDeleting(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <span className="spinner" style={{ width:32, height:32 }} />
    </div>
  );

  if (!data) return <div role="alert">{error} <button className="outline-link" onClick={() => { setLoading(true); setError(''); setAttempt(n => n + 1); }}>Повторить</button> <Link to="/">В коллекцию</Link></div>;

  const facts = [
    ['Год', data.year], ['Количество серий', data.episodes], ['Студия', data.studios.join(', ')],
    ['Статус выпуска', data.status], ['Оценка MyAnimeList', data.score],
  ].filter(([, value]) => value != null && value !== '');

  return (
    <article className="title-sheet">
      <Link className="sheet-back" to="/"><IconArrowLeft size={17} /> Моя коллекция</Link>
      <div className="sheet-grid">
        <div className="sheet-rail">
        <div className="sheet-art">
          {data.poster ? <img src={data.poster} alt={`Постер «${data.title}»`} /> : <span>Без обложки</span>}
        </div>
        <aside className="sheet-facts">
          <h2>О тайтле</h2>
          <dl>{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          {data.trailer && <a href={data.trailer} target="_blank" rel="noreferrer">Смотреть трейлер ↗</a>}
          {data.url && <a href={data.url} target="_blank" rel="noreferrer">MyAnimeList ↗</a>}
          {!facts.length && !data.url && !data.trailer && <p>Пока нет сведений.</p>}
        </aside>
        </div>
        <div className="sheet-main">
        <header className="sheet-heading">
          <h1>{data.title || 'Запись в коллекции'}</h1>
          {data.title_japanese && <p lang="ja">{data.title_japanese}</p>}
          {data.genres.length > 0 && <ul>{data.genres.map(g => <li key={g}>{g}</li>)}</ul>}
        </header>
        <section className="sheet-record">
          <div className="sheet-toolbar"><h2>Моя запись</h2>
            {!editing && <button disabled={deleting} onClick={() => { setError(''); setEditing(true); }}>
              <IconEdit size={16} /> Редактировать</button>}
          </div>
          {error && <p role="alert">{error}</p>}
          {editing ? <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <fieldset disabled={saving}>
              <div className="sheet-fields">
                <label>Статус просмотра<select value={form.user_status} onChange={e => setForm({ ...form, user_status: e.target.value as DetailData['user_status'] })}>
                  {Object.entries(STATUS_OPTIONS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select></label>
                <label>Моя оценка из 10<input type="number" min="1" max="10" step="0.1" value={form.user_rate} onChange={e => setForm({ ...form, user_rate: e.target.value })} /></label>
                <label>Начало просмотра<input type="date" value={form.started_at} onChange={e => setForm({ ...form, started_at: e.target.value })} /></label>
                <label>Конец просмотра<input type="date" value={form.finished_at} onChange={e => setForm({ ...form, finished_at: e.target.value })} /></label>
              </div>
              <label>Любимый персонаж<input value={form.user_fav_character} onChange={e => setForm({ ...form, user_fav_character: e.target.value })} /></label>
              <label>Моя заметка<textarea rows={3} value={form.user_note} onChange={e => setForm({ ...form, user_note: e.target.value })} /></label>
              <div className="sheet-actions"><button className="sheet-save">{saving ? 'Сохраняю…' : 'Сохранить'}</button>
                <button type="button" onClick={() => { setForm(recordFields(data)); setError(''); setEditing(false); }}>Отмена</button></div>
            </fieldset>
          </form> : <>
            <dl className="sheet-values">
              <div><dt>Статус просмотра</dt><dd>{STATUS_OPTIONS[data.user_status]}</dd></div>
              <div><dt>Моя оценка</dt><dd>{data.user_rate ? `${Number(data.user_rate)} / 10` : 'Без оценки'}</dd></div>
              {data.started_at && <div><dt>Начало просмотра</dt><dd>{displayDate(data.started_at)}</dd></div>}
              {data.finished_at && <div><dt>Конец просмотра</dt><dd>{displayDate(data.finished_at)}</dd></div>}
              {data.user_fav_character && <div><dt>Любимый персонаж</dt><dd>{data.user_fav_character}</dd></div>}
            </dl>
            {data.user_note && <div className="sheet-note"><h3>Моя заметка</h3><p>{data.user_note}</p></div>}
          </>}
        </section>

        <section className="sheet-description"><h2>Описание</h2><p>{data.synopsis || 'Описание пока не добавлено.'}</p></section>
        </div>
      </div>
      {!editing && <footer><button disabled={deleting} onClick={handleDelete}>{deleting ? 'Удаляю…' : 'Удалить из коллекции'}</button></footer>}
    </article>
  );
}
