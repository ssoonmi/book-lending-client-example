import gql from 'graphql-tag';
import { BOOK_DATA, AUTHOR_DATA } from './fragments';

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
`;

export const GET_AUTHORS = gql`
  query GetAuthors {
    authors {
      ...AuthorData
    }
  }
  ${AUTHOR_DATA}
`;

export const GET_AUTHOR = gql`
  query GetAuthor($authorId: ID!) {
    author(_id: $authorId) {
      ...AuthorData
      books {
        _id
        title
      }
    }
  }
  ${AUTHOR_DATA}
`;