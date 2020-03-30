import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloLink } from 'apollo-link';
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";

const createClient = () => {
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
  links.push(errorLink);

  const httpLink = new HttpLink({
    uri: 'http://localhost:5000/graphql',
    headers: {
      // ...
    }
  });

  links.push(httpLink);

  const client = new ApolloClient({
    cache,
    link: ApolloLink.from(links),
  });

  return client;
};

export default createClient;