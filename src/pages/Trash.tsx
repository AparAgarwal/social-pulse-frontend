import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Trash2, Info } from 'lucide-react';
import { useTrashQuery } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';

export const TrashPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useTrashQuery(1, 50);
  const posts = data?.posts || [];

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/60 border-b border-white/5 p-4 flex items-center gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Trash</h1>
          <p className="text-xs text-gray-500">Posts here will be permanently deleted after 30 days.</p>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full border-x border-white/5 bg-surface/5">
        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        ) : posts.length > 0 ? (
          <div>
            <div className="p-4 bg-primary-500/5 border-b border-white/5 flex gap-3 items-start">
               <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
               <p className="text-sm text-gray-400">
                 You can restore posts to your feed or delete them permanently. 
                 Expired items are automatically cleaned up.
               </p>
            </div>
            {posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                mode="trash" 
              />
            ))}
          </div>
        ) : (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Trash is empty</h2>
              <p className="text-gray-500 mt-1">Deleted posts will appear here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
