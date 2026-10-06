import {useMemo} from 'react';
import {useQueries, useQuery} from '@tanstack/react-query';
import {getBookBenefits} from '../../apis/benefits.api';
import {getFavoriteBenefits} from '../../apis/favorites.api';
import {toApiError, ApiError} from '../../apis/errors';
import {Benefit, Book, Folder} from '../../apis/types';
import {queryKeys} from '../../queries/queryKeys';
import {findMatches, foldQuery} from '../../lib/search';
import {useBookcase} from '../library/useBookcase';
import {NEWEST} from '../notes/notes';

export interface Scope {
  bookId?: string;
  folderId?: string;
  selections?: boolean;
}

export interface NoteHit {
  note: Benefit;
  title: [number, number][];
  text: [number, number][];
}
export interface NoteGroup {
  book?: Book;
  bookId: string;
  hits: NoteHit[];
}
export interface BookHit {
  book: Book;
  title: [number, number][];
  author: [number, number][];
}
export interface ShelfHit {
  folder: Folder;
  books: number;
  name: [number, number][];
}

const MAX_NOTES = 120;

/**
 * There is no search route, so search runs on the device: books and shelves
 * from the loaded library, notes from each book's list (one request per book,
 * shared with the Book screen's cache), loaded when Search opens.
 */
export const useSearch = (rawQuery: string, scope: Scope) => {
  const bookcase = useBookcase();
  const settled = !bookcase.loading && bookcase.shelves.every(s => !s.loading);

  const scopedBooks = useMemo(() => {
    if (scope.bookId) {
      return bookcase.all.filter(b => b._id === scope.bookId);
    }
    if (scope.folderId) {
      return bookcase.shelves.find(s => s.folder._id === scope.folderId)?.books ?? [];
    }
    return bookcase.all;
  }, [bookcase.all, bookcase.shelves, scope.bookId, scope.folderId]);

  const withNotes = useMemo(() => (scope.selections ? [] : scopedBooks.filter(b => (b.num_of_benefits ?? 0) > 0)), [scopedBooks, scope.selections]);
  const noteQueries = useQueries({
    queries: withNotes.map(b => ({queryKey: queryKeys.benefits.list(b._id, NEWEST), queryFn: () => getBookBenefits(b._id, NEWEST)})),
  });
  const selections = useQuery({
    queryKey: queryKeys.favorites.list(NEWEST),
    // Always on (cached): the idle screen shows the selections count too.
    queryFn: () => getFavoriteBenefits(NEWEST),
  });

  const query = foldQuery(rawQuery);
  const byId = useMemo(() => new Map(bookcase.all.map(b => [b._id, b])), [bookcase.all]);

  const results = useMemo(() => {
    const notes: Benefit[] = scope.selections ? selections.data ?? [] : noteQueries.flatMap(q => q.data ?? []);
    if (!query) {
      return {groups: [] as NoteGroup[], books: [] as BookHit[], shelves: [] as ShelfHit[], noteCount: 0};
    }
    const groups = new Map<string, NoteGroup>();
    let noteCount = 0;
    for (const note of notes) {
      const title = findMatches(note.name, query);
      const text = findMatches(note.content ?? '', query);
      if (!title.length && !text.length) {
        continue;
      }
      noteCount++;
      if (noteCount > MAX_NOTES) {
        continue;
      }
      const g = groups.get(note.book) ?? {bookId: note.book, book: byId.get(note.book), hits: []};
      g.hits.push({note, title, text});
      groups.set(note.book, g);
    }
    // Books with the most matches first; within a book, page order.
    const sortedGroups = [...groups.values()]
      .map(g => ({...g, hits: g.hits.sort((a, b) => a.note.page_number - b.note.page_number)}))
      .sort((a, b) => b.hits.length - a.hits.length);

    const books: BookHit[] =
      scope.selections || scope.bookId
        ? []
        : scopedBooks
            .map(book => ({book, title: findMatches(book.name, query), author: findMatches(book.author ?? '', query)}))
            .filter(h => h.title.length || h.author.length);

    const shelves: ShelfHit[] =
      scope.selections || scope.bookId || scope.folderId
        ? []
        : bookcase.shelves
            .map(s => ({folder: s.folder, books: s.books.length, name: findMatches(s.folder.name, query)}))
            .filter(h => h.name.length);

    return {groups: sortedGroups, books, shelves, noteCount};
  }, [query, noteQueries, selections.data, scope.selections, scope.bookId, scope.folderId, scopedBooks, bookcase.shelves, byId]);

  const failed = noteQueries.filter(q => q.error).length;
  const firstError = noteQueries.find(q => q.error)?.error;
  return {
    ...results,
    query,
    /** Library still loading: nothing reliable to search yet. */
    loading: !settled || (!!scope.selections && selections.isPending),
    error: bookcase.error ?? (selections.error ? toApiError(selections.error) : undefined),
    indexed: noteQueries.filter(q => !q.isPending).length,
    toIndex: withNotes.length,
    failedBooks: failed,
    noteError: firstError ? (toApiError(firstError) as ApiError) : undefined,
    retryNotes: () => noteQueries.forEach(q => q.error && q.refetch()),
    recentBooks: [...bookcase.all].sort((a, b) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt)).slice(0, 8),
    scopeBook: scope.bookId ? byId.get(scope.bookId) : undefined,
    scopeShelf: scope.folderId ? bookcase.shelves.find(s => s.folder._id === scope.folderId)?.folder : undefined,
    selectionsCount: selections.data?.length,
  };
};
