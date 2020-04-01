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
        me.books = me.books.concat(me.books, [books[0]]);
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

------------------- IN PROGRESS (LET ME KNOW IF YOU REACH THIS POINT) --------------------------