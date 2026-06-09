import axiosInstance from '../configs/axios';

export const getBookBenefits = async id => {
  try {
    const benefits = await axiosInstance.get(`/api/books/${id}/benefits`);
    return benefits.data;
  } catch (error) {
    console.log('getBookBenefits ERROR ==> ', error);
  }
};

export const deleteBenefit = async (bookId, benefitId) => {
  try {
    await axiosInstance.delete(`/api/books/${bookId}/benefits/${benefitId}`);
  } catch (err) {
    console.log('deleteBenefit ERROR ==> ', err);
  }
};
