# Part II

Today, we will be learning how to do user authentication and mutations in the frontend with Apollo Client.

Please use the Part I that you worked on yesterday for this project or download [part1_solutions.zip].

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

Let's test this out. First we need to set our `token` to our `localStorage`. In GraphQL Playground, `login` with the demo user who has a `username` of `"demo"` and `password` of `"password"`. You should return the `token` from this query. 

Once we have our `token`, head back to the React app. In the Chrome DevTools console, write `localStorage.setItem('token', token)` where `token` is the `token` you got back from Playground.

Next, we need to use our `client` to query our server to see if the `authorization` header was set properly. If you head over to Playground again, you'll see information about the `me` query in the `"SCHEMA"` tab. Let's use this query to return information about the current user using the `token` in our React app now. 

Right after the definition of our `client`, let's query for the current user using the `me` query:

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

If we clear the token, `localStorage.removeItem('token')` and refresh the page, then you should see an object logged with `data` and `data.me` with the value of `null`. **Remove or comment out the query after finishing tests.**

Awesome! Our server will now know if there is a current user from the `token` that we defined on our `authorization` header. But how does our client know if there is a user that is logged in? In `Redux`, we had a slice of state called `session` that stored the `id` of our current user and identified if there was an authenticated user. Similar to that, we will use the `cache` in Apollo Client to identify if there is a logged in user.

When our app loads for the first time, we need to tell the `cache` if there is a user logged in or not. This will be determined by the presence of our `token` in the `localStorage`.

One way of doing this, is to define **local `typeDefs` and `resolvers`** which exist **only on the client**, not on the server. We can create a client-only `Query` which will tell us if there is a user logged in or not based on the `token` in the `localStorage`.

To make these local `typeDefs` and `resolvers`, create a file called `resolvers.js` in `src/graphql` folder. 

We want to `extend` the `Query` `type` to include a `isLoggedIn` field that will always resolve to a `Boolean` value. We are then going to create a `resolver` function on the `Query` type called  `isLoggedIn` that will return `true` if there is a `token`, and `false` if there isn't.

```javascript
// src/graphql/resolvers.js
import gql from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    isLoggedIn: Boolean!
  }
`;

export const resolvers = {
  // for data that only exists in the frontend
  Query: {
    isLoggedIn: () => {
      // console.log('isLoggedIn resolver called') // comment this in to see when this resolver function is called
      return !!localStorage.getItem("token")
    }
  }
};
```

Export the `typeDefs` and `resolvers`

Now we have to connect the `typeDefs` and `resolvers` to the `client`. Import them into the `src/graphql/client.js` file. Attach them to the `client` as keys to the options object when defining the `client`: 

```javascript
// src/graphql/client.js client definition
const client = new ApolloClient({
  cache,
  link: ApolloLink.from(links),
  typeDefs,
  resolvers
});
```

This isn't enough for the client to know whether or not we have a real authenticated user. Our `token` could be expired or the `user` could not exist anymore. So, we need to tell our client to query for the current user data if there is a `token`. If the query returns a valid user, then we are fine, but if it doesn't, then we have to either set the `isLoggedIn` boolean in our `cache` to `false` or reset the `cache`. 

Resetting the `cache` has pros and cons. When resetting the `cache`, any user specific data will be erased upon log out. But, you will lose all your `cache`d data. Let's reset the `cache` for now, and you can choose if it's resetting the store is the best decision for your app for yourself later.

After the client definition, we will be using the `me` query to return information about our current user.

```javascript
// src/graphql/client.js after defining client
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
      // console.log(data); // comment this in to see what data returns
      // if there is no data or data.me is null, then reset the cache
      if (!data || !data.me) client.resetStore();
    });
}
```

If there is no `data` or `data.me` is null, then reset the `cache`. We can also do `client.clearStore()`. For more information on which is better, check out the [Apollo Client Docs on logging out].

We should also remove the invalid `token` from our `localStorage` when the client is reset. We can define what our cache should do when our `cache` is reset using, `client.onResetStore`. This takes in a callback function that will be called whenever our `cache` resets.

```javascript
// src/graphql/client.js
// call resetStore whenever logging out
client.onResetStore(() => {
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

Now we should be done with setting up our `client` for authentication for now! But how do we test this? Let's put the `client` and `gql` from `graphql-tag` on the window, but only do this when we are in development mode.

```javascript
if (process.env.NODE_ENV === 'development') {
  window.client = client;
  window.gql = gql;
}
```

Next, let's comment in the `console.log`'s in the `isLoggedIn` resolver function and in the `.then` to the `CURRENT_USER` `query` in `client.js`.

Set the `token` on the `localStorage` to the `token` from earlier and refresh the page. You should see the current user's information printed in the console.

Let's query our `client` for `isLoggedIn`. When we call this query, we have to make sure we add an `@client` keyword after `isLoggedIn`. This will tell the `client` to only ask for the information in our `cache` rather than our server. The query should look like this:

```graphql
query IsLoggedIn {
  isLoggedIn @client
}
```

Use the `client` on the window to `query` for `isLoggedIn`:

```javascript
// run in our Chrome DevTools console
client.query({
  query: gql`
    query isLoggedIn {
      isLoggedIn @client
    }
  `
}).then((data) => console.log(data));
```

We should see `"isLoggedIn resolver called"` logged in our console as well as what the `query` returned, which should have `isLoggedIn: true`. If you run the same query, you don't get `"isLoggedIn resolver called"` logged again. Can you guess why?

The `isLoggedIn` is not stored in the `cache` the first time that the `query` is made, and the `client` will ask for the information from the local `resolvers`. But after the `query` is first called, `isLoggedIn` is stored in the `cache` and can be fetched from there instead of going to the local `resolvers`.

Let's simulate logging out by calling `client.resetStore()` and then running the query again. This will clear our `cache` so the `isLoggedIn` resolver has to be called again to fetch the information asked from the query.

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
  const { data, loading, error } = useQuery(
    CURRENT_USER,
    {
      fetchPolicy: 'cache-and-network'
    }
  );

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

Notice above that we are defining a `fetchPolicy` of `'network-only'` when we use this query. That's because we want the most updated information about our user whenever we access this page. We don't want to rely on what is stored in our `cache`.

Now, try refreshing the page when there is no `token` in your `localStorage` (`localStorage.removeItem('token')`). What happens? You should get an error message saying `Cannot read the property 'username' of null`. Try `console.log`ing what `data.me` is. 

`data.me` should be returning `null`. We should prevent users from accessing the `UserProfile` page if there is not valid user logged in. In `Redux` we defined `AuthRoute`'s and `ProtectedRoute`s to prevent users from accessing different routes based on their logged in status. Let's create the Apollo Client equivalent.

First, we need to define a query called `IS_LOGGED_IN` that will look into our `cache` for the `isLoggedIn` boolean for identifying if a user if logged in or not. Create the `IS_LOGGED_IN` query in `src/graphql/queries.js`:

```javascript
// src/graphql/queries.js
export const IS_LOGGED_IN = gql`
  query IsLoggedIn {
    isLoggedIn @client
  }
`;
```

Create a folder called `util` in our `src/components` folder with a file called `ProtectedRoute.js`. In this component, we will be querying for `isLoggedIn` and using that boolean to either show the component that's passed in, or redirect our user.

**Try to create your own `ProtectedRoute.js` component. If you get stuck, don't look at the solution just yet. Ask a question.**

```javascript
// src/components/util/ProtectedRoute.js
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import { IS_LOGGED_IN } from '../../graphql/queries';

export default ({
  component: Component,
  path,
  exact,
  redirectTo
}) => {
  const { data, loading, error } = useQuery(IS_LOGGED_IN);

  if (!redirectTo) redirectTo = "/login";

  if (loading || error || !data) {
    return null;
  } else if (data.isLoggedIn) {
    return <Route path={path} component={Component} exact={exact} />;
  } else {
    return <Route path={path} render={() => <Redirect to={redirectTo} />} />;
  }
};
```

After you create the `ProtectedRoute` component, let's use this component to render our `UserProfile` page instead of using `Route` in `src/App.js`. Make sure to import the `ProtectedRoute` component.

```javascript
// src/App.js in routes
<ProtectedRoute path="/me" component={UserProfile} />
```

Awesome! Now if you refresh the page at `/me` when you are logged out, you should be redirected. 

**Try creating the `AuthRoute` component that will redirect a user if they are logged in.**

## `LogOutButton`

Let's make the `LogOutButton` on the `UserProfile` page.

Remember, to log out of our app, we need to call `client.resetStore()`. But how do we get access to `client` in a component without doing a `query` or a `mutation`? There is a hook called `useApolloClient` that will return the `client` when invoked.

Create a file called `LogOutButton` in `src/components/users` folder.

**Try creating the `LogOutButton` component on your own. If you get stuck, please ask a question before looking below.**

```javascript
import React from 'react';
import { useApolloClient } from '@apollo/react-hooks';

export default () => {
  const client = useApolloClient();
  return (
    <button onClick={() => {
      client.resetStore();
    }}>
      Log Out
    </button>
  )
};
```

Import this component into `UserProfile` and render it.

Let's test this component out! First, you need to make sure you are logged in with the right `token` on `localStorage`. When you hit the `Log Out` button on the `UserProfile` page, it should redirect you because you are no longer considered logged in by the `ProtectedRoute`.

## `LogInForm`

We're almost done with the authentication process. Now we need a way to log in a user. Let's make our first Apollo Client `mutation` using `login`.

Create a file called `mutations.js` in your `src/graphql` folder. Here you will define your mutations. Let's make on for `LOGIN_USER`. The mutation should look something like this:

```graphql
mutation LogIn($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    _id
    username
    token
    loggedIn
  }
}
```

Next, create a `Login` page with a `LogInForm` component. 

In your `LogInForm` component, we will be creating a form with `useState` and `useMutation` hooks. Import the `LOGIN_USER` mutation and the `IS_LOGGED_IN` and `CURRENT_USER` queries at the top. 

Create just the form with just the `useState` for now, no `useMutation` hook yet.

Now, to submit our form, we need to use the hook, `useMutation`. Familiarize yourself with what `useMutation` returns by checking out this reading again, [Apollo Client reading].

**Try coming up with the syntax for `useMutation`. You should be refetching the `IS_LOGGED_IN` and `CURRENT_USER` query after running the mutation.** After finishing, please compare with the syntax below.

Your completed form should look something like this:

```javascript
import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { LOGIN_USER } from '../../graphql/mutations';
import { IS_LOGGED_IN, CURRENT_USER } from '../../graphql/queries';

export default () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [login, { loading, error }] = useMutation(
    LOGIN_USER,
    {
      variables: {
        username,
        password
      },
      update(cache, { data: { login } }) {
        // we can either write to the cache directly or refetch the IS_LOGGED_IN query so other components will update properly
        // cache.writeData({ data: { isLoggedIn: login.loggedIn, me: { _id: login._id, username: login.username } }});
        localStorage.setItem('token', login.token);
      },
      onError() { },
      refetchQueries: [{ query: IS_LOGGED_IN }, { query: CURRENT_USER }]
    }
  );

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      login();
    }}>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input type="submit" value="Log In" disabled={loading}/>
    </form>
  )
};
```

There are two keys on the `useMutation` options object that you probably haven't seen before, `update` and `onError`. 

The `update` function takes in the `cache` as the first argument, and the result of the mutation as the second argument. The `update` function will run when the mutation is returned from the server. When it comes back, we want to set the `token` in our `localStorage` to the `token` we got back.

The `onError` function is called whenever there is an error returned. This ensures that our entire React app doesn't error out and break if there is an `error` returned from the mutation. The other way we can prevent this from happening is by adding a `.catch` on the `login()` function when submitting the form.

After finishing up the `LogInForm`, make sure you are rendering the form inside your `Login` page and connecting the `Login` page to your `src/App.js` using the `AuthRoute` made from before.

Test out your `Login` page to see if it's working properly and redirecting the user after you press `Log In`!

This is great if logging in is successful, but what about when it's unsuccessful? Try making an unsuccessful log in and see what is logged to your Chrome DevTools console. It looks like there is an error when trying to set the token in the `update` function. Try logging what the `login` variable is in the `update` function when attempting an unsuccessful `login`.

Let's display an `errorMessage` when the `login` variable is null. `useState` to get the `errorMessage` and `setErrorMessage`. When the `update` function and `login` variable is `null`, `setErrorMessage('Invalid Credentials')`, and when it is not null, set the `token` in your `localStorage`. Render the `errorMessage` somewhere in your form.

```javascript
// src/components/users/LogInForm.js update function
update(cache, { data: { login } }) {
  if (!login) setErrorMessage('Invalid Credentials');
  else {
    // we can either write to the cache directly or refetch the IS_LOGGED_IN query so other components will update properly
    // cache.writeData({ data: { isLoggedIn: login.loggedIn }});
    localStorage.setItem('token', login.token);
  }
}
```

Test this out by trying to Log In with invalid credentials.

In our `onError` function, we can also `setErrorMessage` to `"Something went wrong"` when there is a `NetworkError` or `GraphQLErrors`.

```javascript
// src/components/users/LogInForm.js onError function
onError() {
  setErrorMessage('Something went wrong');
}
```

Test out your entire authentication process to make sure there are no errors.

We just finished an entire authentication cycle on our frontend! Awesome work!

## `SignUpForm`

Try making a `SignUp` page and `SignUpForm` on your own. 

There is no mutation for signing up on our server, so head over to the server files and make a mutation for `signup` there as well.

Test out your `SignUp` page and make sure everything works properly still!

[part1_solutions.zip]: /part1_solutions.zip
[Apollo Client reading]: https://github.com/ssoonmi/mern-graphql-curriculum/blob/master/apollo_client.md
[Apollo Client docs on logging out]: https://www.apollographql.com/docs/react/networking/authentication/#reset-store-on-logout