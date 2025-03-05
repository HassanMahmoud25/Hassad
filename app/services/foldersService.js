import axios from 'axios';
import axiosInstance from '../configs/axios';
import {BASE_API_URL} from '@env';

export const getFolders = async token => {
  try {
    const folders = await axiosInstance.get('/api/folders', {
      headers: {Authorization: `Bearer ${token}`},
    });
    return folders.data;
  } catch (error) {
    console.log('getFolders ERROR ==> ', error);
  }
};

export const getFolderBooks = async (id, token) => {
  try {
    const folderBooks = await axiosInstance.get(`/api/folders/${id}/books`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    return folderBooks.data;
  } catch (err) {
    console.log('getFolderBooks ERROR ===> ', err);
  }
};

export const addBookToFolder = async (bookFormData, folderId, token) => {
  try {
    const response = await axios.post(
      `${BASE_API_URL}/api/folders/${folderId}/books`,
      bookFormData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    console.log('Upload success:', response.data);
  } catch (err) {
    console.log('addBookToFolder ERROR ===> ', err);
  }
};
