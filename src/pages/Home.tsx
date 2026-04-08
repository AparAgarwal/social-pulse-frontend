import { useState, useRef } from 'react';
import { useAuth } from '../lib/session/AuthContext';
import { useOutletContext as useReactRouterOutlet, Link as RouterLink } from 'react-router-dom';
import { Clock, Image as ImageIcon, Smile, Menu, Loader2, Globe, Users, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PostCard } from '../components/PostCard';
import { useToast } from '../components/ui/Toast';
import { useFeedQuery, useCreatePostMutation } from '../hooks/usePosts';

export function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { setIsMobileMenuOpen } = useReactRouterOutlet<{ setIsMobileMenuOpen: (open: boolean) => void }>();

  const [feedType, setFeedType] = useState<'public' | 'following'>('public');
  const [postVisibility, setPostVisibility] = useState<'public' | 'followers' | 'private'>('public');
  
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data, isLoading, isError } = useFeedQuery(feedType, 1, 50);
  const posts = data?.posts || [];

  const { mutateAsync: createPost, isPending: isSubmitting } = useCreatePostMutation();

  const handlePostSubmit = async () => {
    if (!content.trim() || !user) return;

    try {
      await createPost({ 
        content: { text: content.trim() },
        visibility: postVisibility 
      });
      setContent('');
      toast('Post published!', 'success');
    } catch {
      toast('Failed to create post', 'error');
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      {/* Top Header sticky */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/80 border-b border-white/5 flex flex-col pt-1">
        <div className="flex w-full">
          {/* Mobile menu button */}
          <div className="absolute left-2 top-2 md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
          <button
            onClick={() => setFeedType('public')}
            className="flex-1 py-4 flex justify-center hover:bg-white/5 transition-colors relative"
          >
            <span className={`font-bold ${feedType === 'public' ? 'text-white' : 'text-gray-500'}`}>
              For you
              {feedType === 'public' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-primary-500"></div>
              )}
            </span>
          </button>
          
          {user ? (
            <button
              onClick={() => setFeedType('following')}
              className="flex-1 py-4 flex justify-center hover:bg-white/5 transition-colors relative"
            >
              <span className={`font-bold ${feedType === 'following' ? 'text-white' : 'text-gray-500'}`}>
                Following
                {feedType === 'following' && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-primary-500"></div>
                )}
              </span>
            </button>
          ) : (
            <div className="flex-1 py-4 flex justify-center text-gray-600 font-bold cursor-not-allowed">
              <span>Following</span>
            </div>
          )}
        </div>
      </header>

      {/* Feed Composer */}
      <div className="border-b border-white/5 p-4 flex gap-4 bg-surface/5">
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-white/5 bg-surface/50">
          {user?.profile?.avatar?.url ? (
            <img src={user.profile.avatar.url} className="w-full h-full object-cover" alt={user.username} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-500/20 text-primary-400 font-bold">
              {user?.fullname?.charAt(0).toUpperCase() || 'G'}
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-3 pt-1">
          <textarea
            ref={textareaRef}
            placeholder={user ? "What's on your mind?" : "Log in to join the conversation..."}
            maxLength={280}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent resize-none outline-none text-xl placeholder:text-gray-500 min-h-[60px] focus:placeholder-gray-400 transition-colors"
            disabled={!user}
          />
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div className="flex items-center text-primary-400 gap-2">
              <button className="p-2 rounded-full hover:bg-primary-500/10 transition-colors disabled:opacity-50" disabled><ImageIcon className="w-5 h-5" /></button>
              <button className="p-2 rounded-full hover:bg-primary-500/10 transition-colors disabled:opacity-50" disabled><Smile className="w-5 h-5" /></button>
              
              {user && (
                <div className="relative group ml-2">
                  <select
                    value={postVisibility}
                    onChange={(e) => setPostVisibility(e.target.value as 'public' | 'followers' | 'private')}
                    className="appearance-none bg-surface/30 border border-white/10 text-xs text-gray-300 rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500/50 pr-8"
                  >
                    <option value="public">Public</option>
                    <option value="followers">Followers</option>
                    <option value="private">Private</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    {postVisibility === 'public' && <Globe className="w-3 h-3" />}
                    {postVisibility === 'followers' && <Users className="w-3 h-3" />}
                    {postVisibility === 'private' && <Lock className="w-3 h-3" />}
                  </div>
                </div>
              )}
            </div>
            <Button 
              size="sm" 
              disabled={!content.trim() || isSubmitting || !user} 
              className="rounded-full px-6 font-bold shadow-lg"
              onClick={handlePostSubmit}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </div>

      {/* Feed Filters (Removed in favor of top header tabs) */}

      {/* Feed Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        ) : isError ? (
           <div className="p-12 flex flex-col items-center justify-center text-red-400">
             Failed to load feed. You might not have access.
           </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col">
            {posts.map(post => (
              <PostCard key={post.postId} post={post} />
            ))}
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center opacity-80 gap-5 my-12 animate-float">
            <div className="w-20 h-20 rounded-full bg-surface/50 border border-white/10 flex items-center justify-center shadow-2xl mb-2">
              <Clock className="w-10 h-10 text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Your feed is waiting</h2>
            <p className="max-w-md text-gray-400 leading-relaxed text-lg">
              {user ? "Follow more people to see their posts here, or check back later!" : "Welcome to SocialPulse! Log in to start building your network and seeing posts from people you follow."}
            </p>
            {!user && (
              <RouterLink to="/login">
                <Button className="mt-6 rounded-full px-8 interactive-hover shadow-lg shadow-primary-500/20 font-bold">
                  Log in to SocialPulse
                </Button>
              </RouterLink>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
