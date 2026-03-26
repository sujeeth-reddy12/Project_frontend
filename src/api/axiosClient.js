import axios from 'axios';

const AUTH_STORAGE_KEY = 'cms-auth';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8081/api',
});

axiosClient.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null');
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

export { AUTH_STORAGE_KEY };
export default axiosClient;
