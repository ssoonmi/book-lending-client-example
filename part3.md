# Part III

Today, we'll be exploring fun mutations and how to handle different mutations in different situations!

## `ProtectedComponent` and `AuthComponent`

Make a `ProtectedComponent` and an `AuthComponent` that will render a component only when a user is logged in or logged out respectively.

**Try this out. If you need help coming up with this, ask a question before looking below.**

Here's an example of a `ProtectedComponent`:

```javascript
// src/components/util/ProtectedComponent.js
import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { IS_LOGGED_IN } from '../../graphql/queries';

export default ({ component: Component, ...otherProps }) => {
  const { data, loading, error } = useQuery(IS_LOGGED_IN);

  if (loading || error || !data) {
    return null;
  } else if (data.isLoggedIn) {
    return (
      <Component {...otherProps} />
    );
  } else {
    return null;
  }
};
```

## `BorrowBookButton`

First, familiarize yourself with the `borrowBooks` mutation in Playground. `borrowBooks` takes in an array of `bookIds`. For now, let's use that mutation to create a `BorrowBookButton` to borrow just one book at a time.

Create a mutation template literal called `BORROW_BOOK` that takes in a `bookId` as a variable and uses it to call the `borrowBooks` mutation in your server.

Create a component called `BorrowBookButton` in `src/components/books`, and render it in the `BookDetails` component ONLY when the book `!isBooked` and when there is a logged in user. (Hint: Now's the time to use the `ProtectedComponent`.) 

The `BorrowBookButton` will take in a `book` and render a button that will call the `BORROW_BOOK` mutation when clicked. BUT when we borrow this book, our `me` query in our `cache` will not have an up-to-date list of books that the logged in user has borrowed. We need to either add this book to that list of books that the logged in user has borrowed OR refetch the `me` query. Discuss/Think about what would be the best strategy and choose one.

Make sure you know exactly what the `borrowBooks` mutation returns and what the `me` query returns.

**Try this out. If you need help coming up with this, ask a question before looking below.**

`BORROW_BOOK` template literal:

```graphql
mutation BorrowBook($bookId: ID!) {
  borrowBooks(bookIds: [$bookId]) {
    success
    message
    books {
      _id
      title
      isBooked
    }
  }
}
```

`BookDetails` component:

```javascript
// src/components/books/BookDetails.js somewhere in the return
<ProtectedComponent component={BorrowBookButton} book={book} />
```

`BorrowBookButton` component:

```javascript
// src/components/books/BorrowBookButton.js
import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { BORROW_BOOK } from '../../graphql/mutations';
import { CURRENT_USER } from '../../graphql/queries';

export default ({ book }) => {
  const [borrowBook, { loading, error }] = useMutation(
    BORROW_BOOK,
    {
      variables: { bookId: book._id },
      onError() { },
      update(cache, { data: { borrowBooks: { books }}}) {
        // can either write to the cache directly or refetchQueries
        const data = cache.readQuery({ query: CURRENT_USER })
        const me = Object.assign({}, data.me);
        me.books = me.books.concat(books);
        cache.writeQuery({ query: CURRENT_USER, data: { me } });
      },
      // refetchQueries: [{ query: CURRENT_USER }]
    }
  );

  return (
    <>
      {error && "An error occured while trying to return this book."}
      <button onClick={borrowBook} disabled={loading}>
        Borrow
      </button>
    </>
  )
}
```

Above, we chose to re-write the `me` query in the `cache`. To do this, we need to first read what the `CURRENT_USER` query in our `cache` is. Then we need to create a new object from `data.me` so that the `cache` knows it has been changed when we write it over. Then we set that `books` at the new `me` object to be a new array containing the previous books and the new borrowed book. Finally, we overwrite the `CURRENT_USER` query's `data` to the new `me` object.

One thing we didn't have to re-write or refetch is the `GET_BOOK` query for the book that was changed. The `isBooked` field for that book has been changed everywhere.

Awesome work!

## `ReturnBookButton`

Now, let's try returning a book. Check out the `returnBook` mutation and play around with it in Playground to see how it works.

In the same way as how we created a button to borrow a book, let's create a button to return it. There are a few things that are different from this than borrowing a book though. First, you need to know how the button will know if the current user has this booked checked out or not, and not another user. The boolean for `isBooked` does not specify which user actually checked it out. To do this, you need to query for the `CURRENT_USER` and find their books. Next, you iterate through the books to see if the book you are creating the return button for is included in the list of books. If it is, render the button. 

**Try to come up with this on your own. If you need help coming up with this, ask a question before looking below.**

```javascript
// src/components/books/ReturnBookButton.js
import React from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { RETURN_BOOK } from '../../graphql/mutations';
import { CURRENT_USER } from '../../graphql/queries';

function isBookedByUser(book, me) {
  if (me && me.books) {
    for (let i = 0; i < me.books.length; i++) {
      if (me.books[i]._id === book._id) return true;
    }
  }
  return false;
}

export default ({ book }) => {
  const { data, loading, error } = useQuery(CURRENT_USER);
  const [returnBook, { loading: mutationLoading, error: mutationError }] = useMutation(
    RETURN_BOOK,
    {
      variables: { bookId: book._id },
      onError() { },
      update(cache) {
        // can either write to the cache directly or refetchQueries
        const me = Object.assign({}, data.me);
        me.books = me.books.filter(userBook => userBook._id !== book._id);
        cache.writeQuery({ query: CURRENT_USER, data: { me } });
      },
      // refetchQueries: [{ query: CURRENT_USER }]
    }
  );

  if (loading || error || !data) return null;
  
  return (
    <>
      {mutationError && "An error occured while trying to borrow this book."}
      {isBookedByUser(book, data.me) && <button onClick={returnBook} disabled={mutationLoading} >
        Return
      </button>}
    </>
  )
}
```

After we return the book, we need to make sure the current user information on what books they borrowed are kept up to date, so we filter the returned book out from the current user's books.

## Creating a Book

Let's add a `CreateBookForm` to the `AuthorDetails` component, and only allow logged in users to see this form.

The `CreateBookForm` should take the `author`'s `_id` from the `AuthorDetails` component and create a book from that `author`. 

**Try to make the `CreateBookForm` component without using `useMutation` for now.**

Next, let's add a mutation to our server for creating a book, `createBook`. Make sure to return the `book` and the `author` details from this `mutation`.

Create a template literal for `CREATE_BOOK` in your `src/graphql/mutations.js` file in your client. In your `CreateBookForm` call this mutation when submitting a form. When the mutation is completed, you need to either refetch the `GET_BOOKS` query and the `GET_AUTHOR` query, OR update the cache. Discuss/Think about what the best approach is for this and do it.

Test out your component and make sure the created book gets added to the list of books on its author's `AuthorShow` page and the list of books on the `BookIndex` page.

## Deleting a Book

Let's add a delete button for a book on the `BookShow` page which only allows logged in users to delete a book.

First, you need to add a mutation to our server for deleting a book, `deleteBook`. 

Then, add a template literal for `DELETE_BOOK` in your `src/graphql/mutations.js` file in your client.

Create a `DeleteBookButton` that will call this mutation.

You also need to make sure the `BookIndex` page and the `AuthorShow` page don't display the book anymore.

## Fix on Authentication on the Client

To tell our server who the logged in user is in our server, our client needs to send the `token` in `localStorage` through the `authorization` `header` of the request. The way we did it before is not enough. 

Before testing and seeing why this is faulty, make sure you are logged out and you refreshed the page. Then head over to the Login page and log in the `demo` user. Then try going to the profile from the navigation bar. You should see an error message.

This is because the `token` in the `authorization` header is set initially to nothing when we first load our app. Then we login a user and expected the `authorization` header to reflect the new `token`, but it didnt'.

To make sure this doesn't happen and that we always have the correct `token` in our `authorization` header, we need to install another package called `apollo-link-context`. 

In our `src/graphql/client.js`, we are going to `import { setContext } from 'apollo-link-context'`, and create a new link, like so:

```javascript
// src/graphql/client.js before client definition
const authLink = setContext((_, { headers }) => {
  return {
    headers : {
      ...headers,
      authorization: localStorage.getItem('token')
    }
  };
});
```

This is setting the headers every time a request is made.

Then we are going to define the `client` like so:

```javascript
// src/graphql/client.js
const client = new ApolloClient({
  cache,
  link: ApolloLink.from([authLink.concat(errorLink), httpLink]),
  typeDefs,
  resolvers
});
```

With this, we don't need the `links` array created from before.

Try this new link! You should be able to log in and log out without worrying if you have the initial `token` in your headers.

If you want to know more about `auth-link-context`, check out the [auth-link-context Docs].

If you want to know more about middlewares, check out the [Network Middleware Docs].

## Admin-only Components

Let's create a component, `AdminComponent` that will render a component that can only be accessed by users who are administrators.

First, we need to include a boolean property, `isAdmin`, on a Mongoose `User` model that will be false by default, but when set to true will allow the user to become an admin. 

Include this property as a field in your GraphQL type definition for a `User` and include the field as a return in your `CURRENT_USER` query on your client. From there, you can make the `AdminComponent`, similar to how you created the `ProtectedComponent`.

Make the `CreateBookForm` and `DeleteBookButton` an `AdminComponent`.

## Bonus

Try to come up with more components and features to add, or do some CSS styling.

[auth-link-context Docs]: https://www.apollographql.com/docs/link/links/context/
[Network Middleware Docs]: https://www.apollographql.com/docs/react/networking/network-layer/#middleware