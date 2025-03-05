import axios from 'axios';
import axiosInstance from '../configs/axios';
import {BASE_API_URL} from '@env';

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

export const addBook = async (bookFormData, token) => {
  try {
    const response = await axios.post(
      `${BASE_API_URL}/api/books`,
      bookFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log('Upload success:', response.data);
  } catch (err) {
    console.log('addBook ERROR ===> ', err);
  }
};

export const addFolder = async (folderFormData, token) => {
  try {
    const response = await axios.post(
      `${BASE_API_URL}/api/folders`,
      folderFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log('Upload success:', response.data);
  } catch (err) {
    console.log('addBook ERROR ===> ', err);
  }
};
