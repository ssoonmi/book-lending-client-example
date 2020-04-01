import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { DELETE_BOOK } from '../../graphql/mutations'
import { GET_BOOKS, GET_AUTHOR } from '../../graphql/queries';
import { useHistory } from 'react-router-dom';

export default ({ book }) => {
  const history = useHistory()
  const [deleteBook, { loading, error }] = useMutation(
    DELETE_BOOK,
    {
      variables: { bookId: book._id },
      onError() {},
      update(cache, { data: { deleteBook } }) {
        if (!deleteBook || !deleteBook.success) return;
        try {
          const booksData = cache.readQuery({ query: GET_BOOKS });
          if (booksData) {
            const books = booksData.books.filter(book => book._id !== deleteBook._id);
            cache.writeQuery({ query: GET_BOOKS, data: { books } });
          }
        } catch(e) {}
        try {
          const authorId = book.author._id
          const authorData = cache.readQuery({ query: GET_AUTHOR, variables: { authorId }});
          if (authorData) {
            const author = Object.assign({}, authorData.author);
            author.books = author.books.filter(book => book._id !== deleteBook._id);
            cache.writeQuery({ query: GET_AUTHOR, variables: { authorId }, data: { author } });
          }
        } catch(e) {}
        history.push('/');
      }
    }
  );

  return (
    <button onClick={deleteBook} disabled={loading} >
      Delete Book
    </button>
  );
};