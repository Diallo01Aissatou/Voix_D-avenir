import axios from "axios";

const Api = axios.create({
    baseURL: 'https://voix-avenir-backend.onrender.com/api',
    withCredentials: true,
})
export default Api 
