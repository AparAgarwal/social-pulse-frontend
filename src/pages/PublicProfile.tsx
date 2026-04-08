import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/session/AuthContext';
import { getPublicProfile, followUser, unfollowUser } from '../lib/api/user';
import { ApiError, type PublicUser, type Post } from '../lib/api/types';
import { Calendar, MapPin, UserX, ArrowLeft, Link as LinkIcon, UserPlus, UserMinus, Loader2, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { FollowListModal } from '../components/ui/FollowListModal';
import { useNavigateBack } from '../hooks/useNavigateBack';
import { useToast } from '../components/ui/Toast';
import { getUserPosts } from '../lib/api/posts';
import { PostCard } from '../components/PostCard';


export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const navigateBack = useNavigateBack();
  const { toast } = useToast();

  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    if (user && username && user.username === username) {
      navigate('/profile', { replace: true });
    }
  }, [user, username, navigate]);

  useEffect(() => {
    // Wait for auth to settle so the request includes a valid access token
    if (isAuthLoading || !username) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setNotFound(false);

    getPublicProfile(username)
      .then(data => {
        if (!cancelled) {
          setProfile(data);
          setIsFollowing(data.isFollowing === true);
          if (data.accountSettings?.isPrivate === false) {
             fetchUserPosts(data.username);
          }
        }
      })
      .catch(err => {
        if (!cancelled) {
          if (err instanceof ApiError && err.statusCode === 404) {
            setNotFound(true);
          } else {
            setError(err instanceof ApiError ? err.message : 'Failed to load profile');
          }
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [username, isAuthLoading]);

  const fetchUserPosts = async (uname: string) => {
    try {
      setLoadingPosts(true);
      const data = await getUserPosts(uname, 1, 20);
      setPosts(data.posts);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profile) return;
    if (!user) {
      toast('Please sign in to follow users', 'error');
      navigate('/login');
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(profile.username);
        setIsFollowing(false);
        setProfile(p => {
          if (!p) return null;
          const currentMetrics = p.socialMetrics || { followersCount: 0, followingCount: 0 };
          return {
            ...p,
            socialMetrics: {
              ...currentMetrics,
              followersCount: Math.max(0, currentMetrics.followersCount - 1)
            }
          };
        });
      } else {
        await followUser(profile.username);
        setIsFollowing(true);
        setProfile(p => {
          if (!p) return null;
          const currentMetrics = p.socialMetrics || { followersCount: 0, followingCount: 0 };
          return {
            ...p,
            socialMetrics: {
              ...currentMetrics,
              followersCount: currentMetrics.followersCount + 1
            }
          };
        });
      }
    } catch (err) {
      toast('Failed to update follow status', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col w-full min-h-full animate-pulse">
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/60 border-b border-white/5 px-4 py-3 flex items-center gap-6">
          <Button
            variant="ghost"
            className="rounded-full flex items-center border-none hover:bg-white/5 transition-all text-gray-300 cursor-pointer p-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </Button>
          <div className="h-6 w-40 bg-surface rounded" />
        </header>
        <div className="h-56 w-full bg-surface" />
        <div className="px-4 relative">
          <div className="w-32 h-32 rounded-full bg-surface border-4 border-background -mt-16" />
          <div className="mt-4 space-y-3">
            <div className="h-6 w-48 bg-surface rounded" />
            <div className="h-4 w-32 bg-surface rounded" />
            <div className="h-16 w-full max-w-md bg-surface rounded mt-4" />
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (notFound) {
    return (
      <div className="flex flex-col w-full min-h-full">
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/60 border-b border-white/5 px-4 py-3 flex items-center gap-6">
          <Button
            variant="ghost"
            className="rounded-full flex items-center border-none hover:bg-white/5 transition-all text-gray-300 cursor-pointer p-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </Button>
          <h1 className="text-xl font-bold text-white tracking-tight">Profile</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
          <div className="w-20 h-20 rounded-full bg-surface/50 border border-white/10 flex items-center justify-center">
            <UserX className="w-10 h-10 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">User not found</h2>
          <p className="text-gray-400 max-w-md">
            The account <span className="text-primary-400">@{username}</span> doesn't exist. They may have changed their username or deactivated their account.
          </p>
          <Link to="/">
            <Button variant="outline" className="rounded-full mt-4">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="flex flex-col w-full min-h-full">
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/60 border-b border-white/5 px-4 py-3 flex items-center gap-6">
          <Button
            variant="ghost"
            className="rounded-full flex items-center border-none hover:bg-white/5 transition-all text-gray-300 cursor-pointer p-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </Button>
          <h1 className="text-xl font-bold text-white tracking-tight">Profile</h1>
        </header>
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-red-400">{error || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const cacheB = profile.updatedAt ? `?v=${new Date(profile.updatedAt).getTime()}` : '';
  const avatarUrl = profile.profile?.avatar?.url;
  const bannerUrl = profile.profile?.banner?.url;

  const isPrivate = profile.accountSettings?.isPrivate;
  const canSeeContent = !isPrivate;

  return (
    <div className="flex flex-col w-full min-h-full pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/60 border-b border-white/5 px-4 py-3 flex items-center gap-6">
        <Button
          variant="ghost"
          className="rounded-full flex items-center border-none hover:bg-white/5 transition-all text-gray-300 cursor-pointer p-2"
          onClick={navigateBack}
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{profile.fullname}</h1>
          <p className="text-sm text-gray-500 font-medium">{profile.socialMetrics?.followersCount || 0} Followers</p>
        </div>
      </header>

      {/* Banner */}
      <div className="h-56 w-full bg-surface relative overflow-hidden">
        {bannerUrl ? (
          <img src={`${bannerUrl}${cacheB}`} alt={`${profile.username}'s banner`} className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/60 via-surface to-accent/20"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          </>
        )}
      </div>

      <div className="px-4 relative mb-6">
        <div className="flex flex-col min-[450px]:flex-row justify-between items-start min-[450px]:items-end gap-4">
          {/* Avatar */}
          <div className="w-24 h-24 min-[450px]:w-32 min-[450px]:h-32 rounded-full border-4 border-background bg-surface relative -mt-12 min-[450px]:-mt-16 flex items-center justify-center text-4xl min-[450px]:text-5xl font-bold text-white overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10 transition-transform hover:scale-105 duration-300">
            {avatarUrl ? (
              <img src={`${avatarUrl}${cacheB}`} className="w-full h-full object-cover" alt={profile.username} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                {profile.fullname.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex flex-col min-[450px]:flex-row gap-2 w-full min-[450px]:w-auto">
            <Button
              variant={isFollowing ? 'outline' : 'primary'}
              className={`flex-1 min-[450px]:flex-none rounded-full flex items-center justify-center gap-2 transition-all px-6 ${isFollowing ? 'border-gray-600 hover:border-red-500 hover:text-red-500' : ''}`}
              onClick={handleFollowToggle}
              disabled={followLoading}
            >
              {followLoading ? (
                 <Loader2 className="w-4 h-4 animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4" /> 
                  <span className="text-sm min-[450px]:text-base">Unfollow</span>
                </>
              ) : (
                <>
                   <UserPlus className="w-4 h-4" /> 
                   <span className="text-sm min-[450px]:text-base">Follow</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white">{profile.fullname}</h2>
          </div>
          <p className="text-gray-500">@{profile.username}</p>
        </div>

        <div className="mt-4 max-w-2xl text-gray-200">
          {profile.profile?.bio ? (
            <p className="whitespace-pre-wrap">{profile.profile.bio}</p>
          ) : (
             <p className="text-gray-500 italic">This user has not set a bio yet.</p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-gray-500 text-sm">
          {profile.profile?.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {profile.profile.location}
            </span>
          )}
          {profile.profile?.website && (
            <a href={profile.profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-400 hover:underline">
              <LinkIcon className="w-4 h-4" /> 
              {profile.profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Joined {joinDate}
          </span>
        </div>

        <div className="mt-5 flex gap-4 text-sm">
          <span 
            className="text-gray-400 cursor-pointer hover:underline"
            onClick={() => { setFollowModalType('following'); setFollowModalOpen(true); }}
          >
            <strong className="text-white font-bold">{profile.socialMetrics?.followingCount || 0}</strong> Following
          </span>
          <span 
            className="text-gray-400 cursor-pointer hover:underline"
            onClick={() => { setFollowModalType('followers'); setFollowModalOpen(true); }}
          >
            <strong className="text-white font-bold">{profile.socialMetrics?.followersCount || 0}</strong> Followers
          </span>
        </div>
      </div>

      <div className="border-b border-gray-800 flex mt-2 w-full">
        {['Posts', 'Replies', 'Media', 'Likes'].map(tab => (
          <div 
            key={tab} 
            className={`flex-1 py-4 text-center font-medium cursor-pointer transition-colors hover:bg-surface/50
              ${tab === 'Posts' ? 'text-white border-b-2 border-primary-500' : 'text-gray-500'}
            `}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="flex-1">
        {loadingPosts ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        ) : canSeeContent ? (
          posts.length > 0 ? (
            <div className="flex flex-col">
              {posts.map(post => (
                <PostCard key={post.postId} post={post} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p>No posts yet.</p>
            </div>
          )
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-4 bg-surface/10 rounded-xl m-4 border border-white/5">
            <Lock className="w-10 h-10 text-gray-500" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Posts are hidden</h3>
              <p className="text-gray-500 max-w-xs">{profile.fullname} has made their posts hidden.</p>
            </div>
          </div>
        )}
      </div>

      {/* Follow List Modal */}
      <FollowListModal
        isOpen={followModalOpen}
        onClose={() => setFollowModalOpen(false)}
        username={profile.username}
        type={followModalType}
      />
    </div>
  );
}
