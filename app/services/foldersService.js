import axiosInstance from '../configs/axios';

export const getFolders = async () => {
  try {
    const folders = await axiosInstance.get('/api/folders');
    return folders.data;
  } catch (error) {
    console.log('getFolders ERROR ==> ', error);
  }
};

export const getFolderBooks = async id => {
  try {
    const folderBooks = await axiosInstance.get(`/api/folders/${id}/books`);
    return folderBooks.data;
  } catch (err) {
    console.log('getFolderBooks ERROR ===> ', err);
  }
};

export const addBookToFolder = async (bookFormData, folderId) => {
  try {
    const response = await axiosInstance.post(
      `/api/folders/${folderId}/books`,
      bookFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    console.log('Upload success:', response.data);
  } catch (err) {
    console.log('addBookToFolder ERROR ===> ', err);
  }
};
