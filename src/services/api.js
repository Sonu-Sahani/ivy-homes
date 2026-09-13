import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    // API Key
    const apiKey = import.meta.env.VITE_IVY_API_KEY;

    if (apiKey) {
      config.headers["X-API-Key"] = apiKey.trim();
    }

    // Login Token
    const token =
      localStorage.getItem("ivy_token") ||
      sessionStorage.getItem("ivy_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;