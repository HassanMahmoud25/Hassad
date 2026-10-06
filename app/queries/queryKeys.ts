import {SortParams} from '../apis/types';

// Central query-key factory. Every screen/hook should build its keys from
// here rather than typing array literals, so invalidation targets stay in
// sync as resources grow.
export const queryKeys = {
  books: {
    all: ['books'] as const,
    list: (sort?: SortParams) => ['books', 'list', sort ?? {}] as const,
  },
  folders: {
    all: ['folders'] as const,
    list: (sort?: SortParams) => ['folders', 'list', sort ?? {}] as const,
    books: (folderId: string, sort?: SortParams) =>
      ['folders', folderId, 'books', sort ?? {}] as const,
  },
  benefits: {
    all: ['benefits'] as const,
    list: (bookId: string, sort?: SortParams) =>
      ['benefits', 'book', bookId, 'list', sort ?? {}] as const,
    detail: (bookId: string, benefitId: string) =>
      ['benefits', 'book', bookId, 'detail', benefitId] as const,
  },
  favorites: {
    all: ['favorites'] as const,
    list: (sort?: SortParams) => ['favorites', 'list', sort ?? {}] as const,
  },
};

export default queryKeys;
