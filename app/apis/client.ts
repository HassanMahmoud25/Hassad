import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {BASE_API_URL} from '@env';
import {ApiError} from './errors';

const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  // A server that never answers must end in an error state, not an endless spinner.
  timeout: 20000,
});

// Development only: QA can point a debug build at a local backend from the
// dev menu (see RootNavigator). Release builds compile this out.
export const DEV_API_KEY = 'hassad.dev.apiBase';
const devApiBase: Promise<string | null> = __DEV__ ? AsyncStorage.getItem(DEV_API_KEY).catch(() => null) : Promise.resolve(null);

axiosInstance.interceptors.request.use(
  async config => {
    if (__DEV__) {
      const base = await devApiBase;
      if (base) {
        config.baseURL = base;
      }
    }
    const token = await AsyncStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

axiosInstance.interceptors.response.use(
  response => {
    // Several backend failures are sent as `res.send(message).status(500)`,
    // which Express delivers as HTTP 200 with a text body. Every successful
    // API response is JSON, so a string body is an error.
    if (typeof response.data === 'string' && response.config.url?.startsWith('/api/')) {
      return Promise.reject(new ApiError('server', response.data || 'Server error', response.status));
    }
    return response;
  },
  error => {
    if (error?.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
