import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconCamera, IconDeviceFloppy, IconLogout, IconLock } from '@tabler/icons-react';
import api from '../api/axios';
import type { AxiosResponse } from 'axios';
import type { Stats, User } from '../types/index';

export default function Profile() {
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const hasFetched = useRef(false);

  const [user, setUser]   = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ username: '', email: '' });
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    Promise.all([
      api.get('/auth/me/'),
      api.get('/anime/my/stat/'),
    ]).then(([uRes, sRes]: [AxiosResponse<User>, AxiosResponse<Stats>]) => {
      setUser(uRes.data);
      setForm({ username: uRes.data.username, email: uRes.data.email });
      setStats(sRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleInfoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleInfoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMsg(null);
    try {
      const { data } = await api.patch('/auth/me/', form);
      setUser(data);
      setInfoMsg({ type: 'success', text: 'Данные сохранены' });
    } catch {
      setInfoMsg({ type: 'error', text: 'Не удалось сохранить — проверь данные' });
    } finally {
      setSavingInfo(false);
    }
  };

  const handleAvatarPick = () => fileInput.current?.click();

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await api.patch('/auth/me/', fd);
      setUser(data);
    } catch {
      setInfoMsg({ type: 'error', text: 'Не удалось загрузить аватар' });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePwChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handlePwSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPwMsg(null);

    if (pwForm.new_password !== pwForm.confirm) {
      setPwMsg({ type: 'error', text: 'Новые пароли не совпадают' });
      return;
    }
    if (pwForm.new_password.length < 8) {
      setPwMsg({ type: 'error', text: 'Пароль должен быть не короче 8 символов' });
      return;
    }

    setSavingPw(true);
    try {
      await api.post('/auth/change_password/', {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      });
      setPwMsg({ type: 'success', text: 'Пароль изменён' });
      setPwForm({ old_password: '', new_password: '', confirm: '' });
    } catch {
      setPwMsg({ type: 'error', text: 'Проверь текущий пароль и попробуй снова' });
    } finally {
      setSavingPw(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="profile-page fade-in">

      <div className="db-hero">
        <div>
          <h2 className="db-heading">Профиль</h2>
          <p className="db-sub">Управляй аккаунтом и настройками</p>
        </div>
      </div>

      <div className="profile-layout">

        {/* ── Левая колонка ── */}
        <div className="profile-left">
          <div className="card profile-card">
            <div className="profile-avatar-wrap" onClick={handleAvatarPick}>
              <div className="profile-avatar">
                {avatarPreview || user.avatar
                  ? <img src={avatarPreview ?? user.avatar ?? undefined} alt={user.username} />
                  : <span>{user.username?.[0]?.toUpperCase() ?? '?'}</span>
                }
                {avatarUploading && <span className="spinner profile-avatar__spinner" />}
              </div>
              <div className="profile-avatar-edit">
                <IconCamera size={14} stroke={1.75} />
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
              />
            </div>
            <p className="profile-username">{user.username}</p>
            <p className="profile-email">{user.email}</p>
          </div>

          {stats && (
            <div className="card profile-quickstats">
              <p className="db-section-title">Коллекция</p>
              <div className="qs-row">
                <span className="qs-label">Всего аниме</span>
                <span className="qs-value">{stats.total_anime}</span>
              </div>
              <div className="qs-row">
                <span className="qs-label">Просмотрено</span>
                <span className="qs-value">{stats.watched}</span>
              </div>
              <div className="qs-row">
                <span className="qs-label">Смотрю сейчас</span>
                <span className="qs-value">{stats.watching}</span>
              </div>
              <div className="qs-row">
                <span className="qs-label">Средняя оценка</span>
                <span className="qs-value qs-value--accent">
                  {stats.avg_rate ? stats.avg_rate.toFixed(1) : '—'}
                </span>
              </div>
            </div>
          )}

          <button className="btn btn-danger w-full" onClick={handleLogout}>
            <IconLogout size={16} stroke={1.75} /> Выйти из аккаунта
          </button>
        </div>

        {/* ── Правая колонка ── */}
        <div className="profile-right">

          <form className="card" onSubmit={handleInfoSubmit}>
            <p className="db-section-title profile-section-title">Основная информация</p>
            {infoMsg && (
              <div className={`alert ${infoMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {infoMsg.text}
              </div>
            )}
            <div className="input-group">
              <label className="input-label">Имя пользователя</label>
              <input
                className="input"
                name="username"
                value={form.username}
                onChange={handleInfoChange}
                autoComplete="username"
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleInfoChange}
                autoComplete="email"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingInfo}>
              {savingInfo
                ? <span className="spinner" style={{ width: 16, height: 16 }} />
                : <><IconDeviceFloppy size={16} stroke={1.75} /> Сохранить</>
              }
            </button>
          </form>

          <form className="card" onSubmit={handlePwSubmit}>
            <p className="db-section-title profile-section-title">Смена пароля</p>
            {pwMsg && (
              <div className={`alert ${pwMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {pwMsg.text}
              </div>
            )}
            <div className="input-group">
              <label className="input-label">Текущий пароль</label>
              <input
                className="input"
                type="password"
                name="old_password"
                value={pwForm.old_password}
                onChange={handlePwChange}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Новый пароль</label>
              <input
                className="input"
                type="password"
                name="new_password"
                value={pwForm.new_password}
                onChange={handlePwChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Повтори новый пароль</label>
              <input
                className="input"
                type="password"
                name="confirm"
                value={pwForm.confirm}
                onChange={handlePwChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <button type="submit" className="btn btn-ghost" disabled={savingPw}>
              {savingPw
                ? <span className="spinner" style={{ width: 16, height: 16 }} />
                : <><IconLock size={16} stroke={1.75} /> Изменить пароль</>
              }
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
