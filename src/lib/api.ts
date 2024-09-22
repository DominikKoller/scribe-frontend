// frontend/src/lib/api.ts
import axios from 'axios';
import { authToken } from '$lib/stores/auth';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

const api = axios.create({
    baseURL: PUBLIC_API_BASE_URL,
});

authToken.subscribe((token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
});

export default api;