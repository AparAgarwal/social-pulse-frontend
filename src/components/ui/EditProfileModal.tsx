import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Camera, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/session/AuthContext';
import { updateProfile, uploadAvatar, uploadBanner, removeAvatar, removeBanner } from '../../lib/api/user';
import { ApiError } from '../../lib/api/types';
import { Modal } from './Modal';
import { ImageCropper } from './ImageCropper';
import { Button } from './Button';
import { useToast } from './Toast';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const profileSchema = z.object({
  fullname: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .max(80, 'Full name must be 80 characters or fewer'),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be 30 characters or fewer')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores are allowed'),
  bio: z
    .string()
    .trim()
    .max(280, 'Bio must be 280 characters or fewer')
    .optional()
    .or(z.literal('')),
  location: z
    .string()
    .trim()
    .max(120, 'Location must be 120 characters or fewer')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .trim()
    .max(200, 'Website must be 200 characters or fewer')
    .optional()
    .or(z.literal('')),
  isPrivate: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, and WEBP images are allowed.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Image size must be under 5MB.';
  }
  return null;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Staged changes (Local only until Save)
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [pendingBanner, setPendingBanner] = useState<File | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [bannerRemoved, setBannerRemoved] = useState(false);
  
  // Preview URLs for staged images
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Loading states for Save operation
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Crop states
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropType, setCropType] = useState<'avatar' | 'banner'>('avatar');

  // Form states
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullname: user?.fullname || '',
      username: user?.username || '',
      bio: user?.profile?.bio || '',
      location: user?.profile?.location || '',
      website: user?.profile?.website || '',
      isPrivate: user?.accountSettings?.isPrivate || false,
    },
  });

  // Reset all states when modal opens
  useEffect(() => {
    if (isOpen && user) {
      reset({
        fullname: user.fullname || '',
        username: user.username || '',
        bio: user.profile?.bio || '',
        location: user.profile?.location || '',
        website: user.profile?.website || '',
        isPrivate: user.accountSettings?.isPrivate || false,
      });
      setGlobalError(null);
      setUploadError(null);
      setPendingAvatar(null);
      setPendingBanner(null);
      setAvatarRemoved(false);
      setBannerRemoved(false);
      setAvatarPreview(null);
      setBannerPreview(null);
    }
  }, [isOpen, user, reset]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [avatarPreview, bannerPreview]);

  const bioValue = watch('bio') || '';

  if (!user) return null;

  // --- Image handlers ---
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      setUploadError(error);
      return;
    }
    setUploadError(null);
    setCropType(type);
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageToCrop(reader.result?.toString() || null);
      setIsCropModalOpen(true);
    });
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    setIsCropModalOpen(false);
    const extension = croppedBlob.type.split('/')[1] || 'jpeg';
    const filename = `${cropType}-${Date.now()}.${extension}`;
    const file = new File([croppedBlob], filename, { type: croppedBlob.type });
    const previewUrl = URL.createObjectURL(file);

    if (cropType === 'avatar') {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setPendingAvatar(file);
      setAvatarPreview(previewUrl);
      setAvatarRemoved(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    } else {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      setPendingBanner(file);
      setBannerPreview(previewUrl);
      setBannerRemoved(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const handleMarkForRemoval = (type: 'avatar' | 'banner') => {
    if (type === 'avatar') {
      setAvatarRemoved(true);
      setPendingAvatar(null);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    } else {
      setBannerRemoved(true);
      setPendingBanner(null);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      setBannerPreview(null);
    }
  };

  // --- Form submit (Sequential updates) ---
  const onSubmit = async (data: ProfileFormValues) => {
    setGlobalError(null);
    setIsSaving(true);

    try {
      let currentUser = user;

      // 1. Handle Avatar (Upload or Remove)
      if (avatarRemoved && user.profile?.avatar?.url) {
        currentUser = await removeAvatar();
      } else if (pendingAvatar) {
        currentUser = await uploadAvatar(pendingAvatar);
      }

      // 2. Handle Banner (Upload or Remove)
      if (bannerRemoved && user.profile?.banner?.url) {
        currentUser = await removeBanner();
      } else if (pendingBanner) {
        currentUser = await uploadBanner(pendingBanner);
      }

      // 3. Handle Text Fields
      const payload: Record<string, any> = {};
      if (data.fullname !== user.fullname) payload.fullname = data.fullname;
      if (data.username !== user.username) payload.username = data.username;
      if ((data.bio || '') !== (user.profile?.bio || '')) payload.bio = data.bio || '';
      if ((data.location || '') !== (user.profile?.location || '')) payload.location = data.location || '';
      if ((data.website || '') !== (user.profile?.website || '')) payload.website = data.website || '';
      if (data.isPrivate !== user.accountSettings?.isPrivate) payload.isPrivate = data.isPrivate;

      if (Object.keys(payload).length > 0) {
        currentUser = await updateProfile(payload);
      }
      
      updateUser(currentUser);
      toast('Profile updated successfully!');
      
      // Close modal on success (UX request)
      setTimeout(() => {
        onClose();
      }, 500);

    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 409) {
          setError('username', { type: 'server', message: 'This username is already taken' });
        } else if (err.errors && err.errors.length > 0) {
          err.errors.forEach(e => {
            if (e.path) {
              setError(e.path as any, { type: 'server', message: e.message });
            }
          });
        } else {
          toast(err.message || 'Failed to update profile', 'error');
        }
      } else {
        toast('An unexpected error occurred', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const cacheB = user.updatedAt ? `?v=${new Date(user.updatedAt).getTime()}` : '';
  
  // Determine what to show in the preview
  const displayBanner = bannerRemoved ? null : (bannerPreview || user.profile?.banner?.url);
  const displayAvatar = avatarRemoved ? null : (avatarPreview || user.profile?.avatar?.url);
  
  const hasChanges = isDirty || pendingAvatar || pendingBanner || avatarRemoved || bannerRemoved;

  return (
    <>
      {/* Main Edit Profile Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-start justify-center ${isOpen ? '' : 'pointer-events-none'}`}
        style={{ display: isOpen ? undefined : 'none' }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="relative w-full max-w-xl bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 my-8 mx-4 max-h-[90vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                disabled={isSaving}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-white tracking-tight">Edit profile</h2>
            </div>
            <Button
              size="sm"
              className="rounded-full px-6 font-bold shadow-lg"
              onClick={handleSubmit(onSubmit)}
              isLoading={isSaving}
              disabled={!hasChanges || isSaving}
            >
              Save
            </Button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Banner */}
            <div className="h-44 w-full bg-surface relative overflow-hidden group">
              {displayBanner ? (
                <img
                  src={bannerPreview ? bannerPreview : `${displayBanner}${cacheB}`}
                  alt="Profile banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/60 via-surface to-accent/20" />
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                </>
              )}

              {/* Banner overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => bannerInputRef.current?.click()}
                  className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                  title="Upload banner"
                  disabled={isSaving}
                >
                  <Camera className="w-5 h-5" />
                </button>
                {displayBanner && (
                  <button
                    onClick={() => handleMarkForRemoval('banner')}
                    className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    title="Remove banner"
                    disabled={isSaving}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <input
                ref={bannerInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => onSelectFile(e, 'banner')}
              />
            </div>

            {/* Avatar */}
            <div className="px-4 relative">
              <div className="w-28 h-28 rounded-full border-4 border-surface bg-surface relative -mt-14 flex items-center justify-center text-4xl font-bold text-white overflow-hidden shadow-xl group cursor-pointer">
                {displayAvatar ? (
                  <img
                    src={avatarPreview ? avatarPreview : `${displayAvatar}${cacheB}`}
                    className="w-full h-full object-cover"
                    alt={user.username}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                    {user.fullname.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Avatar overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    title="Upload avatar"
                    disabled={isSaving}
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => onSelectFile(e, 'avatar')}
                />
              </div>

              {/* Remove avatar button */}
              {displayAvatar && (
                <button
                  onClick={() => handleMarkForRemoval('avatar')}
                  className="absolute bottom-1 left-[6.5rem] p-1.5 rounded-full bg-surface border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all"
                  title="Remove avatar"
                  disabled={isSaving}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Error */}
            {uploadError && (
              <div className="mx-4 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {uploadError}
              </div>
            )}

            {/* Form */}
            <div className="p-4 space-y-5 mt-2">
              {globalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-sm font-medium text-red-400">
                  {globalError}
                </div>
              )}

              {/* Name field */}
              <div className="w-full">
                <label htmlFor="edit-fullname" className="block text-xs font-medium text-gray-500 mb-1">
                  Name
                </label>
                <input
                  id="edit-fullname"
                  type="text"
                  placeholder="Your display name"
                  {...register('fullname')}
                  className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2.5 text-base text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                  disabled={isSaving}
                />
                {errors.fullname && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{errors.fullname.message}</p>
                )}
              </div>

              {/* Username field */}
              <div className="w-full">
                <label htmlFor="edit-username" className="block text-xs font-medium text-gray-500 mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">@</span>
                  <input
                     id="edit-username"
                     type="text"
                     placeholder="username"
                     {...register('username')}
                     className="w-full bg-transparent border border-white/10 rounded-lg pl-8 pr-3 py-2.5 text-base text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                     disabled={isSaving}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{errors.username.message}</p>
                )}
              </div>

              {/* Bio field */}
              <div className="w-full">
                <label htmlFor="edit-bio" className="block text-xs font-medium text-gray-500 mb-1">
                  Bio
                </label>
                <textarea
                  id="edit-bio"
                  rows={4}
                  placeholder="Tell people about yourself..."
                  {...register('bio')}
                  className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2.5 text-base text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none disabled:opacity-50"
                  disabled={isSaving}
                />
                <div className="flex justify-between mt-1">
                  {errors.bio ? (
                     <p className="text-sm text-red-500 font-medium">{errors.bio.message}</p>
                   ) : (
                     <span />
                   )}
                   <span className={`text-[10px] uppercase tracking-widest font-bold ${bioValue.length > 260 ? 'text-amber-400' : 'text-gray-600'}`}>
                     {bioValue.length} / 280
                   </span>
                </div>
              </div>
              
              {/* Location field */}
              <div className="w-full">
                <label htmlFor="edit-location" className="block text-xs font-medium text-gray-500 mb-1">
                  Location
                </label>
                <input
                  id="edit-location"
                  type="text"
                  placeholder="Where do you live?"
                  {...register('location')}
                  className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2.5 text-base text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                  disabled={isSaving}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{errors.location.message}</p>
                )}
              </div>

              {/* Website field */}
              <div className="w-full">
                <label htmlFor="edit-website" className="block text-xs font-medium text-gray-500 mb-1">
                  Website
                </label>
                <input
                  id="edit-website"
                  type="text"
                  placeholder="https://example.com"
                  {...register('website')}
                  className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2.5 text-base text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                  disabled={isSaving}
                />
                 {errors.website && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{errors.website.message}</p>
                )}
              </div>

              {/* Privacy toggle */}
              <div className="w-full flex items-center justify-between mt-4 p-4 border border-white/10 rounded-lg bg-white/5">
                <div>
                  <h4 className="text-sm font-medium text-white">Private Account</h4>
                  <p className="text-xs text-gray-400 mt-1">Only approved followers can see your posts.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    {...register('isPrivate')}
                    disabled={isSaving}
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      <Modal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        title={`Crop your ${cropType}`}
      >
        {imageToCrop && (
          <ImageCropper
            image={imageToCrop}
            aspectRatio={cropType === 'avatar' ? 1 : 3}
            onCropComplete={handleCropComplete}
            onCancel={() => setIsCropModalOpen(false)}
          />
        )}
      </Modal>
    </>
  );
}
