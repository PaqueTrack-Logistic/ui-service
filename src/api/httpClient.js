import axios from 'axios';

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;

const httpClient = axios.create({ timeout: 15000 });
const HTTP_DEBUG = import.meta.env.VITE_HTTP_DEBUG === 'true';

httpClient.interceptors.request.use((config) => {
  if (HTTP_DEBUG) {
    const method = (config.method || 'get').toUpperCase();
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.debug('[HTTP][REQ]', method, fullUrl, {
      headers: config.headers,
      params: config.params,
      data: config.data,
    });
  }
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (res) => {
    if (HTTP_DEBUG) {
      const method = (res.config.method || 'get').toUpperCase();
      const fullUrl = `${res.config.baseURL || ''}${res.config.url || ''}`;
      console.debug('[HTTP][RES]', method, fullUrl, {
        status: res.status,
        data: res.data,
      });
    }
    return res;
  },
  async (error) => {
    if (HTTP_DEBUG) {
      const method = (error.config?.method || 'get').toUpperCase();
      const fullUrl = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
      console.debug('[HTTP][ERR]', method, fullUrl, {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_GATEWAY_URL}/api/auth/refresh`, { refreshToken });
          const data = res.data.content || res.data;
          sessionStorage.setItem('accessToken', data.accessToken);
          sessionStorage.setItem('refreshToken', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return httpClient(original);
        } catch {
          sessionStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default httpClient;
