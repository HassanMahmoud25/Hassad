import {useCallback, useMemo} from 'react';
import {useQueries, useQuery, useQueryClient} from '@tanstack/react-query';
import {getBooks} from '../../apis/books.api';
import {getFolderBooks, getFolders} from '../../apis/folders.api';
import {Book, Folder} from '../../apis/types';
import {toApiError, ApiError} from '../../apis/errors';
import {queryKeys} from '../../queries/queryKeys';

export interface ShelfWithBooks {
  folder: Folder;
  books: Book[];
  loading: boolean;
  error?: ApiError;
}

export interface Bookcase {
  shelves: ShelfWithBooks[];
  /** Books not on any shelf — the only books `GET /api/books` returns. */
  loose: Book[];
  /** Every book the reader owns: loose plus each shelf's. */
  all: Book[];
  totals: {books: number; shelves: number; notes: number};
  /** First load, nothing to show yet. */
  loading: boolean;
  /** Folders or loose books failed; per-shelf errors live on the shelf. */
  error?: ApiError;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

const NEWEST = {sortBy: 'date', sortDirection: 'desc'} as const;
const OLDEST = {sortBy: 'date', sortDirection: 'asc'} as const;

/**
 * The library is the union of `GET /api/books` (unshelved) and
 * `GET /api/folders/:id/books` for every folder. The backend has no single
 * "all my books" route, so this costs 2 + N requests (N = shelves).
 */
export const useBookcase = (): Bookcase => {
  const queryClient = useQueryClient();
  // Shelves stand in the order they were made, so the bookcase grows downward.
  const folders = useQuery({queryKey: queryKeys.folders.list(OLDEST), queryFn: () => getFolders(OLDEST)});
  const loose = useQuery({queryKey: queryKeys.books.list(NEWEST), queryFn: () => getBooks(NEWEST)});
  const shelfQueries = useQueries({
    queries: (folders.data ?? []).map(f => ({
      queryKey: queryKeys.folders.books(f._id, NEWEST),
      queryFn: () => getFolderBooks(f._id, NEWEST),
    })),
  });

  const shelves = useMemo<ShelfWithBooks[]>(
    () =>
      (folders.data ?? []).map((folder, i) => {
        const q = shelfQueries[i];
        return {folder, books: q?.data ?? [], loading: !!q?.isPending, error: q?.error ? toApiError(q.error) : undefined};
      }),
    [folders.data, shelfQueries],
  );

  const looseBooks = useMemo(() => loose.data ?? [], [loose.data]);
  const all = useMemo(() => {
    const books = [...looseBooks, ...shelves.flatMap(s => s.books)];
    return books.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }, [looseBooks, shelves]);

  const totals = useMemo(
    () => ({
      books: looseBooks.length + shelves.reduce((n, s) => n + (s.books.length || s.folder.num_of_books || 0), 0),
      shelves: shelves.length,
      notes: all.reduce((n, b) => n + (b.num_of_benefits ?? 0), 0),
    }),
    [looseBooks, shelves, all],
  );

  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({queryKey: queryKeys.folders.all}),
      queryClient.invalidateQueries({queryKey: queryKeys.books.all}),
    ]);
  }, [queryClient]);

  const firstError = folders.error ?? loose.error;
  return {
    shelves,
    loose: looseBooks,
    all,
    totals,
    loading: folders.isPending || loose.isPending,
    error: firstError ? toApiError(firstError) : undefined,
    refreshing: (folders.isRefetching || loose.isRefetching) && !folders.isPending,
    refresh,
  };
};
