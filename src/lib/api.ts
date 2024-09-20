// frontend/src/lib/api.ts
import axios from 'axios';
import { authToken } from '$lib/stores/auth';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

authToken.subscribe((token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
});

export default api;