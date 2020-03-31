import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import BookIndex from './pages/BookIndex';
import BookShow from './pages/BookShow';
import AuthorShow from './pages/AuthorShow';
import AuthorIndex from './pages/AuthorIndex';
import ErrorPage from './pages/ErrorPage';

export default () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/authors/:authorId" component={AuthorShow} />
        <Route path="/authors" component={AuthorIndex} />
        <Route path="/books/:bookId" component={BookShow} />
        <Route exact path="/" component={BookIndex} />
        <Route path="/" component={ErrorPage} />
      </Switch>
    </BrowserRouter>
  );
};