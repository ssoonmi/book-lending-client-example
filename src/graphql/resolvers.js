import gql from 'graphql-tag';
import { IS_LOGGED_IN, CURRENT_USER } from './queries';

export const typeDefs = gql`
  extend type Query {
    isLoggedIn: Boolean!
  }
`;

export const resolvers = {
  // for data that only exists in the frontend
  Query: {
    isLoggedIn: () => {
      console.log('isLoggedIn resolver called', localStorage.getItem('token'));
      return !!localStorage.getItem("token");
    }
  }
};