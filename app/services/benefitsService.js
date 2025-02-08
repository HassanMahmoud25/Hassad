import axiosInstance from '../configs/axios';

export const getBookBenefits = async token => {
  try {
    const benefits = await axiosInstance.get('/api/books/benefits/favourites', {
      headers: {Authorization: `Bearer ${token}`},
    });
    return benefits.data;
  } catch (error) {
    console.log('getBookBenefits ERROR ==> ', error);
  }
};
