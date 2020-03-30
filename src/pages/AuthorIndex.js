import React from 'react';
import AuthorList from '../components/authors/AuthorList';
import NavBar from '../components/navbar/NavBar';

export default () => {
  return (
    <>
      <NavBar />
      <h1>Author Index Page</h1>
      <AuthorList />
    </>
  );
};