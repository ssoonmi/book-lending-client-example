import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { GET_BOOK } from '../../graphql/queries';
import { Link } from 'react-router-dom';

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
      <p>By: <Link to={`/authors/${book.author._id}`}>{book.author.name}</Link></p>
      {book.isBooked ? (
        <p>Already Checked Out</p>
      ) : (
          <p>Not Checked Out</p>
        )}
    </>
  )
};