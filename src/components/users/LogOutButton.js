import React from 'react';
import { useApolloClient } from '@apollo/react-hooks';

export default () => {
  const client = useApolloClient();
  return (
    <button onClick={() => {
      client.resetStore();
    }}>
      Log Out
    </button>
  )
};