import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import BookIndex from './pages/BookIndex';

export default () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" component={BookIndex} />
      </Switch>
    </BrowserRouter>
  );
};