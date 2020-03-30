import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { GET_AUTHOR } from '../../graphql/queries';
import { Link } from 'react-router-dom';

export default ({ authorId }) => {
  const { data, loading, error } = useQuery(
    GET_AUTHOR,
    {
      variables: {
        authorId
      }
    }
  );

  if (loading) return <p>Loading</p>;
  if (error) return <p>ERROR</p>;
  if (!data) return <p>Not found</p>;
  if (!data.author) return <p>Author Not Found</p>;

  const author = data.author;

  return (
    <>
      <h2>{author.name}</h2>
      <h3>Books</h3>
      <ul>
        {data.author.books && data.author.books.map(book => (
          <li key={book._id}>
            <Link to={`/books/${book._id}`}>
              {book.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
};