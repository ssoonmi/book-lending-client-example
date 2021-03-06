import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { Link } from 'react-router-dom';
import { CURRENT_USER } from '../../graphql/queries';
import ReturnBookButton from '../books/ReturnBookButton';

export default () => {
  const { data, loading, error } = useQuery(
    CURRENT_USER,
    {
      fetchPolicy: 'network-only'
    }
  );

  if (loading) return <p>Loading</p>;
  if (error) return <p>ERROR</p>;
  if (!data) return <p>Not found</p>;

  return (
    <>
      <h1>Hello {data.me.username}!</h1>
      <h2>List of Borrowed Books</h2>
      <ul>
        {data.me.books && data.me.books.map(book => {
          return (
            <li key={book._id}>
              <Link to={`/books/${book._id}`}>
                {book.title}
              </Link>
              <ReturnBookButton book={book}/>
            </li>
          );
        })}
      </ul>
    </>
  );
}