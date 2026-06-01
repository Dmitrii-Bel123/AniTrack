import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  IconArrowLeft, IconStar, IconPlayerPlay,
  IconCheck, IconClock, IconX, IconEdit, IconDeviceFloppy,
} from '@tabler/icons-react';
import api from '../api/axios';
import type { AxiosResponse } from 'axios';
import { STATUS_BADGE } from '../types/index';

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

const STATUS_OPTIONS = [
  { value: 'WW', label: 'Планирую',     icon: IconClock },
  { value: 'PR', label: 'Смотрю',       icon: IconPlayerPlay },
  { value: 'WD', label: 'Просмотрено',  icon: IconCheck },
  { value: 'DR', label: 'Дропнуто',     icon: IconX },
];

export default function AnimeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data,    setData]    = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [deleting,setDeleting]= useState(false);

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
    api.get(`/anime/my/${id}/`)
      .then((r: AxiosResponse<DetailData>) => {
        setData(r.data);
        setForm({
          user_status:        r.data.user_status,
          user_rate:          r.data.user_rate ?? '',
          user_note:          r.data.user_note ?? '',
          user_fav_character: r.data.user_fav_character ?? '',
          started_at:         r.data.started_at ?? '',
          finished_at:        r.data.finished_at ?? '',
        });
      })
      .catch(() => navigate('/list'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSave = async () => {
    if (!id) return;
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
    } catch {}
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Удалить аниме из списка?')) return;
    setDeleting(true);
    try {
      await api.delete(`/anime/my/${id}/`);
      navigate('/list');
    } catch {}
    finally { setDeleting(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <span className="spinner" style={{ width:32, height:32 }} />
    </div>
  );

  if (!data) return null;

  return (
    <div className="detail-page fade-in">

      {/* Назад */}
      <Link to="/list" className="detail-back">
        <IconArrowLeft size={16} stroke={1.75} /> Мой список
      </Link>

      <div className="detail-layout">

        {/* ── Левая колонка ── */}
        <div className="detail-left">
          <div className="detail-poster">
            {data.poster
              ? <img src={data.poster} alt={data.title} />
              : <div className="detail-poster__empty">No Image</div>
            }
          </div>

          {/* Статус */}
          <div className="detail-status-block">
            <p className="detail-block-label">Статус просмотра</p>
            <div className="status-options">
              {STATUS_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  className={`status-opt ${form.user_status === value ? 'status-opt--active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, user_status: value as DetailData['user_status'] }))}
                  disabled={!editing}
                >
                  <Icon size={14} stroke={1.75} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Оценка */}
          <div className="detail-rate-block">
            <p className="detail-block-label">Моя оценка</p>
            <div className="rate-input-wrap">
              <IconStar size={18} stroke={1.75} style={{ color:'var(--accent)', flexShrink:0 }} />
              <input
                type="number"
                min="1" max="10" step="0.5"
                className="rate-input"
                value={form.user_rate}
                onChange={e => setForm(f => ({ ...f, user_rate: e.target.value }))}
                disabled={!editing}
                placeholder="—"
              />
              <span className="rate-suffix">/10</span>
            </div>
          </div>

          {/* Даты */}
          <div className="detail-dates">
            <div className="input-group">
              <label className="input-label">Начал</label>
              <input
                type="date"
                className="input"
                value={form.started_at}
                onChange={e => setForm(f => ({ ...f, started_at: e.target.value }))}
                disabled={!editing}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Закончил</label>
              <input
                type="date"
                className="input"
                value={form.finished_at}
                onChange={e => setForm(f => ({ ...f, finished_at: e.target.value }))}
                disabled={!editing}
              />
            </div>
          </div>

          {/* Кнопки */}
          <div className="detail-btns">
            {editing ? (
              <>
                <button
                  className="btn btn-primary w-full"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? <span className="spinner" style={{ width:16, height:16 }} />
                    : <><IconDeviceFloppy size={16} stroke={1.75} /> Сохранить</>
                  }
                </button>
                <button
                  className="btn btn-ghost w-full"
                  onClick={() => setEditing(false)}
                >
                  Отмена
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-ghost w-full"
                  onClick={() => setEditing(true)}
                >
                  <IconEdit size={16} stroke={1.75} /> Редактировать
                </button>
                <button
                  className="btn btn-danger w-full"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting
                    ? <span className="spinner" style={{ width:16, height:16 }} />
                    : <><IconX size={16} stroke={1.75} /> Удалить</>
                  }
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Правая колонка ── */}
        <div className="detail-right">

          {/* Шапка */}
          <div className="detail-head">
            <div className="detail-genres">
              {data.genres.map(g => (
                <span key={g} className="detail-genre">{g}</span>
              ))}
            </div>
            <h1 className="detail-title">{data.title}</h1>
            {data.title_japanese && (
              <p className="detail-title-jp">{data.title_japanese}</p>
            )}
          </div>

          {/* Мета-инфо */}
          <div className="detail-meta-row">
            {data.score && (
              <div className="meta-pill">
                <IconStar size={13} stroke={2} style={{ color:'var(--accent)' }} />
                <span>{data.score}</span>
                <span className="meta-pill__sub">MAL</span>
              </div>
            )}
            {data.episodes && (
              <div className="meta-pill">
                <span>{data.episodes}</span>
                <span className="meta-pill__sub">эп.</span>
              </div>
            )}
            {data.year && (
              <div className="meta-pill">
                <span>{data.year}</span>
              </div>
            )}
            {data.status && (
              <div className={`badge ${data.airing ? 'badge-watching' : 'badge-watched'}`}>
                {data.status}
              </div>
            )}
          </div>

          {/* Синопсис */}
          {data.synopsis && (
            <div className="detail-section">
              <p className="detail-section-title">Описание</p>
              <p className="detail-synopsis">{data.synopsis}</p>
            </div>
          )}

          {/* Студия */}
          {data.studios.length > 0 && (
            <div className="detail-section">
              <p className="detail-section-title">Студия</p>
              <p className="detail-studios">{data.studios.join(', ')}</p>
            </div>
          )}

          {/* Трейлер */}
          {data.trailer && (
            <div className="detail-section">
              <p className="detail-section-title">Трейлер</p>
              <a
                href={data.trailer}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                <IconPlayerPlay size={14} stroke={1.75} /> Смотреть трейлер
              </a>
            </div>
          )}

          {/* Заметка */}
          <div className="detail-section">
            <p className="detail-section-title">Моя заметка</p>
            <textarea
              className="input detail-note"
              placeholder="Добавь заметку..."
              value={form.user_note}
              onChange={e => setForm(f => ({ ...f, user_note: e.target.value }))}
              disabled={!editing}
              rows={3}
            />
          </div>

          {/* Любимый персонаж */}
          <div className="detail-section">
            <p className="detail-section-title">Любимый персонаж</p>
            <input
              className="input"
              placeholder="Кто тебе понравился?"
              value={form.user_fav_character}
              onChange={e => setForm(f => ({ ...f, user_fav_character: e.target.value }))}
              disabled={!editing}
            />
          </div>

          {/* Ссылка на MAL */}
          {data.url && (
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-mal-link"
            >
              Открыть на MyAnimeList →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}