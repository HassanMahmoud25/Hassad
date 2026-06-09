import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../configs/axios';

export const login = async data => {
  try {
    const res = await axiosInstance.post('/api/auth/login', data);

    const token = res.data.token;

    await AsyncStorage.setItem('token', token);

    console.log('Token saved successfully:', token);

    return res.data;
  } catch (err) {
    console.log('Login ERROR ===> ', err);
    throw err;
  }
};
