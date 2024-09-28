import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { PUBLIC_APOLLO_URL } from '$env/static/public';

const client = new ApolloClient({
    uri: PUBLIC_APOLLO_URL,
    cache: new InMemoryCache(),
})

export default client;