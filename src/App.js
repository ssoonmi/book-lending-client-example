import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import BookIndex from './pages/BookIndex';
import BookShow from './pages/BookShow';
import AuthorShow from './pages/AuthorShow';
import AuthorIndex from './pages/AuthorIndex';
import ErrorPage from './pages/ErrorPage';
import UserProfile from './pages/UserProfile';
import ProtectedRoute from './components/util/ProtectedRoute';
import AuthRoute from './components/util/AuthRoute';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';

export default () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/authors/:authorId" component={AuthorShow} />
        <Route path="/authors" component={AuthorIndex} />
        <Route path="/books/:bookId" component={BookShow} />
        <ProtectedRoute path="/me" component={UserProfile} />
        <AuthRoute path="/login" component={LogIn} />
        <AuthRoute path="/signup" component={SignUp} />
        <Route exact path="/" component={BookIndex} />
        <Route path="/" component={ErrorPage} />
      </Switch>
    </BrowserRouter>
  );
};