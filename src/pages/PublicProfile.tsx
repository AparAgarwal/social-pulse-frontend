
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/session/AuthContext';
import { getPublicProfile } from '../lib/api/user';
import { ApiError, type PublicUser } from '../lib/api/types';
import { Calendar, MapPin, UserX, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigateBack } from '../hooks/useNavigateBack';


export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const navigateBack = useNavigateBack();

  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (user && username && user.username === username) {
      navigate('/profile', { replace: true });
    }
  }, [user, username, navigate]);

  useEffect(() => {
    if (!username) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setNotFound(false);

    getPublicProfile(username)
      .then(data => {
        if (!cancelled) {
          setProfile(data);
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
  }, [username]);

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
        </div>
      </header>

      {/* Banner */}
      <div className="h-56 w-full bg-surface relative overflow-hidden">
        {profile.bannerUrl ? (
          <img src={profile.bannerUrl} alt={`${profile.username}'s banner`} className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/60 via-surface to-accent/20"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          </>
        )}
      </div>

      <div className="px-4 relative mb-6">
        <div className="flex justify-between items-start">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full border-4 border-background bg-surface relative -mt-16 flex items-center justify-center text-5xl font-bold text-white overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} className="w-full h-full object-cover" alt={profile.username} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                {profile.fullname.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h2 className="text-xl font-extrabold text-white">{profile.fullname}</h2>
          <p className="text-gray-500">@{profile.username}</p>
        </div>

        <div className="mt-4 max-w-2xl text-gray-200">
          {profile.bio ? (
            <p>{profile.bio}</p>
          ) : (
            <p className="text-gray-500 italic">This user has not set a bio yet.</p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-gray-500 text-sm">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" /> The Internet
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Joined {joinDate}
          </span>
        </div>

        <div className="mt-5 flex gap-4 text-sm">
          <span className="text-gray-400"><strong className="text-white font-bold">0</strong> Following</span>
          <span className="text-gray-400"><strong className="text-white font-bold">0</strong> Followers</span>
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

      <div className="p-8 text-center text-gray-500">
        <p className="text-sm">Posts will appear here once the Posts API is deployed.</p>
      </div>
    </div>
  );
}
