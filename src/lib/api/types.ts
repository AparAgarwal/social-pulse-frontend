export interface ApiErrorDetail {
  path?: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  statusCode: number;
  data: T;
  success: boolean;
  message: string;
  errors?: ApiErrorDetail[];
}

export class ApiError extends Error {
  statusCode: number;
  errors?: ApiErrorDetail[];
  data?: any;

  constructor(message: string, statusCode: number, errors?: ApiErrorDetail[], data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.data = data;
  }
}

export interface ActiveSession {
  sessionId: string;
  deviceType: string;
  os: string;
  browser: string;
  userAgent: string;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string;
  isCurrent: boolean;
}

export interface MaxSessionsReachedPayload {
  code: "MAX_ACTIVE_SESSIONS_REACHED";
  maxActiveSessions: number;
  activeSessions: ActiveSession[];
  sessionManagementToken: string;
}

export interface User {
  _id: string;
  fullname: string;
  email: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  fullname: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  createdAt: string;
}

export interface UpdateProfilePayload {
  fullname?: string;
  username?: string;
  bio?: string;
}

export interface AuthResponse {
  user: User;
}
