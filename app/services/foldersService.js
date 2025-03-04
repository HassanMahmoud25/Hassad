import axiosInstance from '../configs/axios';

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
