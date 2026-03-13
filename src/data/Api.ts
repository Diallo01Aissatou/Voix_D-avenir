import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://voix-avenir-backend.onrender.com/api';

const Api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})
export default Api 
