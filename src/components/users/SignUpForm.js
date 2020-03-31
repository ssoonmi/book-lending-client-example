import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { SIGNUP_USER } from '../../graphql/mutations';
import { IS_LOGGED_IN, CURRENT_USER } from '../../graphql/queries';

export default () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [signup, { loading, error }] = useMutation(
    SIGNUP_USER,
    {
      variables: {
        username,
        password
      },
      update(cache, { data: { signup } }) {
        if (!signup) setErrorMessage('Invalid Credentials');
        else {
          // we can either write to the cache directly or refetch the IS_LOGGED_IN query so other components will update properly
          // cache.writeData({ data: { isLoggedIn: signup.loggedIn }});
          localStorage.setItem('token', signup.token);
        }
      },
      onError() {
        setErrorMessage('Something went wrong');
      },
      refetchQueries: [{ query: IS_LOGGED_IN }, { query: CURRENT_USER }]
    }
  );

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      signup();
    }}>
      {errorMessage}
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input type="submit" value="Sign Up" disabled={loading} />
    </form>
  );
};