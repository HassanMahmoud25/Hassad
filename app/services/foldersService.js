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
