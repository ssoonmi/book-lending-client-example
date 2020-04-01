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