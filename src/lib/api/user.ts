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

export const followUser = async (username: string): Promise<{ username: string; isFollowing: boolean }> => {
  return fetchApi<{ username: string; isFollowing: boolean }>(`/user/${encodeURIComponent(username)}/follow`, {
    method: 'POST',
  });
};

export const unfollowUser = async (username: string): Promise<{ username: string; isFollowing: boolean }> => {
  return fetchApi<{ username: string; isFollowing: boolean }>(`/user/${encodeURIComponent(username)}/follow`, {
    method: 'DELETE',
  });
};

export interface PaginatedUsers {
  user: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  followers?: any[];
  following?: any[];
}

export const getFollowers = async (username: string, page = 1, limit = 20): Promise<PaginatedUsers> => {
  return fetchApi<PaginatedUsers>(`/user/${encodeURIComponent(username)}/followers?page=${page}&limit=${limit}`);
};

export const getFollowing = async (username: string, page = 1, limit = 20): Promise<PaginatedUsers> => {
  return fetchApi<PaginatedUsers>(`/user/${encodeURIComponent(username)}/following?page=${page}&limit=${limit}`);
};
