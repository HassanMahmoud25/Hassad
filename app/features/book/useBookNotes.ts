import {useQuery} from '@tanstack/react-query';
import {getBookBenefits} from '../../apis/benefits.api';
import {toApiError} from '../../apis/errors';
import {queryKeys} from '../../queries/queryKeys';

const NEWEST = {sortBy: 'date', sortDirection: 'desc'} as const;

export const useBookNotes = (bookId: string) => {
  const q = useQuery({queryKey: queryKeys.benefits.list(bookId, NEWEST), queryFn: () => getBookBenefits(bookId, NEWEST)});
  return {...q, apiError: q.error ? toApiError(q.error) : undefined};
};
