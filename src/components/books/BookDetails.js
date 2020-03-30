import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { GET_BOOK } from '../../graphql/queries';

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