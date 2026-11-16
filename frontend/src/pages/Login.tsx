import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../components/layout/AuthLayout';

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
    <AuthLayout title="С возвращением" subtitle="Войди, чтобы продолжить свою историю.">
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <div className="input-group">
            <label className="input-label" htmlFor="auth-username">Имя пользователя</label>
            <input
              className="input"
              name="username" id="auth-username"
              placeholder="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="auth-password">Пароль</label>
            <input
              className="input"
              name="password" id="auth-password"
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
    </AuthLayout>
  );
}
