import { useState, useEffect } from 'react';
import { UserX, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { getFollowers, getFollowing } from '../../lib/api/user';
import { Button } from './Button';
import { Link } from 'react-router-dom';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  type: 'followers' | 'following';
}

export function FollowListModal({ isOpen, onClose, username, type }: FollowListModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (isOpen && username) {
      setUsers([]);
      setPage(1);
      setError(null);
      fetchUsers(1);
    }
  }, [isOpen, username, type]);

  const fetchUsers = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = type === 'followers' 
        ? await getFollowers(username, pageNum, 20)
        : await getFollowing(username, pageNum, 20);
      
      const newUsers = type === 'followers' ? response.followers || [] : response.following || [];
      
      if (pageNum === 1) {
        setUsers(newUsers);
      } else {
        setUsers(prev => [...prev, ...newUsers]);
      }
      
      setHasMore(response.pagination?.hasMore || false);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchUsers(page + 1);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={type === 'followers' ? 'Followers' : 'Following'}>
      <div className="flex flex-col h-[60vh] max-h-[500px]">
        {error && (
          <div className="p-4 text-center text-red-400 border-b border-white/5 bg-red-500/10">
            {error}
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-2 no-scrollbar flex flex-col gap-1">
          {users.length === 0 && !loading && !error && (
             <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 gap-3 py-10">
                <UserX className="w-10 h-10 opacity-50" />
                <p>No {type} found.</p>
             </div>
          )}

          {users.map((u) => (
            <Link 
              key={u.username} 
              to={`/u/${u.username}`}
              onClick={onClose}
              className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface border border-white/10 flex-shrink-0 flex items-center justify-center text-lg font-bold text-gray-300">
                 {u.profile?.avatar?.url ? (
                    <img src={u.profile.avatar.url} alt={u.username} className="w-full h-full object-cover" />
                 ) : (
                    u.fullname.charAt(0).toUpperCase()
                 )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white truncate group-hover:text-primary-400 transition-colors">{u.fullname}</div>
                <div className="text-gray-500 text-sm truncate">@{u.username}</div>
                {u.profile?.bio && (
                  <div className="text-gray-300 text-sm truncate mt-0.5">{u.profile.bio}</div>
                )}
              </div>
            </Link>
          ))}
          
          {loading && (
             <div className="flex justify-center p-6">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
             </div>
          )}

          {hasMore && !loading && (
            <div className="p-4 text-center">
              <Button variant="outline" size="sm" onClick={handleLoadMore}>
                Load more
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
