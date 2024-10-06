// frontend/src/lib/graphQL.ts

import axios from 'axios';
import { registeredTokens, anonymousTokens, type AuthTokens } from '$lib/stores/auth';
import { PUBLIC_APOLLO_URL } from '$env/static/public';
import { get, type Writable } from 'svelte/store';
import { jwtDecode } from 'jwt-decode';

async function refreshIfExpired(tokens: AuthTokens): Promise<AuthTokens> {
    if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
        throw new Error('No tokens found');
    }
    const decodedToken = jwtDecode(tokens.accessToken);
    if (!decodedToken.exp) {
        throw new Error('No expiration date found in token');
    }

    if (decodedToken.exp - Date.now() / 1000 > 300) {
        console.log('Token is still valid for more than 5 minutes. Still valid for: ', decodedToken.exp - Date.now() / 1000);
        return tokens;
    }

    console.log("REFRESHING TOKENS");


    // if token expires in less than 5 minutes, refresh it
    const refreshTokenMutation = `
                    mutation Refresh($refreshToken: String!) {
                        refresh(refreshToken: $refreshToken) {
                            accessToken
                            refreshToken
                        }
                    }
                `;
    const response = await axios.post(PUBLIC_APOLLO_URL, {
        query: refreshTokenMutation,
        variables: { refreshToken: tokens.refreshToken },
    });

    console.log("REFRSHED");

    if (response.data.errors) {
        console.log("ERROR REFRESHING TOKENS");
        throw new Error(JSON.stringify(response.data.errors));
    }

    console.log("Refreshing response data: ", response.data);

    const { accessToken, refreshToken } = response.data.data.refresh;

    return {
        accessToken,
        refreshToken,
    };
}

export const graphQL = async (query: string, variables: any = {}) => {
    // gets the tokens store - this may be either the registered or anonymous tokens
    let registeredTokensValues = get(registeredTokens);

    let tokensStore: Writable<AuthTokens | null>;

    if (registeredTokensValues && registeredTokensValues.accessToken && registeredTokensValues.refreshToken) {
        tokensStore = registeredTokens;
        console.log("getting registered tokens");
    } else {
        tokensStore = anonymousTokens;
        console.log("getting anonymous tokens");
    }

    let tokens = get(tokensStore);
    console.log('Tokens:', tokens);

    if (tokens) {
        try {
            console.log("trying to refresh tokens");
            tokens = await refreshIfExpired(tokens);
            console.log("successfully refreshed tokens");
            tokensStore.set(tokens);
        } catch (error) {
            console.log('Error refreshing token. This may mean the server has logged us out / restarted.', error);
            tokensStore.set(null);
        }
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }

    if (tokens && tokens.accessToken) {
        console.log("setting authorization header");
        headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    } else {
        console.log("no tokens found to set authorization header");
    }

    const response = await axios.post(PUBLIC_APOLLO_URL,
        {
            query,
            variables,
        },
        {
            headers,
        });

    if (response.data.errors) {
        throw new Error(JSON.stringify(response.data.errors));
    }
    return response.data.data;
}