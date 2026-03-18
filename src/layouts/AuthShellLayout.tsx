
import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/session/AuthContext';
import { logoutUser } from '../lib/api/auth';
import { Home, User, PenSquare, Settings, LogOut, TrendingUp, Hash, Bell } from 'lucide-react';
import { ConfirmModal } from '../components/ui/ConfirmModal';


export function AuthShellLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);


  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: PenSquare, label: 'Compose', path: '/compose' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="h-screen bg-background text-gray-100 flex justify-center relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-[20%] -z-10 w-[800px] h-[800px] bg-primary-600/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-7xl flex relative z-10">
        
        {/* Left Sidebar Navigation (Desktop) */}
        <aside className="w-20 lg:w-64 border-r border-white/5 h-screen sticky top-0 hidden md:flex flex-col items-center lg:items-stretch py-6 px-2 lg:px-4 bg-surface/30 backdrop-blur-xl">
          <div className="flex items-center gap-3 lg:px-4 mb-8 group cursor-pointer">
            <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(14,165,233,0.8)] transition-all duration-300">
              SP
            </div>
            <span className="text-xl font-black tracking-tight hidden lg:block group-hover:glow-text transition-all duration-300">SocialPulse</span>
          </div>
          
          <nav className="flex flex-col gap-2 flex-1 w-full mt-2">
            {navItems.map((item) => {
              // Hide Profile, Settings, Compose, and Notifications if user is not logged in
              if (!user && (item.path === '/profile' || item.path === '/settings' || item.path === '/compose' || item.path === '/notifications')) {
                return null;
              }
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => 
                    `flex flex-row items-center gap-4 p-3 rounded-xl transition-all duration-300 group
                    ${isActive 
                      ? 'font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-[inset_0_0_15px_rgba(2,132,199,0.1)]' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`
                  }
                >
                  <item.icon className="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-lg hidden lg:block">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile Snippet / Guest Action in Sidebar */}
          <div className="mt-auto w-full pt-4 border-t border-white/5">
            {user ? (
              <>
                <button 
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  className="flex items-center gap-3 p-3 rounded-xl w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-300 group"
                >
                  <LogOut className="w-6 h-6 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-base font-medium hidden lg:block">Log out</span>
                </button>
                <Link to="/profile" className="mt-4 flex items-center gap-3 lg:px-3 rounded-xl hover:bg-white/5 py-2 transition-colors group cursor-pointer">
                   <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center text-gray-300 font-bold border border-gray-600">
                     {user.profile?.avatar?.url ? (
                       <img src={`${user.profile.avatar.url}?v=${new Date(user.updatedAt).getTime()}`} className="w-full h-full object-cover" alt={user.username} />
                     ) : (
                       user.fullname?.charAt(0).toUpperCase() || '?'
                     )}
                   </div>
                   <div className="hidden lg:flex flex-col overflow-hidden">
                     <span className="font-semibold text-sm truncate group-hover:text-white transition-colors">{user.fullname}</span>
                     <span className="text-gray-500 text-xs truncate">@{user.username}</span>
                   </div>
                </Link>
              </>
            ) : (
              <div className="flex flex-col gap-3 lg:px-2 pb-2">
                <Link to="/login" className="w-full">
                  <button className="w-full bg-primary-500 hover:bg-primary-400 text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-lg shadow-primary-500/20">
                    Log in
                  </button>
                </Link>
                <Link to="/register" className="w-full hidden lg:block">
                  <button className="w-full border border-white/20 hover:bg-white/5 text-gray-200 font-bold py-2 px-4 rounded-xl transition-colors">
                    Sign up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Main Feed Content Area */}
        <main className="flex-1 min-w-0 border-r border-white/5 relative xl:max-w-2xl bg-surface/10 h-screen overflow-y-auto no-scrollbar pb-16 md:pb-0">
          <Outlet />
        </main>

        {/* Right Sidebar - Trends/Roadmap */}
        <aside className="hidden xl:block w-80 h-screen sticky top-0 py-6 px-6">
          <div className="glass-panel rounded-2xl p-5 sticky top-6 hover:border-primary-500/30 transition-colors duration-500">
             <h3 className="font-bold text-lg mb-5 flex items-center gap-2 text-white">
               <TrendingUp className="w-5 h-5 text-accent animate-pulse" /> What's happening
             </h3>
             <div className="flex flex-col gap-6">
               <div className="flex flex-col gap-1.5 cursor-pointer group">
                 <span className="text-xs text-primary-400/80 font-medium flex items-center gap-1"><Hash className="w-3 h-3"/> ProfileUpdate</span>
                 <span className="font-bold text-gray-200 group-hover:text-primary-400 transition-colors">Profile management is live</span>
                 <span className="text-xs text-gray-500">Edit bio, avatar & banner</span>
               </div>
               <div className="flex flex-col gap-1.5 cursor-pointer group">
                 <span className="text-xs text-accent/80 font-medium flex items-center gap-1"><Hash className="w-3 h-3"/> Features</span>
                 <span className="font-bold text-gray-200 group-hover:text-accent transition-colors">Posts API coming next</span>
                 <span className="text-xs text-gray-500">CRUD + feed pagination</span>
               </div>
               <div className="flex flex-col gap-1.5 cursor-pointer group">
                 <span className="text-xs text-purple-400/80 font-medium flex items-center gap-1"><Hash className="w-3 h-3"/> Auth</span>
                 <span className="font-bold text-gray-200 group-hover:text-purple-400 transition-colors">JWT refresh token rotation</span>
                 <span className="text-xs text-gray-500">Secure cookie-based flow</span>
               </div>
             </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-x-3 gap-y-1 px-2 text-xs text-gray-500">
             <span>Terms of Service</span>
             <span>Privacy Policy</span>
             <span>© {new Date().getFullYear()} SocialPulse</span>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-surface/80 backdrop-blur-xl border-t border-white/5 md:hidden z-50 flex justify-around items-center h-16 px-2 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          if (!user && (item.path === '/profile' || item.path === '/settings' || item.path === '/compose' || item.path === '/notifications')) {
            return null;
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full h-full transition-all duration-300
                ${isActive 
                  ? 'text-primary-400' 
                  : 'text-gray-400 hover:text-white'}`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {isActive && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-400"></span>}
                </>
              )}
            </NavLink>
          );
        })}
        {user && (
           <button 
             onClick={() => setIsLogoutConfirmOpen(true)}
             className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-red-400 transition-colors"
           >
             <LogOut className="w-6 h-6" />
           </button>
        )}
        {!user && (
          <div className="flex w-full justify-around items-center px-4 gap-2">
            <Link to="/login" className="flex-1">
              <button className="w-full bg-primary-500 hover:bg-primary-400 text-white font-bold py-2 px-2 rounded-lg text-sm transition-colors">
                Log in
              </button>
            </Link>
            <Link to="/register" className="flex-1">
              <button className="w-full border border-white/20 hover:bg-white/5 text-gray-200 font-bold py-2 px-2 rounded-lg text-sm transition-colors">
                Sign up
              </button>
            </Link>
          </div>
        )}
      </nav>
      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Log Out Account?"
        message="Are you sure you want to log out? You will need to sign back in to access your profile and settings."
        confirmLabel="Log Out"
        variant="danger"
      />
    </div>
  );
}
