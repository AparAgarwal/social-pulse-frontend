import { useAuth } from '../lib/session/AuthContext';
import { Clock, Hammer, Image as ImageIcon, Smile, MessageCircle, Heart, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col w-full">
      {/* Top Header sticky */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/60 border-b border-white/5 p-4 flex items-center gap-6">
        <h1 className="text-xl font-bold">Home</h1>
      </header>

      {/* Feed Composer Placeholder */}
      <div className="border-b border-white/5 p-4 flex gap-4 bg-surface/20 transition-colors hover:bg-surface/30">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex-shrink-0 flex items-center justify-center font-bold text-gray-200 shadow-inner overflow-hidden border border-white/5">
          {user ? (
            user.avatarUrl ? (
              <img src={`${user.avatarUrl}?v=${new Date(user.updatedAt).getTime()}`} className="w-full h-full object-cover" alt={user.username} />
            ) : (
              user.fullname.charAt(0).toUpperCase() || 'U'
            )
          ) : (
            'G'
          )}
        </div>
        <div className="flex-1 flex flex-col gap-3 pt-1">
          <textarea
            placeholder={user ? "What's on your mind?" : "Log in to join the conversation..."}
            maxLength={280}
            className="w-full bg-transparent resize-none outline-none text-xl placeholder:text-gray-500 min-h-[60px] overflow-hidden focus:placeholder-gray-400 transition-colors"
            disabled
          />
          <div className="flex items-center justify-between border-t border-white/5 pt-3 opacity-60 cursor-not-allowed">
            <div className="flex text-primary-400 gap-4">
              <div className="p-2 -ml-2 rounded-full hover:bg-primary-500/10 transition-colors"><ImageIcon className="w-5 h-5" /></div>
              <div className="p-2 rounded-full hover:bg-primary-500/10 transition-colors"><Smile className="w-5 h-5" /></div>
            </div>
            <Button size="sm" disabled className="rounded-full px-6 font-bold shadow-lg">Post</Button>
          </div>

          {!user ? (
            <p className="text-xs text-primary-400 flex items-center gap-1.5 mt-2 bg-primary-500/10 w-fit px-2 py-1 rounded-md border border-primary-500/20">
              <MessageCircle className="w-3 h-3" />
              You must be logged in to post.
            </p>
          ) : (
            <p className="text-xs text-accent flex items-center gap-1.5 mt-2 bg-accent/10 w-fit px-2 py-1 rounded-md border border-accent/20">
              <Hammer className="w-3 h-3" />
              Posting unlocks when the Posts API is deployed.
            </p>
          )}
        </div>
      </div>

      {/* Feed placeholder items */}
      <div className="flex-1">
        <div className="p-8 flex flex-col items-center justify-center text-center opacity-80 gap-5 my-12 animate-float" style={{ animationDuration: '8s' }}>
          <div className="w-20 h-20 rounded-full bg-surface/50 border border-white/10 flex items-center justify-center shadow-2xl mb-2">
            <Clock className="w-10 h-10 text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Your feed is waiting</h2>
          <p className="max-w-md text-gray-400 leading-relaxed">
            {user ? "The feed logic is being wired into the backend right now. Once it's ready, this space will fill up with posts from your network." : "Welcome to SocialPulse! Log in to start building your network and seeing posts from people you follow."}
          </p>
          {user ? (
            <Link to="/profile">
              <Button variant="outline" className="mt-6 rounded-full px-8 interactive-hover border-primary-500/30 hover:bg-primary-500/10 hover:text-primary-400">
                View your profile instead
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button className="mt-6 rounded-full px-8 interactive-hover shadow-lg shadow-primary-500/20 font-bold">
                Log in to SocialPulse
              </Button>
            </Link>
          )}
        </div>

        {/* Fake disabled post for visual aesthetic density */}
        <div className="border-b border-white/5 p-4 flex gap-4 opacity-60 select-none pointer-events-none hover:bg-surface/10 transition-colors">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex-shrink-0 shadow-[0_0_15px_rgba(236,72,153,0.3)]" />
          <div className="flex-1">
            <div className="flex items-center gap-1 text-sm">
              <span className="font-bold text-gray-100">System Bot</span>
              <span className="text-gray-500">@system</span>
              <span className="text-gray-500">· 2h</span>
            </div>
            <p className="mt-1 text-gray-200">
              Welcome to SocialPulse! The UI is looking great so far. We are just waiting for the database tables for Posts and Comments to be finalized. Let's build! 🚀
            </p>
            <div className="flex justify-between max-w-sm mt-3 text-gray-500">
              <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> 0</span>
              <span className="flex items-center gap-2"><Heart className="w-4 h-4" /> 1</span>
              <span className="flex items-center gap-2"><Share2 className="w-4 h-4" /> 0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
