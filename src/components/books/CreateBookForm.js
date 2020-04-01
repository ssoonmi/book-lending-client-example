import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { CREATE_BOOK } from '../../graphql/mutations';
import { GET_BOOKS, GET_AUTHOR } from '../../graphql/queries';

export default ({ authorId }) => {
  const [title, setTitle] = useState('');
  const [createBook, { loading, error }] = useMutation(
    CREATE_BOOK,
    {
      variables: {
        title,
        authorId
      },
      update(cache, { data: { createBook } }) {
        const booksData = cache.readQuery({ query: GET_BOOKS });
        if (booksData) {
          const books = booksData.books.concat([createBook]);
          cache.writeQuery({ query: GET_BOOKS, data: { books } });
        }
        const authorData = cache.readQuery({ query: GET_AUTHOR, variables: { authorId } });
        if (authorData) {
          const author = Object.assign({}, authorData.author);
          author.books = author.books.concat([createBook]);
          cache.writeQuery({ query: GET_AUTHOR, variables: { authorId }, data: { author }})
        }
      },
      onError() {}
    }
  );

  return (
    <form onSubmit={createBook}>
      <h3>Create a Book for this Author</h3>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)}/>
      <input type="submit" value="Create Book" />
    </form>
  )


}