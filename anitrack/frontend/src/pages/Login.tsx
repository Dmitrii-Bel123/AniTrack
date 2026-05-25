import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface LoginForm {
  username: string;
  password: string;
}

export default function Login() {
  const [form, setForm] = useState<LoginForm>({ username: '', password: '' });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/auth/login/', form);
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      window.location.href = '/';
    } catch {
      setError('Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb--1" />
        <div className="auth-orb auth-orb--2" />
      </div>

      <div className="auth-box fade-in">
        <div className="auth-header">
          <div className="auth-logo">A</div>
          <h1 className="auth-title">AniTrack</h1>
          <p className="auth-subtitle">Войдите в свой аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="input-group">
            <label className="input-label">Имя пользователя</label>
            <input
              className="input"
              name="username"
              placeholder="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Пароль</label>
            <input
              className="input"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Войти'}
          </button>
        </form>

        <p className="auth-switch">
          Нет аккаунта?{' '}
          <Link to="/register" className="auth-link">Зарегистрироваться</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: var(--bg-deep);
        }

        .auth-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .auth-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
        }

        .auth-orb--1 {
          width: 500px; height: 500px;
          background: var(--accent);
          top: -100px; left: -100px;
        }

        .auth-orb--2 {
          width: 400px; height: 400px;
          background: var(--surface-2);
          bottom: -80px; right: -80px;
        }

        .auth-box {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 40px;
          box-shadow: var(--shadow-lg);
        }

        .auth-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 32px;
          gap: 8px;
        }

        .auth-logo {
          width: 48px; height: 48px;
          background: var(--accent);
          color: #fff;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.4rem;
          margin-bottom: 4px;
        }

        .auth-title {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--text);
        }

        .auth-subtitle {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 24px;
        }

        .auth-switch {
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .auth-link {
          color: var(--accent);
          font-weight: 500;
          transition: color var(--transition);
        }

        .auth-link:hover { color: var(--accent-hover); }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .btn-lg.w-full {
          width: 100%;
          justify-content: center;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}