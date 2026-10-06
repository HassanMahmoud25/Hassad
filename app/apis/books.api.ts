import axiosInstance from './client';
import {Book, SortParams} from './types';

export const getBooks = async (sort?: SortParams): Promise<Book[]> => {
  const res = await axiosInstance.get('/api/books', {params: sort});
  return res.data;
};

export const addBook = async (data: FormData): Promise<Book> => {
  const res = await axiosInstance.post('/api/books', data, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
  return res.data;
};

/** A shelved book can only be updated or deleted through its folder's
 * route; the plain route rejects it with "Folder ID not provided". */
export const bookPath = (id: string, folderId?: string | null) =>
  folderId ? `/api/folders/${folderId}/books/${id}` : `/api/books/${id}`;

export interface BookUpdate {
  name?: string;
  /** The backend ignores an empty author, so an author cannot be cleared. */
  author?: string;
  /** JPEG or PNG, at most 5 MB. There is no way to remove a cover. */
  image?: {uri: string; type: string; name: string};
}

export const updateBook = async (id: string, folderId: string | null | undefined, update: BookUpdate): Promise<Book> => {
  const formData = new FormData();
  if (update.name) {
    formData.append('name', update.name);
  }
  if (update.author) {
    formData.append('author', update.author);
  }
  if (update.image) {
    formData.append('image', update.image as unknown as Blob);
  }
  const res = await axiosInstance.put(bookPath(id, folderId), formData, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
  return res.data;
};

export const renameBook = async (id: string, name: string, folderId?: string | null): Promise<Book> => {
  const formData = new FormData();
  formData.append('name', name);
  const res = await axiosInstance.put(bookPath(id, folderId), formData, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
  return res.data;
};

export const deleteBook = async (id: string, folderId?: string | null): Promise<void> => {
  await axiosInstance.delete(bookPath(id, folderId));
};
