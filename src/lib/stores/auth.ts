// frontend/src/lib/stores/auth.ts
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

const registeredToken = browser ? localStorage.getItem('token') : null;
const anonymousStoredToken = browser ? localStorage.getItem('anonymousToken') : null;

export const registeredAuthToken = writable<string | null>(registeredToken);
export const anonymousAuthToken = writable<string | null>(anonymousStoredToken);

export const authToken = derived(
	[registeredAuthToken, anonymousAuthToken],
	([$registeredAuthToken, $anonymousAuthToken]) => {
		return $registeredAuthToken || $anonymousAuthToken;
	}
);

registeredAuthToken.subscribe((token) => {
	if (browser) {
		if (token) {
			localStorage.setItem('token', token);
		} else {
			localStorage.removeItem('token');
		}
	}
});

anonymousAuthToken.subscribe((token) => {
	if (browser) {
		if (token) {
			localStorage.setItem('anonymousToken', token);
		} else {
			localStorage.removeItem('anonymousToken');
		}
	}
});