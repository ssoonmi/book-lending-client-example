import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import BookIndex from './pages/BookIndex';
import BookShow from './pages/BookShow';

export default () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/books/:bookId" component={BookShow} />
        <Route exact path="/" component={BookIndex} />
      </Switch>
    </BrowserRouter>
  );
};