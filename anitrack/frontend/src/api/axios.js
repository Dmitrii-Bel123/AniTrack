import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  // Nginx проксирует /api/ → Django
});

// Перед каждым запросом — подставляем access токен
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Если получили 401 — пробуем обновить токен
api.interceptors.response.use(
  (response) => response,  // всё ок — просто возвращаем ответ

  async (error) => {
    const originalRequest = error.config;

    // 401 и мы ещё не пробовали рефрешить
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;  // флаг чтобы не зациклиться

      const refresh = localStorage.getItem('refresh');

      if (!refresh) {
        // Рефреш токена нет — отправляем на логин
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post('/api/auth/token/refresh/', {
          refresh,
        });

        localStorage.setItem('access', data.access);

        // Повторяем исходный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);

      } catch (e) {
        // Рефреш токен тоже протух — на логин
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;