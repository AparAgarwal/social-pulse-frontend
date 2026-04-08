import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from '../lib/utils/date';
import { useAuth } from '../lib/session/AuthContext';
import { useDeleteCommentMutation, useCommentsQuery } from '../hooks/usePosts';
import type { CommentItem as CommentType } from '../lib/api/types';
import { useToast } from './ui/Toast';
import { CommentComposer } from './CommentComposer';
import { ConfirmModal } from './ui/ConfirmModal';

interface CommentItemProps {
  comment: CommentType;
  onDelete?: (commentId: string) => void;
  isReply?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onDelete,
  isReply = false 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data, isLoading: isLoadingReplies } = useCommentsQuery(comment.post, 1, 50, comment._id, showReplies);
  // Optional chaining is needed since query isn't enabled by default unless we configure it, but actually here we'll just let it fetch if showReplies is true.
  // Wait, useCommentsQuery runs unconditionally by default in our hook unless we pass enabled. I will add enabled parameter to useCommentsQuery or just let it cache if the user expands.
  const replies = data?.comments || [];

  const { mutateAsync: deleteComment, isPending: isDeleting } = useDeleteCommentMutation();

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleDelete = async () => {
    try {
      await deleteComment({ commentId: comment._id, postId: comment.post });
      onDelete?.(comment._id);
      toast('Comment deleted', 'success');
    } catch (err) {
      toast('Failed to delete comment', 'error');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const author = comment.author;
  const isAuthor = user?._id === author._id;

  return (
    <div className={`flex gap-3 p-4 border-b border-white/5 bg-surface/5 ${isReply ? 'ml-8 border-l border-white/5' : ''}`}>
      {/* Avatar */}
      <Link 
        to={`/u/${author.username}`} 
        className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/5 bg-surface/50"
      >
        {author.profile?.avatar?.url ? (
          <img src={author.profile.avatar.url} alt={author.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-500/10 text-primary-400 font-bold uppercase text-[10px]">
            {author.fullname.charAt(0)}
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <Link to={`/u/${author.username}`} className="font-bold text-sm text-white hover:underline truncate">
              {author.fullname}
            </Link>
            <span className="text-gray-500 text-xs truncate">@{author.username}</span>
            <span className="text-gray-500 text-xs">· {formatDistanceToNow(new Date(comment.createdAt))}</span>
          </div>
          
          {isAuthor && (
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <p className="mt-1 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
          {comment.content}
        </p>

        <div className="flex gap-4 mt-2">
          {/* Reply Toggle */}
          <button 
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-400 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Reply
          </button>

          {/* View Replies Toggle */}
          {(comment.repliesCount || 0) > 0 && (
            <button 
              onClick={toggleReplies}
              className="flex items-center gap-1.5 text-xs text-primary-400 hover:underline"
            >
              {isLoadingReplies && showReplies ? (
                'Loading...'
              ) : showReplies ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Hide replies
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  View {comment.repliesCount} replies
                </>
              )}
            </button>
          )}
        </div>

        {/* Reply Composer */}
        {isReplying && (
          <div className="mt-3">
            <CommentComposer 
              postId={comment.post} 
              parentCommentId={comment._id} 
              autoFocus
              onSuccess={() => {
                setShowReplies(true);
                setIsReplying(false);
              }}
            />
          </div>
        )}

        {/* Nested Replies Rendering */}
        {showReplies && replies.length > 0 && (
          <div className="mt-2 space-y-0">
            {replies.map((reply) => (
              <CommentItem 
                key={reply._id} 
                comment={reply} 
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete comment?"
        message="This can't be undone and it will be removed from the post."
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
