import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { CURRENT_USER } from './queries';
import gql from 'graphql-tag';
import { typeDefs, resolvers } from './resolvers';
import { setContext } from 'apollo-link-context';

const createClient = async () => {
  const cache = new InMemoryCache({ dataIdFromObject: object => object._id });

  const links = [];

  const errorLink = onError(({ networkError, graphQLErrors }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path, extensions }) => {
        console.group("\x1b[31m%s\x1b[0m", "[GraphQL error] ", "Message: ", message);
        console.log("Location: ", locations);
        console.log("Path: ", path);
        console.log("Extensions: ", extensions)
        console.groupEnd();
      });
    }
    if (networkError) console.log("\x1b[31m%s\x1b[0m", "[Network error]:", networkError);
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers : {
        ...headers,
        authorization: localStorage.getItem('token')
      }
    };
  });

  const httpLink = new HttpLink({
    uri: 'http://localhost:5000/graphql'
  });

  const client = new ApolloClient({
    cache,
    link: authLink.concat(httpLink, errorLink),
    typeDefs,
    resolvers
  });

  // client
  //   .query({
  //     query: gql`
  //     query CurrentUser {
  //       me {
  //         _id
  //         username
  //       }
  //     }
  //   `
  //   })
  //   .then(result => console.log(result));

  if (process.env.NODE_ENV === 'development') {
    window.client = client;
    window.gql = gql;
    window.CURRENT_USER = CURRENT_USER;
  }

  client.onResetStore(() => {
    localStorage.clear();
  });

  if (localStorage.getItem('token')) {
    await client
      .query({ query: CURRENT_USER })
      .then(({ data }) => {
        console.log(data);
        // if there is no data or data.me is null, then reset the cache
        if (!data || !data.me) client.resetStore();
      });
  }

  return client;
};

export default createClient;