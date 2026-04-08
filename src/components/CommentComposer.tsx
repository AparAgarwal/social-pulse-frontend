import React, { useState } from 'react';
import { Button } from './ui/Button';
import { useAuth } from '../lib/session/AuthContext';
import { useAddCommentMutation } from '../hooks/usePosts';
import type { CommentItem } from '../lib/api/types';
import { useToast } from './ui/Toast';

interface CommentComposerProps {
  postId: string;
  parentCommentId?: string;
  onSuccess?: (comment: CommentItem) => void;
  autoFocus?: boolean;
}

export const CommentComposer: React.FC<CommentComposerProps> = ({ 
  postId, 
  parentCommentId, 
  onSuccess,
  autoFocus = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');

  const { mutateAsync: addComment, isPending: isSubmitting } = useAddCommentMutation();

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (!user) {
      toast('Please log in to comment', 'error');
      return;
    }

    try {
      const newComment = await addComment({
        postId,
        payload: {
          content: content.trim(),
          parentComment: parentCommentId
        }
      });
      setContent('');
      onSuccess?.(newComment);
      toast('Comment posted!', 'success');
    } catch {
      toast('Failed to post comment', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="flex gap-4 p-4 border-b border-white/5 bg-surface/5">
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/5 bg-surface/50">
        {user.profile?.avatar?.url ? (
          <img src={user.profile.avatar.url} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-500/20 text-primary-400 font-bold uppercase text-sm">
            {user.fullname.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-3">
        <textarea
          autoFocus={autoFocus}
          placeholder={parentCommentId ? "Post your reply" : "Post your comment"}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-transparent resize-none outline-none text-lg placeholder:text-gray-500 min-h-[40px] pt-1"
          rows={content.split('\n').length || 1}
        />
        <div className="flex justify-end pt-2 border-t border-white/5">
          <Button 
            size="sm" 
            disabled={!content.trim() || isSubmitting}
            onClick={handleSubmit}
            className="rounded-full px-5 font-bold"
          >
            {isSubmitting ? 'Posting...' : (parentCommentId ? 'Reply' : 'Post')}
          </Button>
        </div>
      </div>
    </div>
  );
};
