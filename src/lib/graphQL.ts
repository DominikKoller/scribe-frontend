// frontend/src/lib/graphQL.ts

import axios from 'axios';
import { authToken } from '$lib/stores/auth';
import { PUBLIC_APOLLO_URL } from '$env/static/public';

export const api = axios.create({
    baseURL: PUBLIC_APOLLO_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

authToken.subscribe((token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
});

export const graphQL = async (query: string, variables: any = {}) => {

    const response = await api.post('', {
        query,
        variables,
    });

    if (response.data.errors) {
        throw new Error(JSON.stringify(response.data.errors));
    }
    return response.data.data;
}