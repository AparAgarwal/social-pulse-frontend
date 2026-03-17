import { fetchApi } from './client';
import type { AuthResponse } from './types';

export const loginUser = async (payload: { email?: string; username?: string; password: string }) => {
  return fetchApi<AuthResponse>('auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const registerUser = async (payload: { email: string; username: string; password: string; fullname: string }) => {
  return fetchApi<AuthResponse>('auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const logoutUser = async () => {
  return fetchApi<null>('auth/logout', {
    method: 'POST',
  });
};

export const refreshAccessToken = async () => {
  return fetchApi<null>('auth/refresh', {
    method: 'POST',
  });
};

export const getActiveSessions = async () => {
  return fetchApi<import('./types').ActiveSession[]>('auth/sessions');
};

export const revokeActiveSession = async (sessionId: string) => {
  return fetchApi<null>('auth/sessions/revoke', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  });
};

export const getBlockedLoginSessions = async (sessionManagementToken: string) => {
  return fetchApi<import('./types').ActiveSession[]>('auth/session-management/sessions', {
    headers: {
      Authorization: `Bearer ${sessionManagementToken}`,
    },
  });
};

export const revokeBlockedLoginSession = async (sessionManagementToken: string, sessionId: string) => {
  return fetchApi<null>('auth/session-management/sessions/revoke', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sessionManagementToken}`,
    },
    body: JSON.stringify({ sessionId }),
  });
};
