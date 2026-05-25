import { useState, type ChangeEvent, type FormEvent } from 'react';
import axios from 'axios';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export default function Register() {
  const [form, setForm] = useState<RegisterForm>({ username: '', email: '', password: '' });
  const [error, setError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('/api/auth/register/', form);
      window.location.href = '/login';
    } catch {
      setError('Ошибка регистрации. Проверь данные.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
      <h2>Регистрация</h2>
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
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
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
          Зарегистрироваться
        </button>
      </form>
      <p>Уже есть аккаунт? <a href="/login">Войти</a></p>
    </div>
  );
}