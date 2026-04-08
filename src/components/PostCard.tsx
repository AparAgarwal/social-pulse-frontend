import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Trash2,
  RefreshCcw,
  Skull
} from 'lucide-react';
import { formatDistanceToNow, formatTimeRemaining } from '../lib/utils/date';
import { useAuth } from '../lib/session/AuthContext';
import { 
  useLikePostMutation, 
  useUnlikePostMutation, 
  useDeletePostMutation, 
  useRestorePostMutation, 
  usePermanentlyDeletePostMutation 
} from '../hooks/usePosts';
import type { Post } from '../lib/api/types';
import { useToast } from './ui/Toast';
import { ConfirmModal } from './ui/ConfirmModal';

interface PostCardProps {
  post: Post;
  isDetail?: boolean;
  mode?: 'feed' | 'trash';
  onActionSuccess?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  isDetail = false, 
  mode = 'feed',
  onActionSuccess 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isTrashMode = mode === 'trash';

  const { mutateAsync: likePost, isPending: isLikingAsync } = useLikePostMutation();
  const { mutateAsync: unlikePost, isPending: isUnlikingAsync } = useUnlikePostMutation();
  const { mutateAsync: deletePost, isPending: isDeleting } = useDeletePostMutation();
  const { mutateAsync: restorePost, isPending: isRestoring } = useRestorePostMutation();
  const { mutateAsync: permanentlyDeletePost, isPending: isPermDeleting } = usePermanentlyDeletePostMutation();

  const isLiking = isLikingAsync || isUnlikingAsync;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTrashMode) return;
    
    if (!user) {
      toast('Login to like posts', 'info');
      return;
    }

    try {
      if (post.likedByMe) {
        await unlikePost(post.postId);
      } else {
        await likePost(post.postId);
      }
    } catch {
      toast('Failed to update like', 'error');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.postId}`);
    toast('Link copied to clipboard!', 'success');
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (isTrashMode) {
        await permanentlyDeletePost(post.postId);
        toast('Post deleted permanently', 'success');
      } else {
        await deletePost(post.postId);
        // The API returns restoreUntil, but we simplify the toast for now or read it from response
        toast(`Moved to trash. You can restore it later.`, 'success');
      }
      
      setIsDeleteModalOpen(false);
      
      if (onActionSuccess) {
        onActionSuccess();
      } else if (isDetail) {
        navigate('/');
      }
    } catch {
      toast(isTrashMode ? 'Failed to delete permanently' : 'Failed to move to trash', 'error');
    }
  };

  const handleRestore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await restorePost(post.postId);
      toast('Post restored to feed', 'success');
      if (onActionSuccess) onActionSuccess();
    } catch {
      toast('Failed to restore post', 'error');
    }
  };

  const avatarUrl = post.author.profile?.avatar?.url;
  const isDeletingAsync = isDeleting || isPermDeleting;

  return (
    <div 
      onClick={() => !isDetail && !isTrashMode && navigate(`/post/${post.postId}`)}
      className={`border-b border-white/5 p-4 flex gap-4 transition-colors ${
        !isDetail && !isTrashMode ? 'hover:bg-surface/10 cursor-pointer' : ''
      } ${isTrashMode ? 'opacity-75 grayscale-[0.5]' : ''}`}
    >
      {/* Avatar */}
      <Link 
        to={`/u/${post.author.username}`} 
        onClick={(e) => e.stopPropagation()}
        className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-white/5 bg-surface/50"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={post.author.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-500/20 text-primary-400 font-bold">
            {post.author.fullname.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <Link 
               to={`/u/${post.author.username}`} 
               onClick={(e) => e.stopPropagation()}
               className="font-bold text-white hover:underline truncate"
            >
              {post.author.fullname}
            </Link>
            <span className="text-gray-500 truncate text-sm">@{post.author.username}</span>
            <span className="text-gray-500 text-sm">· {formatDistanceToNow(new Date(post.createdAt))} ago</span>
            {isTrashMode && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded tracking-wider">
                In Trash
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {user && user._id === post.author._id && (
              <button 
                className="p-2 -mr-2 text-gray-500 hover:text-red-500 rounded-full transition-colors"
                onClick={handleDeleteClick}
                title={isTrashMode ? "Delete Permanently" : "Move to Trash"}
              >
                {isTrashMode ? <Skull className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
              </button>
            )}
            {!isTrashMode && (
              <button className="p-2 -mr-2 text-gray-500 hover:text-primary-400 rounded-full transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="mt-3 text-[#e1e1e1] leading-relaxed whitespace-pre-wrap text-[15px]">
          {post.content.text}
        </p>

        {/* Media Preview */}
        {post.media && post.media.length > 0 && (
          <div className="mt-3 grid gap-2 rounded-2xl overflow-hidden border border-white/5">
            {post.media.map((item, idx) => (
              <img key={idx} src={item.url} className="w-full max-h-[500px] object-cover" alt="Post content" />
            ))}
          </div>
        )}

        {isTrashMode && post.restoreUntil && (
           <div className="mt-3 text-xs text-red-400/80 italic">
             Auto-deletes in {formatTimeRemaining(post.restoreUntil)}
           </div>
        )}

        {/* Actions */}
        {!isTrashMode ? (
          <div className="flex items-center justify-between mt-4 py-2 border-t border-white/5">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 group transition-all duration-300 ${
                post.likedByMe ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'
              }`}
            >
              <div className={`p-2 rounded-full transition-colors ${
                post.likedByMe ? 'bg-rose-500/10' : 'group-hover:bg-rose-500/10'
              }`}>
                <Heart className={`w-[18px] h-[18px] transition-transform duration-300 ${
                  post.likedByMe ? 'fill-current scale-110' : 'group-active:scale-125'
                }`} />
              </div>
              <span className={`text-sm font-medium ${post.likedByMe ? 'text-rose-500' : ''}`}>
                {post.engagementMetrics?.likesCount || 0}
              </span>
            </button>

            <Link 
              to={`/post/${post.postId}`}
              className="flex items-center gap-2 text-gray-500 hover:text-primary-400 group transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 rounded-full group-hover:bg-primary-500/10 transition-colors">
                <MessageCircle className="w-[18px] h-[18px]" />
              </div>
              <span className="text-sm font-medium">{post.engagementMetrics?.commentsCount || 0}</span>
            </Link>

            <button 
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-500 hover:text-accent group transition-all"
            >
              <div className="p-2 rounded-full group-hover:bg-accent/10 transition-colors">
                <Share2 className="w-[18px] h-[18px]" />
              </div>
              <span className="text-sm font-medium">{post.engagementMetrics?.sharesCount || 0}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 mt-4 py-2 border-t border-white/5">
            <button 
              onClick={handleRestore}
              disabled={isRestoring}
              className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors text-sm font-bold uppercase tracking-tight"
            >
              <RefreshCcw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
              Restore Post
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={isTrashMode ? "Delete permanently?" : "Move to trash?"}
        message={isTrashMode 
          ? "This will permanently remove this post and all its data. This action cannot be undone."
          : "The post will be moved to trash and can be restored within 30 days."
        }
        confirmLabel={isDeletingAsync ? "Deleting..." : (isTrashMode ? "Permanently Delete" : "Move to Trash")}
        variant="danger"
        isLoading={isDeletingAsync}
      />
    </div>
  );
};
