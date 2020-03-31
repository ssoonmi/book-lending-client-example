import gql from 'graphql-tag';

export const LOGIN_USER = gql`
  mutation LogIn($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      _id
      username
      token
      loggedIn
    }
  }
`;

export const SIGNUP_USER = gql`
  mutation SignUp($username: String!, $password: String!) {
    signup(username: $username, password: $password) {
      _id
      username
      token
      loggedIn
    }
  }
`;