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