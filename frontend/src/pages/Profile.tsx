import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { IconCamera } from '@tabler/icons-react';
import api from '../api/axios';
import type { User } from '../types/index';

export default function Profile() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [attempt, setAttempt] = useState(0);

  const [user, setUser]   = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ username: '', email: '' });
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);

  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    api.get<User>('/auth/me/', { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        setUser(data);
        setForm({ username: data.username, email: data.email });
      })
      .catch(() => { /* The retry state is shown when user is missing. */ })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  const handleInfoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleInfoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMsg(null);
    try {
      const { data } = await api.patch<User>('/auth/me/', form);
      setUser(current => current && ({ ...current, username: data.username, email: data.email }));
      setForm({ username: data.username, email: data.email });
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

    e.target.value = '';
    setAvatarMessage(null);
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await api.patch<User>('/auth/me/', fd);
      setUser(current => current && ({ ...current, avatar: data.avatar }));
      setAvatarMessage('Фото обновлено.');
    } catch {
      setAvatarMessage('Не удалось загрузить фото. Попробуй другое изображение.');
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

  const heading = <header className="account-heading"><p>Мой аккаунт</p><h1>Профиль</h1></header>;
  if (loading || !user) {
    return <div className="account">{heading}<section className="account-panel">
      {loading ? <p role="status">Загружаю профиль…</p> :
        <><p role="alert">Не удалось загрузить профиль.</p>
          <button className="btn btn-primary" onClick={() => {
            setLoading(true);
            setAttempt(n => n + 1);
          }}>Повторить</button></>}
    </section></div>;
  }

  return (
    <div className="account">
      {heading}
      <section className="account-identity" aria-label="Учётная запись">
        <span className="account-avatar" aria-hidden="true">{user.avatar
          ? <img src={user.avatar} alt="" /> : user.username[0]?.toUpperCase()}</span>
        <div><h2>{user.username}</h2><p>{user.email}</p></div>
        <button className="account-photo" onClick={handleAvatarPick} disabled={avatarUploading}>
          <IconCamera size={18} aria-hidden="true" />{avatarUploading ? 'Загружаю…' : 'Сменить фото'}
        </button>
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
        {avatarMessage && <p className="account-avatar-message" role="status">{avatarMessage}</p>}
      </section>
      <div className="account-forms">
          <form className="account-panel" onSubmit={handleInfoSubmit}>
            <h2>Личные данные</h2>
            {infoMsg && (
              <div role="status" className={`alert ${infoMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {infoMsg.text}
              </div>
            )}
            <div className="input-group">
              <label className="input-label" htmlFor="account-username">Имя пользователя</label>
              <input
                className="input"
                name="username" id="account-username"
                disabled={savingInfo}
                value={form.username}
                onChange={handleInfoChange}
                autoComplete="username"
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="account-email">Электронная почта</label>
              <input
                className="input"
                type="email"
                name="email" id="account-email"
                disabled={savingInfo}
                value={form.email}
                onChange={handleInfoChange}
                autoComplete="email"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingInfo || (form.username === user.username && form.email === user.email)}>
              {savingInfo ? 'Сохраняю…' : 'Сохранить данные'}
            </button>
          </form>

          <form className="account-panel" onSubmit={handlePwSubmit}>
            <h2>Смена пароля</h2>
            {pwMsg && (
              <div role="status" className={`alert ${pwMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {pwMsg.text}
              </div>
            )}
            <div className="input-group">
              <label className="input-label" htmlFor="account-old_password">Текущий пароль</label>
              <input
                className="input"
                type="password"
                name="old_password" id="account-old_password"
                disabled={savingPw}
                value={pwForm.old_password}
                onChange={handlePwChange}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="account-new_password">Новый пароль (от 8 символов)</label>
              <input
                className="input"
                type="password"
                name="new_password" id="account-new_password"
                disabled={savingPw}
                value={pwForm.new_password}
                onChange={handlePwChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="account-confirm">Повтори новый пароль</label>
              <input
                className="input"
                type="password"
                name="confirm" id="account-confirm"
                disabled={savingPw}
                value={pwForm.confirm}
                onChange={handlePwChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <button type="submit" className="btn btn-ghost" disabled={savingPw}>
              {savingPw ? 'Сохраняю…' : 'Изменить пароль'}
            </button>
          </form>

      </div>
    </div>
  );
}
