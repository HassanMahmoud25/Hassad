import axiosInstance from '../configs/axios';

export const getBookBenefits = async (id, token) => {
  try {
    const benefits = await axiosInstance.get(`/api/books/${id}/benefits`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    return benefits.data;
  } catch (error) {
    console.log('getBookBenefits ERROR ==> ', error);
  }
};

export const deleteBenefit = async (bookId, benefitId, token) => {
  try {
    await axiosInstance.delete(`/api/books/${bookId}/benefits/${benefitId}`, {
      headers: {Authorization: `Bearer ${token}`},
    });
  } catch (err) {
    console.log('deleteBenefit ERROR ==> ', err);
  }
};
