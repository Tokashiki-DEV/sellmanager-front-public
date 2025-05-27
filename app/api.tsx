import axios from "axios";
const BASE_URL = "";

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("sellManagerStoredToken");
    if (token?.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    if (token) {
      config.headers["Authorization"] = `${token}`;
    }
  }
  return config;
});

// Add response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      // Check for unauthorized status
      if (error.response?.status === 401) {
        // Remove invalid token
        localStorage.removeItem("sellManagerStoredToken");
        // Redirect to home page
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
