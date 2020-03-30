import gql from 'graphql-tag';
import { BOOK_DATA } from './fragments';

export const GET_BOOKS = gql`
  query GetBooks {
    books {
      ...BookData
    }
  }
  ${BOOK_DATA}
`;

export const GET_BOOK = gql`
  query GetBook($bookId: ID!) {
    book(_id: $bookId) {
      ...BookData
      isBooked
    }
  }
  ${BOOK_DATA}
`