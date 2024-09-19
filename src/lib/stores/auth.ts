// src/lib/stores/auth.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const storedToken = browser ? localStorage.getItem('token') : null;

export const authToken = writable<string | null>(storedToken);

authToken.subscribe((token) => {
	if (browser) {
		if (token) {
			localStorage.setItem('token', token);
		} else {
			localStorage.removeItem('token');
		}
	}
});