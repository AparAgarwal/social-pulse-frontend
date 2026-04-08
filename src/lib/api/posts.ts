import { fetchApi } from './client';
import type { Post, CommentItem, CreateCommentPayload, CommentsResponse } from './types';

export interface CreatePostPayload {
  content: {
    text: string;
  };
  media?: { url: string; type?: 'image' | 'video' | 'gif'; alt?: string }[];
  tags?: string[];
  visibility?: 'public' | 'followers' | 'private';
  status?: 'draft' | 'published' | 'archived';
  allowComments?: boolean;
}

export const createPost = async (payload: CreatePostPayload): Promise<Post> => {
  return fetchApi<Post>('/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getPosts = async (page = 1, limit = 20, feed: 'public' | 'following' = 'public'): Promise<{ posts: Post[]; hasMore: boolean }> => {
  const url = `/posts?page=${page}&limit=${limit}&feed=${feed}`;
  const data = await fetchApi<{ posts: Post[]; pagination: { hasMore: boolean } }>(url);
  return { posts: data.posts, hasMore: data.pagination.hasMore };
};

export const getUserPosts = async (username: string, page = 1, limit = 20): Promise<{ posts: Post[]; hasMore: boolean }> => {
  const url = `/user/${username}/posts?page=${page}&limit=${limit}`;
  const data = await fetchApi<{ posts: Post[]; pagination: { hasMore: boolean } }>(url);
  return { posts: data.posts, hasMore: data.pagination.hasMore };
};

export const getPost = async (postId: string): Promise<Post> => {
  return fetchApi<Post>(`/posts/${postId}`);
};

export const updatePost = async (postId: string, payload: Partial<CreatePostPayload>): Promise<Post> => {
  return fetchApi<Post>(`/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

/**
 * Soft delete (move to trash)
 */
export const deletePost = async (postId: string): Promise<{ deleted: boolean; retentionDays: number; restoreUntil: string }> => {
  return fetchApi<{ deleted: boolean; retentionDays: number; restoreUntil: string }>(`/posts/${postId}`, {
    method: 'DELETE',
  });
};

/**
 * Trash Management
 */
export const getTrashedPosts = async (page = 1, limit = 20): Promise<{ posts: Post[]; hasMore: boolean }> => {
  const data = await fetchApi<{ posts: Post[]; pagination: { hasMore: boolean } }>(
    `/posts/trash?page=${page}&limit=${limit}`
  );
  return { posts: data.posts, hasMore: data.pagination.hasMore };
};

export const restorePost = async (postId: string): Promise<{ restored: boolean }> => {
  return fetchApi<{ restored: boolean }>(`/posts/${postId}/restore`, {
    method: 'POST',
  });
};

export const permanentlyDeletePost = async (postId: string): Promise<{ deleted: boolean }> => {
  return fetchApi<{ deleted: boolean }>(`/posts/${postId}/permanent`, {
    method: 'DELETE',
  });
};

/**
 * Likes
 */
export const likePost = async (postId: string): Promise<{ liked: boolean }> => {
  return fetchApi<{ liked: boolean }>(`/posts/${postId}/likes`, {
    method: 'POST',
  });
};

export const unlikePost = async (postId: string): Promise<{ liked: boolean }> => {
  return fetchApi<{ liked: boolean }>(`/posts/${postId}/likes`, {
    method: 'DELETE',
  });
};

export const getLikedByMe = async (postId: string): Promise<{ likedByMe: boolean }> => {
  return fetchApi<{ likedByMe: boolean }>(`/posts/${postId}/likes/me`);
};

/**
 * Comments
 */
export const addComment = async (postId: string, payload: CreateCommentPayload): Promise<CommentItem> => {
  return fetchApi<CommentItem>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getComments = async (
  postId: string, 
  page = 1, 
  limit = 20, 
  parentComment?: string
): Promise<CommentsResponse> => {
  let url = `/posts/${postId}/comments?page=${page}&limit=${limit}`;
  if (parentComment) url += `&parentComment=${parentComment}`;
  return fetchApi<CommentsResponse>(url);
};

export const deleteComment = async (commentId: string): Promise<{ deleted: boolean }> => {
  return fetchApi<{ deleted: boolean }>(`/posts/comments/${commentId}`, {
    method: 'DELETE',
  });
};
