import axiosInstance from '../configs/axios';

export const getFavoriteBenefits = async () => {
  try {
    const favorites = await axiosInstance.get('/api/books/benefits/favourites');
    return favorites.data;
  } catch (error) {
    console.log('getFavoriteBenefits ERROR ==> ', error);
  }
};
