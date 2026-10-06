import axiosInstance from './client';
import {Benefit, SortParams} from './types';

export const getBookBenefits = async (
  bookId: string,
  sort?: SortParams,
): Promise<Benefit[]> => {
  const res = await axiosInstance.get(`/api/books/${bookId}/benefits`, {
    params: sort,
  });
  return res.data;
};

export const getBenefit = async (
  bookId: string,
  id: string,
): Promise<Benefit> => {
  const res = await axiosInstance.get(`/api/books/${bookId}/benefits/${id}`);
  return res.data;
};

export const createBenefit = async (
  bookId: string,
  data: FormData,
): Promise<Benefit> => {
  const res = await axiosInstance.post(
    `/api/books/${bookId}/benefits`,
    data,
    {headers: {'Content-Type': 'multipart/form-data'}},
  );
  return res.data;
};

export const updateBenefit = async (
  bookId: string,
  id: string,
  data: FormData,
): Promise<Benefit> => {
  const res = await axiosInstance.put(
    `/api/books/${bookId}/benefits/${id}`,
    data,
    {headers: {'Content-Type': 'multipart/form-data'}},
  );
  return res.data;
};

export const deleteBenefit = async (bookId: string, benefitId: string) => {
  await axiosInstance.delete(`/api/books/${bookId}/benefits/${benefitId}`);
};

export const favouriteBenefit = async (bookId: string, id: string) => {
  await axiosInstance.put(`/api/books/${bookId}/benefits/${id}/favourite`);
};

export const unfavouriteBenefit = async (bookId: string, id: string) => {
  await axiosInstance.put(`/api/books/${bookId}/benefits/${id}/unfavourite`);
};
