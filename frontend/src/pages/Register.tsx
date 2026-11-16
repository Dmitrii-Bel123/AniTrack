import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../components/layout/AuthLayout';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export default function Register() {
  const [form, setForm] = useState<RegisterForm>({ username: '', email: '', password: '' });
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
      await axios.post('/api/auth/register/', form);
      window.location.href = '/login';
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data;
        const first = Object.values(data)[0];
        setError(Array.isArray(first) ? first[0] as string : 'Ошибка регистрации');
      } else {
        setError('Ошибка регистрации. Проверь данные.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Начнём историю" subtitle="Твоя коллекция начинается здесь.">
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
            <label className="input-label" htmlFor="auth-email">Email</label>
            <input
              className="input"
              name="email" id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
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
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="auth-switch">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="auth-link">Войти</Link>
        </p>
    </AuthLayout>
  );
}
