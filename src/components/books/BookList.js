import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { Link } from 'react-router-dom';
import { GET_BOOKS } from '../../graphql/queries';

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
            {book.title}
          </Link>
          by:
          <Link to ={`/authors/${book.author._id}`}>
            {book.author.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};