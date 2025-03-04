import axiosInstance from '../configs/axios';

export const getFavoriteBenefits = async token => {
  try {
    const favorites = await axiosInstance.get(
      '/api/books/benefits/favourites',
      {
        headers: {Authorization: `Bearer ${token}`},
      },
    );
    return favorites.data;
  } catch (error) {
    console.log('getFavoriteBenefits ERROR ==> ', error);
  }
};
