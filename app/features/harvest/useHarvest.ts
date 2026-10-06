import {useMemo} from 'react';
import {useQueries, useQuery} from '@tanstack/react-query';
import {getBookBenefits} from '../../apis/benefits.api';
import {getFavoriteBenefits} from '../../apis/favorites.api';
import {toApiError, ApiError} from '../../apis/errors';
import {Benefit, Book} from '../../apis/types';
import {queryKeys} from '../../queries/queryKeys';
import {useBookcase} from '../library/useBookcase';

export interface NoteWithBook {
  note: Benefit;
  book?: Book;
}

export interface Harvest {
  /** First load of the library itself. */
  loading: boolean;
  error?: ApiError;
  refreshing: boolean;
  refresh: () => Promise<void>;
  books: Book[];
  /** The book holding the newest note, or — with no notes yet — the newest book. */
  lastBook?: Book;
  lastNote?: Benefit;
  /** Newest notes across the library, newest first. */
  recent: NoteWithBook[];
  recentLoading: boolean;
  recentError?: ApiError;
  /** Books in order of recent activity, the panel's book excluded. */
  shelfBooks: Book[];
  selections: NoteWithBook[];
  selectionsLoading: boolean;
}

// The backend has no cross-book "recent notes" route. Adding or removing a
// note bumps its book's updatedAt, so the newest notes live in the most
// recently updated books: load those few books' notes and merge by date.
const SOURCE_BOOKS = 4;
const RECENT = 3;
const NEWEST = {sortBy: 'date', sortDirection: 'desc'} as const;

const byUpdated = (a: Book, b: Book) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt);

export const useHarvest = (): Harvest => {
  const bookcase = useBookcase();
  const books = bookcase.all;
  const byId = useMemo(() => new Map(books.map(b => [b._id, b])), [books]);

  const sources = useMemo(() => books.filter(b => (b.num_of_benefits ?? 0) > 0).sort(byUpdated).slice(0, SOURCE_BOOKS), [books]);
  const noteQueries = useQueries({
    queries: sources.map(b => ({
      // Same key as the Book screen, so opening a book is instant.
      queryKey: queryKeys.benefits.list(b._id, NEWEST),
      queryFn: () => getBookBenefits(b._id, NEWEST),
    })),
  });
  const selectionsQuery = useQuery({queryKey: queryKeys.favorites.list(NEWEST), queryFn: () => getFavoriteBenefits(NEWEST)});

  const recentAll = useMemo<NoteWithBook[]>(
    () =>
      noteQueries
        .flatMap(q => q.data ?? [])
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(note => ({note, book: byId.get(note.book)})),
    [noteQueries, byId],
  );

  const lastNote = recentAll[0]?.note;
  const lastBook = useMemo(() => {
    if (lastNote) {
      return byId.get(lastNote.book);
    }
    // No notes anywhere yet: invite the first one from the newest book.
    return [...books].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  }, [lastNote, byId, books]);

  const shelfBooks = useMemo(() => [...books].sort(byUpdated).filter(b => b._id !== lastBook?._id).slice(0, 8), [books, lastBook]);

  const selections = useMemo<NoteWithBook[]>(
    () => (selectionsQuery.data ?? []).map(note => ({note, book: byId.get(note.book)})),
    [selectionsQuery.data, byId],
  );

  const recentFailed = noteQueries.find(q => q.error)?.error;
  // Home needs every book (shelved ones arrive per shelf) and, when any book
  // has notes, the notes themselves: until then "no notes" would be a guess.
  const booksSettled = !bookcase.loading && bookcase.shelves.every(s => !s.loading);
  const notesSettled = noteQueries.every(q => !q.isPending);
  return {
    loading: !booksSettled || (sources.length > 0 && !notesSettled && recentAll.length === 0),
    error: bookcase.error,
    refreshing: bookcase.refreshing,
    refresh: async () => {
      await Promise.all([bookcase.refresh(), selectionsQuery.refetch(), ...noteQueries.map(q => q.refetch())]);
    },
    books,
    lastBook,
    lastNote,
    recent: recentAll.slice(0, RECENT),
    recentLoading: noteQueries.some(q => q.isPending),
    recentError: recentFailed ? toApiError(recentFailed) : undefined,
    shelfBooks,
    selections,
    selectionsLoading: selectionsQuery.isPending,
  };
};

/** One selection per calendar day, the same all day, cycling through all of them. */
export const selectionOfTheDay = <T,>(items: T[], now = new Date()): T | undefined => {
  if (items.length === 0) {
    return undefined;
  }
  const day = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86400000);
  return items[day % items.length];
};
