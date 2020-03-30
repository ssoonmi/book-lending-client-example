# Book Lending Frontend Project

Today, we will be creating the frontend for the online book lending example we saw on Day 1.

## Set Up

### Starting your Server

If you haven't already, follow the [Server Set Up instructions here] for starting your server. We will be making queries and mutations to this server at [localhost:5000/graphql](localhost:5000/graphql). If you want to test out your queries, you can do so at [localhost:5000/playground](localhost:5000/playground). 

### Install Dependencies

**Right outside** of the server repo, we will be using `create-react-app` to create our frontend folder structure. Let's name the project, `book-lending-client`. Run `create-react-app book-lending-client`. If you don't have `create-react-app` command, then you need to `npm install -g create-react-app` and install it globally. Let's `cd` inside of the newly created folder.

`npm install` the following dependencies in the `client` folder: 

- apollo-client
- apollo-cache-inmemory
- apollo-link-http
- apollo-link-error
- @apollo/react-hooks
- react-apollo
- graphql
- graphql-tag
- react-router-dom

## Apollo Client Set Up

Let's create a folder in our `src` folder called `graphql` and create a file called `client.js` inside of it. Here we will initialize our `ApolloClient`, similar to how we initialized our `Redux` store with a `store.js` file.

We need to import the following:

- `ApolloClient` from `apollo-client` - to initialize our client
- `InMemoryCache` from `apollo-cache-inmemory` - provides us with our cache
- `ApolloLink` from `apollo-link` - links middlewares for our client
- `HTTPLink` from `apollo-link-http` - middleware for defining where our GraphQL requests should run against and our headers
- `onError` from `apollo-link-error` - middleware for defining how to log our errors

```javascript
// src/graphql/client.js
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloLink } from 'apollo-link';
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
```

In this file, we are going to define a `createClient` `async` function and export it, like so:

```javascript
// src/graphql/client.js after imports
const createClient = async () => {
  // ...
};

export default createClient;
```

Inside of the `createClient` function, we will be creating the `cache` first from `InMemoryCache`:

```javascript
const cache = new InMemoryCache({ dataIdFromObject: object => object._id });
```

We are passing in an options object into the `new InMemoryCache` with a key of `dataIdFromObject` pointing to a function which will return the `_id` of the `object` that's passed in. This allows the `cache` to identify how it should be storing data by, which in our case is the `_id`. 

Next, we will be defining our middlewares, or `links` Our `links` need to be concatenated in the form of an array. Let's define that array and configure our `errorLink`.

```javascript
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
```



[Server Set Up instructions here]: https://github.com/ssoonmi/mern-graphql-curriculum/blob/master/formulating_queries_and_mutations.md#set-up