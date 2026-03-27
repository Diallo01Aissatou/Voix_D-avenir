import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://voix-avenir-backend.onrender.com/api';
const BASE_URL = API_BASE_URL.replace(/\/api$/, '');

const Api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

// Intercepteur pour ajouter le token aux requêtes
Api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('mentora_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export { BASE_URL };
export default Api;
