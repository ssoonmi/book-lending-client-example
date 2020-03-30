import React from 'react';
import AuthorDetails from '../components/authors/AuthorDetails';
import NavBar from '../components/navbar/NavBar';

export default (props) => {
  const { authorId } = props.match.params;

  return (
    <>
      <NavBar />
      <h1>Author Show Page</h1>
      <AuthorDetails authorId={authorId} />
    </>
  )
}