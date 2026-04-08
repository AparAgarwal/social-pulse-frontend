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
  data?: unknown;

  constructor(message: string, statusCode: number, errors?: ApiErrorDetail[], data?: unknown) {
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

export interface AuthorMini {
  _id: string;
  fullname: string;
  username: string;
  profile?: {
    avatar?: {
      url?: string | null;
    };
  };
}

export interface PostEngagement {
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
}

export interface Post {
  _id: string;
  postId: string; // Public shortId
  author: AuthorMini;
  content: {
    text: string;
  };
  media?: {
    url: string;
    type: 'image' | 'video' | 'gif';
    alt?: string;
  }[];
  tags?: string[];
  visibility: 'public' | 'followers' | 'private';
  status: 'published' | 'draft' | 'archived' | 'deleted';
  allowComments: boolean;
  engagementMetrics: PostEngagement;
  likedByMe: boolean;
  deletedAt?: string;
  restoreUntil?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentItem {
  _id: string;
  post: string;
  author: AuthorMini;
  content: string;
  parentComment: string | null;
  repliesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentPayload {
  content: string;
  parentComment?: string;
}

export interface CommentsResponse {
  comments: CommentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
