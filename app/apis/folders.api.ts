import axiosInstance from './client';
import {Book, Folder, SortParams} from './types';

export const getFolders = async (sort?: SortParams): Promise<Folder[]> => {
  const res = await axiosInstance.get('/api/folders', {params: sort});
  return res.data;
};

export const getFolderBooks = async (id: string, sort?: SortParams): Promise<Book[]> => {
  const res = await axiosInstance.get(`/api/folders/${id}/books`, {
    params: sort,
  });
  return res.data;
};

export const createFolder = async (
  data: FormData,
): Promise<Folder> => {
  const res = await axiosInstance.post('/api/folders', data, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
  return res.data;
};

export const renameFolder = async (id: string, name: string): Promise<Folder> => {
  const formData = new FormData();
  formData.append('name', name);
  const res = await axiosInstance.put(`/api/folders/${id}`, formData, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
  return res.data;
};

/** Deletes the shelf AND every book on it, with all their notes (backend
 * cascade). There is no keep-the-books option yet — the UI must say so. */
export const deleteFolder = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/folders/${id}`);
};

export const addBookToFolder = async (
  folderId: string,
  data: FormData,
) => {
  const res = await axiosInstance.post(
    `/api/folders/${folderId}/books`,
    data,
    {headers: {'Content-Type': 'multipart/form-data'}},
  );
  return res.data;
};
