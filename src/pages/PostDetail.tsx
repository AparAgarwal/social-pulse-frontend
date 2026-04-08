import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { usePostQuery, useCommentsQuery } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import { CommentComposer } from '../components/CommentComposer';
import { CommentItem } from '../components/CommentItem';

export const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading: loadingPost, error: postError } = usePostQuery(postId || '', !!postId);
  const { data: commentsData, isLoading: loadingComments } = useCommentsQuery(postId || '', 1, 50);
  const comments = commentsData?.comments || [];

  if (loadingPost) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (postError && (postError as any).status === 403) {
    return (
      <div className="p-12 text-center bg-surface/5 border border-white/5 mx-auto max-w-2xl mt-12 rounded-3xl flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">This post is not accessible</h2>
          <p className="text-gray-400 max-w-sm mb-6">
            You do not have permission to view this post. It might be private or restricted to followers only.
          </p>
        </div>
        <Link to="/" className="text-primary-400 hover:text-primary-300 hover:underline font-medium">Return to Home</Link>
      </div>
    );
  }

  if (!post || postError) {
    return (
      <div className="p-12 text-center bg-surface/5 rounded-3xl border border-white/5 mx-auto max-w-2xl mt-12">
        <h2 className="text-xl font-bold text-white mb-2">Post not found</h2>
        <p className="text-gray-400 mb-6">This post may have been deleted or moved to trash.</p>
        <Link to="/" className="text-primary-400 hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/60 border-b border-white/5 p-4 flex items-center gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Post</h1>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full">
        {/* The Post itself */}
        <PostCard 
          post={post} 
          isDetail={true} 
          onActionSuccess={() => navigate('/')} 
        />

        {/* Comment Input */}
        {post.allowComments !== false && (
          <CommentComposer postId={post.postId} />
        )}

        {/* Comments List */}
        <div className="flex flex-col">
          {loadingComments ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem 
                key={comment._id} 
                comment={comment} 
              />
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p>No comments yet. Be the first to reply!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
