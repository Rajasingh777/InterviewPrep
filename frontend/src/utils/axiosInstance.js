import axios from "axios";

const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:9000";

// Keep base URL stable even when env accidentally includes trailing slash.
const normalizedApiBaseUrl = rawApiBaseUrl.replace(/\/+$/, "");

const axiosInstance = axios.create({
  baseURL: normalizedApiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or wherever you store it
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
