# Part I

Today, we will be creating the frontend for the online book lending example we saw on Day 1.

## Set Up the Server

If you haven't already from Day 1, follow the [Server Set Up instructions here] for starting your server from the Book Lending Server Example. We will be making queries and mutations to this server at [localhost:5000/graphql](localhost:5000/graphql). If you want to test out your queries, you can do so at [localhost:5000/playground](localhost:5000/playground). 

## Client Set Up

**Right outside** of the server repo, we will be using `create-react-app` to create our frontend folder structure. Let's name the project, `book-lending-client`. Run `create-react-app book-lending-client`. If you don't have `create-react-app` command, then you need to `npm install -g create-react-app` and install it globally. Let's `cd` inside of the newly created folder.

### Install Dependencies

`npm install` the following dependencies in the `client` folder: 

- apollo-client
- apollo-cache-inmemory
- apollo-link
- apollo-link-http
- apollo-link-error
- @apollo/react-hooks
- react-apollo
- graphql
- graphql-tag
- react-router-dom

### Apollo Client Set Up

Let's create a folder in our `src` folder called `graphql` and create a file called `client.js` inside of it. Here we will initialize our `ApolloClient`, similar to how we initialized our `Redux` store with a `store.js` file.

We need to import the following:

- `ApolloClient` from `apollo-client` - to initialize our client
- `InMemoryCache` from `apollo-cache-inmemory` - provides us with our cache
- `ApolloLink` from `apollo-link` - links middlewares for our client
- `HttpLink` from `apollo-link-http` - middleware for defining where our GraphQL requests should run against and our headers
- `onError` from `apollo-link-error` - middleware for defining how to log our errors

```javascript
// src/graphql/client.js
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloLink } from 'apollo-link';
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
```

In this file, we are going to define a `createClient` function and export it, like so:

```javascript
// src/graphql/client.js after imports
const createClient = () => {
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

The `onError` accepts a callback function that will be run for every error that our `client` gets back when running a query or mutation. The two types of errors are a `networkError` and `graphQLErrors`. `networkError` usually means the `client` couldn't fetch properly from the server. `graphQLErrors` usually means that the server returned an error.

Next, let's define our `httpLink` from a `new HttpLink`. `HttpLink` takes in an options object with a `uri` key and `headers` key. The `uri` is where our GraphQL requests should be run against. In our case, our server is accepting GraphQL requests on [localhost:5000/graphql](localhost:5000/graphql). For now, let's leave `headers` blank.

```javascript
const httpLink = new HttpLink({
  uri: 'http://localhost:5000/graphql',
  headers: {
    // ...
  }
});

links.push(httpLink);
```

Don't forget to push the `httpLink` into our `links` array!

Finally, let's create our client with the `cache` and `links` made from before and return the client from our function.

```javascript
const client = new ApolloClient({
  cache,
  link: ApolloLink.from(links),
});

return client;
```

Go to our client entry file, `src/index.js`. Here we will wrap our `App` with `ApolloProvider` from `@apollo/react-hooks`;, similar to `Redux`'s `Provider` and pass in the result of our `createClient` function.

```javascript
// src/index.js after other imports
import { ApolloProvider } from "@apollo/react-hooks";
import createClient from './graphql/client';

const client = createClient();

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
```

You can keep the `serviceWorker.unregister();` at the bottom. If you want to know more about why you would want to register a `serviceWorker`, then check out this resource, [A Guide to Service Workers in React.js].

Great! We finished connecting our `ApolloClient` to our React app!

## Books List Page

Now let's create a page that will show all the `books`. 

Create a folder in `src` called `components`. Make another folder in called `books` in the `components` folder. Make a file called `BookList.js` inside this folder.

The `BookList` component will use the query `books` to get all the books. Then, it will show all the `books` returned from that query in a list, with the title of each book and the name of the author.

**Try creating this component based on the reading, [Apollo Client reading] before looking below.**

```javascript
// src/components/books/BookList.js
import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const GET_BOOKS = gql`
  query GetBooks {
    books {
      _id
      title
      author {
        _id
        name
      }
    }
  }
`;

export default () => {
  const { data, loading, error } = useQuery(GET_BOOKS);

  if (loading) return <p>Loading</p>;
  if (error) return <p>ERROR</p>;
  if (!data) return <p>Not found</p>;

  return (
    <ul>
      {data.books && data.books.map(book => (
        <li key={book._id}>
          {book.title} by: {book.author.name}
        </li>
      ))}
    </ul>
  );
};
```

Let's display this `BookList` component in a `BookIndex` page. Create a `pages` folder in your `src`. Then create a file called `BookIndex.js` in there. Our `pages` folder will hold all the pages at different routes of our app.

Import the `BookList` component in `BookIndex` component and render a header saying `Book Index Page` and the `BookList` component for now.

**Again, try doing this on your own before looking below.**

```javascript
// src/pages/BookIndex.js
import React from 'react';
import BookList from '../components/books/BookList';

export default () => {
  return (
    <>
      <h1>Book Index Page</h1>
      <BookList />
    </>
  );
};
```

Awesome! Let's head over to `App.js` and import this component. 

For this project, we will be using `BrowserRouter` instead of `HashRouter`. In your future projects, you can choose to use either one. The way we set up `BrowserRouter` is the same way we set up `HashRouter`. Let's put our `BookIndex` page in a `Route` component at the root path, `/`.

**Try this on your own before looking below and comparing with your own.**

```javascript
// src/App.js
import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import BookIndex from './pages/BookIndex';

export default () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={BookIndex} />
      </Switch>
    </BrowserRouter>
  );
};
```

Now let's start your React app! Run `npm start` and open [localhost:3000](localhost:3000).

You should see `Book Index Page` with `ERROR` right underneath it. Open up your Chrome DevTools and check out the console. You should see a `Network Error` with the reason being `cors`, Cross-Origin Resource Sharing, error. We need to configure our server to be able to accept requests from `http://localhost:3000`, not just its own uri, `http://localhost:5000`.

Head over to the `book-lending-server-example` project. Run `npm install -D cors` (we only need to do this configuration in development mode). Go to the server entry file, `index.js`. 

Let's set up `cors`:

```javascript
// book-lending-server-example/index.js after connecting the mongoose database
if (process.env.NODE_ENV !== 'production') {
  const cors = require('cors');
  app.use(cors({ origin: 'http://localhost:3000' }));
}
```

We only need this in development, so we are allowing Cross-Origin Resource Sharing only with the origin of `http://localhost:3000`. **Restart your server.**

Now let's try refreshing our React app. You should see the list of all the books! If you don't, make sure to check the server logs and the Chrome DevTools console to see what errors you have.

## Book Show Page

On your own now, try creating a `BookShow` page. Keep your queries and mutations in your components in your `components` folder, not your `pages` folder, just like how we did with our `BookIndex` page. I suggest making a component called `BookDetails` in `src/components/books`.

You will need to make the `bookId` the wildcard in your `Route` `path` to know which book you want to show. Then, from that `bookId` you will make a query for getting the `book`'s information.

Remember, you can define the `variables` of a query like so:

```javascript
const { data, loading, error } = useQuery(
  GET_WHATEVER, 
  {
    variables: {
      variableName: variableValue
    }
  }
)
```

Refactor your `BookList` component to add a link on each book to direct the user to the respective `BookShow` page.

**Try making the `BookDetails` component and `BookShow` page on your own before looking below. If you are having issues coming up with how to make the query, test it out first in Playground at [localhost:5000/playground](localhost:5000/playground).**

Once you're done, you should have your `BookDetails` component and `BookShow` page looking like so:

```javascript
// src/components/books/BookDetails.js
import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const GET_BOOK = gql`
  query GetBook($bookId: ID!) {
    book(_id: $bookId) {
      _id
      title
      isBooked
      author {
        _id
        name
      }
    }
  }
`;


export default ({ bookId }) => {
  const { data, loading, error } = useQuery(
    GET_BOOK,
    {
      variables: {
        bookId
      }
    }
  );

  if (loading) return <p>Loading</p>;
  if (error) return <p>ERROR</p>;
  if (!data) return <p>Not found</p>;
  if (!data.book) return <p>Book Not Found</p>;

  const book = data.book;

  return (
    <>
      <h2>{book.title}</h2>
      <p>By: {book.author.name}</p>
      {book.isBooked ? (
        <p>Already Checked Out</p>
      ) : (
        <p>Not Checked Out</p>
      )}
    </>
  )
};
```

```javascript
// src/pages/BookShow.js
import React from 'react';
import BookDetails from '../components/books/BookDetails';

export default (props) => {
  const { bookId } = props.match.params;

  return (
    <>
      <h1>Book Show Page</h1>
      <BookDetails bookId={bookId}/>
    </>
  )
}
```

You should have added the following to your `src/App.js`.

```javascript
// src/App.js 
// add this to your imports
import BookShow from './pages/BookShow';
// add this to your list of Routes
<Route path="/books/:bookId" component={BookShow} />
```

Refactor your `BookList` component for each book to link to the `BookShow` page:

```javascript
// src/components/books/BookList.js
// for each book in the list
<li key={book._id}>
  <Link to={`/books/${book._id}`}>
    {book.title} by: {book.author.name}
  </Link>
</li>
```

Make sure to test it out to see if it works!

## Refactoring Your Queries

For now, we define the queries in the same file as the component we are using it in. What if multiple components want to use the same query? Then it would be redundant to define the same queries in multiple components. Let's make our code `DRY`er.

Create a file called `queries.js` in `src/graphql`. Move the `GET_BOOKS` and `GET_BOOK` queries into this file and export them. Make sure to import them in the files that use them.

```javascript
// src/graphql/queries.js
import gql from 'graphql-tag';

export const GET_BOOKS = gql`
 ...
`;

export const GET_BOOK = gql`
 ...
`;
```

### GraphQL Fragments

You may have noticed, information retrieved for a `book` looks the same as `books`. We can make this `DRY`er by defining what's called a GraphQL `fragment`. 

A GraphQL `fragment` has to be defined on a `type`. The inner fields are fields that can be extracted from that `type`.

```javascript
import gql from 'graphql-tag';

const FRAGMENT_NAME = gql`
  fragment FragmentName on TypeName {
    validFieldsOnTypeName
  }
`;
```

To use the `fragment` with `graphql-tag` in a `query`, you need to interpolate the `fragment` into the `query`, like so:

```javascript
import gql from 'graphql-tag';

const QUERY_NAME = gql`
  query QueryName {
    queryName {
      ...FragmentName
      otherValidFieldsOnTypeName
    }
  }
  ${FRAGMENT_NAME}
`;
```

You can define other field names on top of the ones defined on the `fragment` in the query if needed.

Let's try making a `fragment`! Create a `fragments.js` file in our `graphql` folder. 

Inside of it, create a GraphQL `fragment` called `BOOK_DATA` which will define information we want to usually extract from a `Book` type.

**Try making this yourself before looking below.**

```javascript
import gql from 'graphql-tag'

export const BOOK_DATA = gql`
  fragment BookData on Book {
    _id
    title
    author {
      _id
      name
    }
  }
`;
```

Import this fragment into the `queries.js` file and use it in both of the queries there.

**Try refactoring the queries yourself before looking below.**

```javascript
// src/graphql/queries.js
export const GET_BOOKS = gql`
  query GetBooks {
    books {
      ...BookData
    }
  }
  ${BOOK_DATA}
`;

export const GET_BOOK = gql`
  query GetBook($bookId: ID!) {
    book(_id: $bookId) {
      ...BookData
      isBooked
    }
  }
  ${BOOK_DATA}
`
```

Test your `BookIndex` and `BookShow` pages to see if your queries still run properly.

## Other Pages

Try making other pages like `AuthorIndex` or `AuthorShow` pages that use queries! You need to also make the queries in your server. You can also practice refactoring the GraphQL schema in your server and separate the types into different files like we did the other day in [Online Store Part 2: Phase I].

## NavBar

Create a `NavBar` component that you render in every page you want to show it in. The `NavBar` should just have links to the `BookIndex` and `AuthorIndex` pages.

## Refactoring

You can refactor the `BookIndex` component to include links to the `BookShow` and the `AuthorShow` for every book.

You can refactor the `AuthorShow` component to include a list of all the author's `book`s and links to them.

If you have time, you can use it to apply CSS styling to your site so far!

[Server Set Up instructions here]: https://github.com/ssoonmi/mern-graphql-curriculum/blob/master/formulating_queries_and_mutations.md#set-up
[A Guide to Service Workers in React.js]: https://levelup.gitconnected.com/a-guide-to-service-workers-in-react-js-82aec1d6a22d
[Apollo Client reading]: https://github.com/ssoonmi/mern-graphql-curriculum/blob/master/apollo_client.md
[Online Store Part 2: Phase I]: https://github.com/ssoonmi/online-store-part-2/blob/master/phase_i.md