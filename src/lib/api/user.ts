import { fetchApi } from './client';
import type { User, PublicUser, UpdateProfilePayload } from './types';

export const getCurrentUser = async (): Promise<User> => {
  return fetchApi<User>('/user/me');
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<User> => {
  return fetchApi<User>('/user/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const uploadAvatar = async (file: File): Promise<User> => {
  const formData = new FormData();
  formData.append('avatar', file);

  return fetchApi<User>('/user/me/avatar', {
    method: 'PATCH',
    body: formData,
    // Content-Type is set automatically by browser for FormData
  });
};

export const uploadBanner = async (file: File): Promise<User> => {
  const formData = new FormData();
  formData.append('banner', file);

  return fetchApi<User>('/user/me/banner', {
    method: 'PATCH',
    body: formData,
  });
};

export const removeAvatar = async (): Promise<User> => {
  return fetchApi<User>('/user/me/avatar', {
    method: 'DELETE',
  });
};

export const removeBanner = async (): Promise<User> => {
  return fetchApi<User>('/user/me/banner', {
    method: 'DELETE',
  });
};

export const getPublicProfile = async (username: string): Promise<PublicUser> => {
  return fetchApi<PublicUser>(`/user/${encodeURIComponent(username)}`);
};
