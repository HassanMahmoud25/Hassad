import axiosInstance from '../configs/axios';

export const getBooks = async token => {
  try {
    const books = await axiosInstance.get('/api/books', {
      headers: {Authorization: `Bearer ${token}`},
    });
    return books.data;
  } catch (error) {
    console.log('getBooks ERROR ==> ', error);
  }
};
