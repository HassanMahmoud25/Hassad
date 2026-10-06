import {useMemo} from 'react';
import {QueryClient, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createBenefit, deleteBenefit, favouriteBenefit, getBookBenefits, unfavouriteBenefit, updateBenefit} from '../../apis/benefits.api';
import {toApiError} from '../../apis/errors';
import {Benefit} from '../../apis/types';
import {queryKeys} from '../../queries/queryKeys';
import {toWesternDigits} from '../../lib/text';
import {NoteColor} from '../../theme/tokens';
import {useBookcase} from '../library/useBookcase';

export const NEWEST = {sortBy: 'date', sortDirection: 'desc'} as const;

const byPage = (a: Benefit, b: Benefit) => a.page_number - b.page_number || a.createdAt.localeCompare(b.createdAt);

/**
 * One note, read from its book's list (the backend has a single-note route,
 * but the list gives position and "next" for free and is shared with the
 * Book screen's cache).
 */
export const useNote = (bookId: string, noteId: string, initial?: Benefit) => {
  const bookcase = useBookcase();
  const list = useQuery({queryKey: queryKeys.benefits.list(bookId, NEWEST), queryFn: () => getBookBenefits(bookId, NEWEST)});
  const ordered = useMemo(() => [...(list.data ?? [])].sort(byPage), [list.data]);
  const index = ordered.findIndex(n => n._id === noteId);
  const note = index >= 0 ? ordered[index] : list.data ? undefined : initial;
  return {
    note,
    book: bookcase.all.find(b => b._id === bookId),
    /** 1-based position in page order, and the total. */
    position: index >= 0 ? {at: index + 1, of: ordered.length} : undefined,
    next: index >= 0 ? ordered[index + 1] : undefined,
    loading: list.isPending && !initial,
    /** The list loaded and this note isn't in it: deleted elsewhere. */
    missing: !!list.data && index < 0,
    error: list.error ? toApiError(list.error) : undefined,
    refetch: list.refetch,
  };
};

/** Applies a change to this note everywhere it is cached. */
const patchCaches = (qc: QueryClient, bookId: string, noteId: string, patch: (n: Benefit) => Benefit | null) => {
  const apply = (data: Benefit[] | undefined) =>
    data?.flatMap(n => {
      if (n._id !== noteId) {
        return [n];
      }
      const next = patch(n);
      return next ? [next] : [];
    });
  qc.setQueriesData<Benefit[]>({queryKey: ['benefits', 'book', bookId]}, apply);
  qc.setQueriesData<Benefit[]>({queryKey: queryKeys.favorites.all}, apply);
};

const refreshAround = (qc: QueryClient, bookId: string) => {
  qc.invalidateQueries({queryKey: ['benefits', 'book', bookId]});
  qc.invalidateQueries({queryKey: queryKeys.favorites.all});
  // num_of_benefits changes on the book (shelved books live under folders).
  qc.invalidateQueries({queryKey: queryKeys.books.all});
  qc.invalidateQueries({queryKey: queryKeys.folders.all});
};

/** «مختاراتي»: star or unstar a note, shown at once and rolled back on failure. */
export const useToggleSelection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({note, select}: {note: Benefit; select: boolean}) =>
      select ? favouriteBenefit(note.book, note._id) : unfavouriteBenefit(note.book, note._id),
    onMutate: ({note, select}) => {
      patchCaches(qc, note.book, note._id, n => ({...n, favourated: select}));
      if (select) {
        // Make it appear in «مختاراتي» right away, newest first.
        qc.setQueriesData<Benefit[]>({queryKey: queryKeys.favorites.all}, (data: Benefit[] | undefined) =>
          data && !data.some((n: Benefit) => n._id === note._id) ? [{...note, favourated: true}, ...data] : data,
        );
      } else {
        qc.setQueriesData<Benefit[]>({queryKey: queryKeys.favorites.all}, (data: Benefit[] | undefined) => data?.filter((n: Benefit) => n._id !== note._id));
      }
    },
    onError: (_e, {note}) => refreshAround(qc, note.book),
    onSettled: (_d, _e, {note}) => {
      qc.invalidateQueries({queryKey: queryKeys.favorites.all});
      qc.invalidateQueries({queryKey: ['benefits', 'book', note.book]});
    },
  });
};

export const useDeleteNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (note: Benefit) => deleteBenefit(note.book, note._id),
    onSuccess: (_d, note) => {
      patchCaches(qc, note.book, note._id, () => null);
      refreshAround(qc, note.book);
    },
  });
};

export interface NoteDraft {
  title: string;
  /** As typed: Arabic-Indic digits are accepted and converted. */
  page: string;
  text: string;
  color: NoteColor;
}

/** The backend validates page_number with isInt(). */
export const parsePage = (raw: string): number | null => {
  const v = toWesternDigits(raw.trim());
  return /^\d{1,6}$/.test(v) ? parseInt(v, 10) : null;
};

/**
 * Create or update a note. On update only changed fields are sent; the
 * backend ignores empty values, so text can't be cleared once saved — the
 * editor says so rather than pretending.
 */
export const useSaveNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({bookId, draft, original}: {bookId: string; draft: NoteDraft; original?: Benefit}): Promise<Benefit> => {
      const page = parsePage(draft.page);
      const data = new FormData();
      if (!original || draft.title.trim() !== original.name) {
        data.append('name', draft.title.trim());
      }
      if (!original || page !== original.page_number) {
        data.append('page_number', String(page));
      }
      if (draft.text.trim() && (!original || draft.text.trim() !== (original.content ?? ''))) {
        data.append('content', draft.text.trim());
      }
      if (!original || draft.color !== original.color?.toUpperCase()) {
        data.append('color', draft.color);
      }
      return original ? updateBenefit(bookId, original._id, data) : createBenefit(bookId, data);
    },
    onSuccess: (saved, {bookId}) => {
      patchCaches(qc, bookId, saved._id, () => saved);
      refreshAround(qc, bookId);
    },
  });
};
