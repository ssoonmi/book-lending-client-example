# Part II

Today, we will be learning how to do user authentication and mutations in the frontend with Apollo Client.

Please use the Part I that you worked on yesterday for this project or clone/download this repo.

## Authentication on the Server

Authentication is already set up in the server. If you need to familiarize yourself with how to set up authentication in the server, take a look at the following server files: 

- index.js - initializing passport and connecting the passport middleware to graphql
- config/passport.js - configuring passport to get the token from the `authorization` header and finding a user by the id
- middlewares/index.js `passportAuthenticate` function - if there is a user from the token, then put the user on the request (which will be the context argument to the GraphQL resolvers)
- schema/types/User.js - `login` mutation that returns a `UserCredentials` type with a `token` and a `loggedIn` field
- models/User.js - `login` function defined on the `User` model that will put `token` and `loggedIn` properties on the return of the mutation

## Authentication on the Client

Authentication on the client will be validated through the token stored on `localStorage`, which is a way for data to be persisted on the client, similar to how cookies persist through refreshes.

Let's set our `authorization` header to the `token` in our `localStorage`. Head over to the `src/graphql/client.js` file and add the `authorization` key to our `headers` in our `httpLink` to `localStorage.getItem('token')`.

```javascript
// src/graphql/client.js
const httpLink = new HttpLink({
  uri: 'http://localhost:5000/graphql',
  headers: {
    authorization: localStorage.getItem('token')
  }
});
```

Let's test this out. First we need to set our `token` to our `localStorage`. In GraphQL Playground, `login` with the demo user who has a `username` of `"demo"` and `password` of `"password"`. You should return the `token` from this query. In the Chrome DevTools console, write `localStorage.setItem('token', token)` where `token` is the `token` you got back from Playground.

Next, we need to use our `client` to query our server to see if the `authorization` header was set properly. If you head over to Playground again, you'll see a `me` query in the schema. Let's use this query to return information about the current user using the `token`. 

Right after the definition of our `client`, let's do:

```javascript
// src/graphql/client.js after defining the client
client
  .query({
    query: gql`
      query CurrentUser {
        me {
          _id
          username
        }
      }
    `
  })
  .then(result => console.log(result));
```

Make sure to `import gql from 'graphql-tag'` at the top of the file. 

This is querying our server for the current user with the `headers` defined in our `httpLink`. 

Refresh the page and take a look at what was logged in the console. You should see an object with `data` and `data.me` including the information about the demo user.

If we clear the token, `localStorage.removeItem('token')` and refresh the page, then you should see an object logged with `data` and `data.me` with the value of `null`.

Awesome! Our server will now know if there is a current user from the `token` that we defined on our `authorization` header. But how does our client know if there is a user that is logged in? In `Redux`, we had a slice of state called `session` that stored the `id` of our current user and identified if there was an authenticated user. Similar to that, we will use the `cache` in Apollo Client to identify if there is a logged in user.

When our app loads for the first time, we need to tell the `cache` if there is a user logged in or not. This will be determined by the presence of our `token` in the `localStorage`.

After the client definition, let's write to the `cache` using `client.writeData`. We are going to set a key of `isLoggedIn` in our `cache`'s `data` to a Boolean value. 

```javascript
// src/graphql/client.js after client definition
cache.writeData({
  data: {
    isLoggedIn: !!localStorage.getItem("token")
  }
});
```

This isn't enough for the client to know whether or not we have a real authenticated user. Our `token` could be expired or the `user` could not exist anymore. So, we need to tell our client to query for the current user data if there is a `token`. If the query returns a valid user, then we are fine, but if it doesn't, then we have to either set the `isLoggedIn` boolean in our `cache` to `false` or reset the `cache`. 

Resetting the `cache` has pros and cons. When resetting the `cache`, any user specific data will be erased upon log out. But, you will lose all your `cache`d data. Let's reset the `cache` for now, and you can choose if it's resetting the store is the best decision for your app for yourself later.

After `cache.writeData`, we will be using the `me` query to return information about our current user.

```javascript
// src/graphql/client.js after cache.writeData
const CURRENT_USER = gql`
  query CurrentUser {
    me {
      _id
      username
    }
  }
`;

// wait to see if there is a current user
if (localStorage.getItem('token')) {
  client
    .query({ query: CURRENT_USER })
    .then(({ data }) => {
      // if there is no data or data.me is null, then reset the cache
      if (!data || !data.me) client.resetStore();
    });
}
```

If there is no `data` or `data.me` is null, then reset the `cache`. 

We should also remove the invalid `token` from our `localStorage` when the client is reset. We can define what our cache should do when our `cache` is reset using, `client.onResetStore`. This takes in a callback function that will be called whenever our `cache` resets.

Let's add the following right before we query for the current user which will clear the `localStorage` and write `isLoggedIn` to false in our `cache` `data`:

```javascript
// src/graphql/client.js
// call resetStore whenever logging out
client.onResetStore(() => {
  client.writeData({ data: { isLoggedIn: false } });
  localStorage.clear();
});

if (localStorage.getItem('token')) {
  //...
}
```

Hang on. I forgot to mention that `client.query` is an asynchronous function. This means that our app could start to render things without our app knowing if there is a valid user or not. Let's wait for this `client.query` to run by `await`ing this and making the `createClient` function `async`. 

We need to refactor the entry file a bit now. Our `createClient` doesn't return the `client` when called anymore. Since our `createClient` function is `async`, we need to wait for the `createClient` to run. The callback to a `.then` function defined on `createClient()` should take in the return value of the `createClient` function, which is the `client`.

```javascript
// src/index.js
createClient().then(client => {
  ReactDOM.render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
    document.getElementById("root")
  );
});
```

Now we should be done with setting up our `client` for authentication for now! But how do we test this? First we need to show if there is a current user or not and be able to log out.

## Current User Profile

Let's create a `UserProfile` which will be a `ProtectedRoute` and will render the list of books that the current user has borrowed and the `LogOutButton`.

We will be using the `me` query to gain information about the current user and their borrowed `books`.

The `CURRENT_USER` query that we used in our `createClient` function at `src/graphql/client.js` can be reused, so let's move that query to our queries in `src/graphql/queries.js`. Make sure to import it in the `client.js` file after you move it.

We need to refactor that query so it returns all the borrowed `books` for the current user, not just the `_id` and the `username`.

```javascript
// src/graphql/queries.js
export const CURRENT_USER = gql`
  query CurrentUser {
    me {
      _id
      username
      books {
        _id
        title
      }
    }
  }
`;
```

Now, create a `UserProfile` page in our `src/pages` and create a route for it in `App.js` at `/me`.

Your `UserProfile` component page should render the `NavBar` component and a `UserDetails` component defined in a folder called `users` in your `src/components` folder.

To test this page out, make sure you have the `token` in your `localStorage`.

**Try creating the `UserProfile` and `UserDetails` components on your own. If you need help, please ask a question before looking below.**

```javascript
// src/App.js in your routes
<Route path="/me" component={UserProfile} />
```

```javascript
// src/pages/UserProfile.js
import React from 'react';
import NavBar from '../components/navbar/NavBar.js';
import UserDetails from '../components/users/UserDetails.js';

export default () => {
  return (
    <>
      <NavBar />
      <UserDetails />
    </>
  )
}
```

```javascript
// src/components/users/UserDetails.js
import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { Link } from 'react-router-dom';
import { CURRENT_USER } from '../../graphql/queries';

export default () => {
  const { data, loading, error } = useQuery(CURRENT_USER);

  if (loading) return <p>Loading</p>;
  if (error) return <p>ERROR</p>;
  if (!data) return <p>Not found</p>;

  return (
    <>
      <h1>Hello {data.me.username}!</h1>
      <h2>List of Borrowed Books</h2>
      <ul>
        {data.me.books && data.me.books.map(book => (
          <li key={book._id}>
            <Link to={`/books/${book._id}`}>
              {book.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
```