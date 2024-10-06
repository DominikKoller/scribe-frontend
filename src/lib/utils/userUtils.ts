import { graphQL } from '$lib/graphQL';
import { registeredTokens, anonymousTokens } from '$lib/stores/auth';
import { get, writable, type Writable } from 'svelte/store';

export async function login(email: string, password: string) {
    const mutation = `
				mutation Login($email: String!, $password: String!) {
					login(email: $email, password: $password) {
						accessToken
						refreshToken
					}
				}
			`;
    const result = await graphQL(mutation, { email, password });

    if(!result.login.accessToken || !result.login.refreshToken) {
        throw new Error('No tokens returned');
    }

    registeredTokens.set({
        accessToken: result.login.accessToken,
        refreshToken: result.login.refreshToken
    });

    await fetchUserData();
}

export async function register(email: string, password: string) {
    const mutation = `
				mutation Register($email: String!, $password: String!) {
					register(email: $email, password: $password) {
						accessToken
						refreshToken
					}
				}
			`;
    const result = await graphQL(mutation, { email, password });

    if(!result.register.accessToken || !result.register.refreshToken) {
        throw new Error('No tokens returned');
    }

    registeredTokens.set({
        accessToken: result.register.accessToken,
        refreshToken: result.register.refreshToken
    });

    await fetchUserData();
}

export async function anonymousLogin() {
    try {
        // first, check if there is already a valid login, anonymous or not
        if (get(registeredTokens) || get(anonymousTokens)) {
            const query = `
                query Me {
                    me {
                        id
                    }
                }`;
            const result = await graphQL(query);
            if (result.me.id) {
                return;
            }
        }
    } catch {
        // do nothing
    }

    const mutation = `
            mutation AnonymousLogin {
                anonymousLogin {
                    accessToken
                    refreshToken
                }
            }
        `;
    const result = await graphQL(mutation);

    if(!result.anonymousLogin.accessToken || !result.anonymousLogin.refreshToken) {
        throw new Error('No tokens returned');
    }

    anonymousTokens.set({
        accessToken: result.anonymousLogin.accessToken,
        refreshToken: result.anonymousLogin.refreshToken
    });

    await fetchUserData();
}

interface UserData {
    id: string;
    email: string;
    isAnonymous: boolean;
}

export const userData: Writable<UserData | null> = writable(null);

export async function fetchUserData() {

    // TODO low prio only do this if we actually have a token:

    const query = `
        query Me {
            me {
                id
                email
                isAnonymous
            }
        }`;
    const result = await graphQL(query);
    console.log("me result", result);
    userData.set(result.me || null);
}