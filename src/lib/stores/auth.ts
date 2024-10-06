// frontend/src/lib/stores/auth.ts
import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

let initialRegisteredTokens: AuthTokens | null = null;
let initialAnonymousTokens: AuthTokens | null = null;

if (browser) {
	const registeredAccessToken = localStorage.getItem('registeredAccessToken');
	const registeredRefreshToken = localStorage.getItem('registeredRefreshToken');
	if (registeredAccessToken && registeredRefreshToken) {
		initialRegisteredTokens = {
			accessToken: registeredAccessToken,
			refreshToken: registeredRefreshToken,
		};
	}

	const anonymousAccessToken = localStorage.getItem('anonymousAccessToken');
	const anonymousRefreshToken = localStorage.getItem('anonymousRefreshToken');
	if (anonymousAccessToken && anonymousRefreshToken) {
		initialAnonymousTokens = {
			accessToken: anonymousAccessToken,
			refreshToken: anonymousRefreshToken,
		};
	}
}

export const registeredTokens = writable<AuthTokens | null>(initialRegisteredTokens);
export const anonymousTokens = writable<AuthTokens | null>(initialAnonymousTokens);

registeredTokens.subscribe((tokens) => {
	if (browser) {
		if (tokens && tokens.accessToken && tokens.refreshToken) {
			localStorage.setItem('registeredAccessToken', tokens.accessToken);
			localStorage.setItem('registeredRefreshToken', tokens.refreshToken);
		} else {
			localStorage.removeItem('registeredAccessToken');
			localStorage.removeItem('registeredRefreshToken');
		}
	}
});

anonymousTokens.subscribe((tokens) => {
	if (browser) {
		if (tokens && tokens.accessToken && tokens.refreshToken) {
			localStorage.setItem('anonymousAccessToken', tokens.accessToken);
			localStorage.setItem('anonymousRefreshToken', tokens.refreshToken);
		} else {
			localStorage.removeItem('anonymousAccessToken');
			localStorage.removeItem('anonymousRefreshToken');
		}
	}
});