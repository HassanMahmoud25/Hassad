import axiosInstance from './client';
import {LoginResponse, RegisterResponse, User} from './types';

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  verify_password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/** POST /api/auth/register returns the created user directly (no token —
 * the backend does not log the account in). Callers must follow up with
 * login() using the same credentials to obtain a session. */
export const register = async (
  data: RegisterPayload,
): Promise<RegisterResponse> => {
  const res = await axiosInstance.post('/api/auth/register', data);
  return res.data;
};

/** POST /api/auth/login returns only {message, token} — no user object.
 * The token is a JWT carrying {user_id, email}; decode it for identity. */
export const login = async (data: LoginPayload): Promise<LoginResponse> => {
  const res = await axiosInstance.post('/api/auth/login', data);
  return res.data;
};

export const logout = async (): Promise<void> => {
  await axiosInstance.post('/api/auth/logout');
};

export const requestVerifyUser = async (): Promise<void> => {
  await axiosInstance.post('/api/auth/verify-user-request');
};

export const verifyUser = async (verify_otp: string): Promise<void> => {
  await axiosInstance.post('/api/auth/verify-user', {verify_otp});
};

export const requestPasswordReset = async (): Promise<void> => {
  await axiosInstance.post('/api/auth/reset-password-request');
};

/** Changing the password ends every older session; the server answers with a
 * fresh token for this device (older deployments send none). */
export const resetPassword = async (data: {
  otp: string;
  password: string;
  verify_password: string;
}): Promise<{token?: string}> => {
  const res = await axiosInstance.post('/api/auth/reset-password', data);
  return res.data ?? {};
};

export const uploadProfilePicture = async (image: {
  uri: string;
  type: string;
  name: string;
}): Promise<User> => {
  const formData = new FormData();
  formData.append('image', image as unknown as Blob);

  const res = await axiosInstance.post('/api/auth/profile-picture', formData, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
  return res.data;
};

export const deleteProfilePicture = async (): Promise<void> => {
  await axiosInstance.delete('/api/auth/profile-picture');
};
