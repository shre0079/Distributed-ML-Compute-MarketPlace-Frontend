import axios from 'axios';

export const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT automatically to every request, if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dcm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401/403, clear stale auth state so the app falls back to login.
// Doesn't force-redirect here — pages decide how to react.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Leave token clearing to the caller for now — some 401s are
      // legitimate business errors (e.g. wrong login password), not
      // session expiry. We only auto-clear on clearly expired tokens
      // detected elsewhere (see store/auth.js refresh logic if added later).
    }
    return Promise.reject(error);
  }
);

export default api;
