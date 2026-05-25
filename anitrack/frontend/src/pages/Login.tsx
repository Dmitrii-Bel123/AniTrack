import { useState, type ChangeEvent, type FormEvent } from 'react';
import axios from 'axios';

interface LoginForm {
  username: string;
  password: string;
}

export default function Login() {
  const [form, setForm] = useState<LoginForm>({ username: '', password: '' });
  const [error, setError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await axios.post('/api/auth/login/', form);
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      window.location.href = '/';
    } catch {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            name="username"
            placeholder="Имя пользователя"
            value={form.username}
            onChange={handleChange}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
        </div>
        <div>
          <input
            name="password"
            type="password"
            placeholder="Пароль"
            value={form.password}
            onChange={handleChange}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: 10 }}>
          Войти
        </button>
      </form>
      <p>Нет аккаунта? <a href="/register">Зарегистрироваться</a></p>
    </div>
  );
}