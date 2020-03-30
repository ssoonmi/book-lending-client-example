import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';

const GET_BOOKS = gql`
  query GetBooks {
    books {
      _id
      title
      author {
        _id
        name
      }
    }
  }
`;

export default () => {
  const { data, loading, error } = useQuery(GET_BOOKS);

  if (loading) return <p>Loading</p>;
  if (error) return <p>ERROR</p>;
  if (!data) return <p>Not found</p>;

  return (
    <ul>
      {data.books && data.books.map(book => (
        <li key={book._id}>
          <Link to={`/books/${book._id}`}>
            {book.title} by: {book.author.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};