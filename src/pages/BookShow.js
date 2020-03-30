import React from 'react';
import BookDetails from '../components/books/BookDetails';
import NavBar from '../components/navbar/NavBar';

export default (props) => {
  const { bookId } = props.match.params;

  return (
    <>
      <NavBar />
      <h1>Book Show Page</h1>
      <BookDetails bookId={bookId} />
    </>
  )
}