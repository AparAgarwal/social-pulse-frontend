import { useState } from 'react';
import { useAuth } from '../lib/session/AuthContext';
import { Button } from '../components/ui/Button';
import { Calendar, MapPin, Edit3, Share, ArrowLeft } from 'lucide-react';
import { EditProfileModal } from '../components/ui/EditProfileModal';
import { ImagePreviewModal } from '../components/ui/ImagePreviewModal';
import { useToast } from '../components/ui/Toast';
import { useNavigateBack } from '../hooks/useNavigateBack';


export function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigateBack = useNavigateBack();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; alt: string } | null>(null);

  if (!user) return null;

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const cacheB = user.updatedAt ? `?v=${new Date(user.updatedAt).getTime()}` : '';

  const openPreview = (url: string | null, alt: string) => {
    if (url) {
      setPreviewImage({ url: `${url}${cacheB}`, alt });
    }
  };

  const handleShare = async () => {
    const publicUrl = `${window.location.origin}/u/${user.username}`;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: `${user.fullname} on SocialPulse`,
          text: `Check out ${user.fullname}'s profile on SocialPulse!`,
          url: publicUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast('Failed to share profile', 'error');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(publicUrl);
        toast('Profile link copied to clipboard!');
      } catch (err) {
        toast('Failed to copy link', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col w-full min-h-full pb-12">
      {/* Top Header sticky */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/60 border-b border-white/5 px-4 py-3 flex items-center gap-6">
        <Button
          variant="ghost"
          className="rounded-full flex items-center border-none hover:bg-white/5 transition-all text-gray-300 cursor-pointer p-3"
          onClick={navigateBack}
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{user.fullname}</h1>
          <p className="text-sm text-gray-500 font-medium">0 posts</p>
        </div>
      </header>

      {/* Banner */}
      <div
        className={`h-56 w-full bg-surface relative overflow-hidden ${user.bannerUrl ? 'cursor-pointer' : ''}`}
        onClick={() => openPreview(user.bannerUrl, 'Profile banner')}
      >
        {user.bannerUrl ? (
          <img src={`${user.bannerUrl}${cacheB}`} alt="Profile banner" className="w-full h-full object-cover" />
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
          <div
            className={`w-32 h-32 rounded-full border-4 border-background bg-surface relative -mt-16 flex items-center justify-center text-5xl font-bold text-white overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10 transition-transform hover:scale-105 duration-300 ${user.avatarUrl ? 'cursor-pointer' : ''}`}
            onClick={() => openPreview(user.avatarUrl, user.username)}
          >
            {user.avatarUrl ? (
              <img src={`${user.avatarUrl}${cacheB}`} className="w-full h-full object-cover" alt={user.username} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                {user.fullname.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className="rounded-full flex items-center gap-2 border-gray-600 hover:border-gray-500 hover:bg-white/5 transition-all text-gray-300"
              onClick={handleShare}
            >
              <Share className="w-4 h-4 text-gray-400" /> Share
            </Button>
            <Button
              variant="outline"
              className="rounded-full flex items-center gap-2 border-gray-600 hover:border-gray-500 hover:bg-white/5"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit3 className="w-4 h-4" /> Edit profile
            </Button>
          </div>
        </div>

        <div className="mt-3">
          <h2 className="text-xl font-extrabold text-white">{user.fullname}</h2>
          <p className="text-gray-500">@{user.username}</p>
        </div>

        <div className="mt-4 max-w-2xl text-gray-200">
          {user.bio ? (
            <p>{user.bio}</p>
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          isOpen={true}
          onClose={() => setPreviewImage(null)}
          imageUrl={previewImage.url}
          alt={previewImage.alt}
        />
      )}
    </div>
  );
}
