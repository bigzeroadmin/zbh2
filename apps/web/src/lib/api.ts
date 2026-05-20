import axios from 'axios';

const api = axios.create({ baseURL: '/api', withCredentials: true });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      // Don't redirect for public pages — only if action required login
    }
    return Promise.reject(err);
  }
);

export default api;
