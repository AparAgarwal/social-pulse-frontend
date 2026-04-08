import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPosts,
  getUserPosts,
  getPost,
  createPost,
  deletePost,
  getTrashedPosts,
  restorePost,
  permanentlyDeletePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
  deleteComment,
  type CreatePostPayload,
} from '../lib/api/posts';
import type { Post, CreateCommentPayload } from '../lib/api/types';

// Query Keys
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: { feed: string; page?: number; limit?: number }) =>
    [...postKeys.lists(), filters] as const,
  userLists: () => [...postKeys.all, 'userList'] as const,
  userList: (username: string, page?: number, limit?: number) => [...postKeys.userLists(), { username, page, limit }] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  trashLists: () => [...postKeys.all, 'trash'] as const,
  trashList: (page?: number, limit?: number) => [...postKeys.trashLists(), { page, limit }] as const,
  comments: (postId: string) => [...postKeys.detail(postId), 'comments'] as const,
};

// -- Queries --

export function useFeedQuery(feed: 'public' | 'following' = 'public', page = 1, limit = 20) {
  return useQuery({
    queryKey: postKeys.list({ feed, page, limit }),
    queryFn: () => getPosts(page, limit, feed),
  });
}

export function useProfilePostsQuery(username: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: postKeys.userList(username, page, limit),
    queryFn: () => getUserPosts(username, page, limit),
    enabled: !!username,
  });
}

export function usePostQuery(postId: string, enabled = true) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => getPost(postId),
    enabled,
    retry: (failureCount, error: unknown) => {
      const err = error as { status?: number };
      if (err?.status === 403 || err?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useCommentsQuery(postId: string, page = 1, limit = 50, parentComment?: string, enabled = true) {
  return useQuery({
    queryKey: [...postKeys.comments(postId), { page, limit, parentComment }],
    queryFn: () => getComments(postId, page, limit, parentComment),
    enabled,
  });
}

export function useTrashQuery(page = 1, limit = 50) {
  return useQuery({
    queryKey: postKeys.trashList(page, limit),
    queryFn: () => getTrashedPosts(page, limit),
  });
}

// -- Mutations --

export function useCreatePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostPayload) => createPost(payload),
    onSuccess: () => {
      // Invalidate feed lists
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useLikePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => likePost(postId),
    onMutate: async (postId) => {
      // Optimistic update
      queryClient.setQueriesData({ queryKey: postKeys.all }, (oldData: unknown) => {
        if (!oldData) return oldData;
        
        const typedData = oldData as { posts?: Post[], postId?: string, likedByMe?: boolean, engagementMetrics?: { likesCount: number } };
        
        if (typedData.posts && Array.isArray(typedData.posts)) {
          return {
            ...typedData,
            posts: typedData.posts.map((post: Post) => {
              if (post.postId === postId && !post.likedByMe) {
                return {
                  ...post,
                  likedByMe: true,
                  engagementMetrics: {
                    ...post.engagementMetrics,
                    likesCount: post.engagementMetrics.likesCount + 1
                  }
                };
              }
              return post;
            })
          };
        }
        
        if (typedData.postId === postId && !typedData.likedByMe) {
          return {
            ...typedData,
            likedByMe: true,
            engagementMetrics: {
              ...(typedData.engagementMetrics || { likesCount: 0 }),
              likesCount: (typedData.engagementMetrics?.likesCount || 0) + 1
            }
          };
        }
        
        return typedData;
      });
    },
    onSettled: (data, error, postId) => {
      // Invalidate to ensure consistency, though optimistic UI handles immediate feedback.
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    }
  });
}

export function useUnlikePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => unlikePost(postId),
    onMutate: async (postId) => {
      queryClient.setQueriesData({ queryKey: postKeys.all }, (oldData: unknown) => {
        if (!oldData) return oldData;
        const typedData = oldData as { posts?: Post[], postId?: string, likedByMe?: boolean, engagementMetrics?: { likesCount: number } };
        if (typedData.posts && Array.isArray(typedData.posts)) {
          return {
            ...typedData,
            posts: typedData.posts.map((post: Post) => {
              if (post.postId === postId && post.likedByMe) {
                return {
                  ...post,
                  likedByMe: false,
                  engagementMetrics: {
                    ...post.engagementMetrics,
                    likesCount: Math.max(0, post.engagementMetrics.likesCount - 1)
                  }
                };
              }
              return post;
            })
          };
        }
        if (typedData.postId === postId && typedData.likedByMe) {
          return {
            ...typedData,
            likedByMe: false,
            engagementMetrics: {
              ...(typedData.engagementMetrics || { likesCount: 0 }),
              likesCount: Math.max(0, (typedData.engagementMetrics?.likesCount || 0) - 1)
            }
          };
        }
        return typedData;
      });
    },
    onSettled: (data, error, postId) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    }
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.trashLists() });
    }
  });
}

export function useRestorePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => restorePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.trashLists() });
    }
  });
}

export function usePermanentlyDeletePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => permanentlyDeletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.trashLists() });
    }
  });
}

export function useAddCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, payload }: { postId: string; payload: CreateCommentPayload }) => addComment(postId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(variables.postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.postId) });
      
      // Update comment count optimistically on list views
      queryClient.setQueriesData({ queryKey: postKeys.lists() }, (oldData: unknown) => {
        if (!oldData) return oldData;
        const typedData = oldData as { posts?: Post[] };
        if (!typedData.posts) return typedData;
        return {
          ...typedData,
          posts: typedData.posts.map((post: Post) => {
            if (post.postId === variables.postId) {
              return {
                ...post,
                engagementMetrics: {
                  ...post.engagementMetrics,
                  commentsCount: post.engagementMetrics.commentsCount + 1
                }
              };
            }
            return post;
          })
        };
      });
    }
  });
}

export function useDeleteCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId }: { commentId: string; postId: string }) => deleteComment(commentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(variables.postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.postId) });
    }
  });
}
