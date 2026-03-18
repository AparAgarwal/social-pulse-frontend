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

export interface UserProfileMedia {
  url: string | null;
  publicId?: string | null;
}

export interface UserProfile {
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar: UserProfileMedia;
  banner: UserProfileMedia;
}

export interface UserSocialMetrics {
  followersCount: number;
  followingCount: number;
}

export interface UserAccountSettings {
  isPrivate: boolean;
}

export interface User {
  _id: string;
  fullname: string;
  email: string;
  username: string;
  profile?: UserProfile;
  socialMetrics?: UserSocialMetrics;
  accountSettings?: UserAccountSettings;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  fullname: string;
  username: string;
  profile?: UserProfile;
  socialMetrics?: UserSocialMetrics;
  accountSettings?: UserAccountSettings;
  createdAt: string;
  updatedAt: string;
  isFollowing?: boolean | null;
}

export interface UpdateProfilePayload {
  fullname?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  isPrivate?: boolean;
}

export interface AuthResponse {
  user: User;
}
