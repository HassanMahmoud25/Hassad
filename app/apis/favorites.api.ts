import axiosInstance from './client';
import {Benefit, SortParams} from './types';

export const getFavoriteBenefits = async (
  sort?: SortParams,
): Promise<Benefit[]> => {
  const res = await axiosInstance.get('/api/books/benefits/favourites', {
    params: sort,
  });
  return res.data;
};
