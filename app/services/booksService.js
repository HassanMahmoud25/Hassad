import axiosInstance from '../configs/axios';

export const getBooks = async () => {
  try {
    const books = await axiosInstance.get('/api/books');
    return books.data;
  } catch (error) {
    console.log('getBooks ERROR ==> ', error);
  }
};

export const addBook = async bookFormData => {
  try {
    const response = await axiosInstance.post('/api/books', bookFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Upload success:', response.data);
  } catch (err) {
    console.log('addBook ERROR ===> ', err);
  }
};

export const addFolder = async folderFormData => {
  try {
    const response = await axiosInstance.post('api/folders', folderFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Upload success:', response.data);
  } catch (err) {
    console.log('addBook ERROR ===> ', err);
  }
};
