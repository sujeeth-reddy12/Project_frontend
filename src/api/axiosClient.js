import axios from 'axios';

const AUTH_STORAGE_KEY = 'cms-auth';

const axiosClient = axios.create({
  baseURL: 'https://project-backend-2-5p9n.onrender.com/api',
});

axiosClient.interceptors.request.use((config) => {
  const auth = JSON.parse(sessionStorage.getItem(AUTH_STORAGE_KEY) || 'null');
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

export { AUTH_STORAGE_KEY };
export default axiosClient;
