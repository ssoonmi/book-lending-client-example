import React from 'react';
import BookDetails from '../components/books/BookDetails';

export default (props) => {
  const { bookId } = props.match.params;

  return (
    <>
      <h1>Book Show Page</h1>
      <BookDetails bookId={bookId} />
    </>
  )
}