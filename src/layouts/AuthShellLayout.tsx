import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/session/AuthContext';
import { logoutUser } from '../lib/api/auth';
import { Home, User, PenSquare, Settings, LogOut, TrendingUp, Hash, Bell, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { ConfirmModal } from '../components/ui/ConfirmModal';


export function AuthShellLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Logic for responsive state based on user request:
  // > 1200px: Full Left Sidebar, Main, Right Sidebar
  // < 1200px: Icons Left Sidebar, Main, Right Sidebar
  // < 960px: Hamburger Navigation, Main, No Right Sidebar
  
  const showRightSidebar = windowWidth >= 960;
  const isDesktopNav = windowWidth >= 768;
  const isInitiallyCollapsed = windowWidth < 1200;
  
  // Decide sidebar width class
  const sidebarWidthClass = (isSidebarExpanded || !isInitiallyCollapsed) ? "w-64" : "w-20";

  const renderNavItems = (isMobile = false) => (
    <nav className={`flex flex-col gap-2 ${isMobile ? 'w-full px-4' : 'flex-1 w-full mt-2'}`}>
      {navItems.map((item) => {
        if (!user && (item.path === '/profile' || item.path === '/settings' || item.path === '/compose' || item.path === '/notifications')) {
          return null;
        }
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              `flex flex-row items-center gap-4 p-3 rounded-xl transition-all duration-300 group
              ${isActive 
                ? 'font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-[inset_0_0_15px_rgba(2,132,199,0.1)]' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`
            }
          >
            <item.icon className="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className={`text-lg ${(isSidebarExpanded || !isInitiallyCollapsed || isMobile) ? 'block' : 'hidden'}`}>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="h-screen bg-background text-gray-100 flex justify-center relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-[20%] -z-10 w-[800px] h-[800px] bg-primary-600/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Mobile Navigation Drawer (Hidden trigger, called via Outlet context) */}
      {!isDesktopNav && isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed top-0 left-0 bottom-0 w-[280px] bg-surface border-r border-white/10 z-[60] flex flex-col py-6 animate-in slide-in-from-left duration-300 shadow-2xl">
            <div className="flex items-center justify-between px-6 mb-8">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-white">SP</div>
                 <span className="text-xl font-black">SocialPulse</span>
               </div>
               <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                 <X className="w-6 h-6" />
               </button>
            </div>

            {renderNavItems(true)}

            <div className="mt-auto px-4 pt-4 border-t border-white/5">
              {user ? (
                <>
                  <button 
                    onClick={() => { setIsLogoutConfirmOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 p-3 rounded-xl w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                  >
                    <LogOut className="w-6 h-6" />
                    <span className="text-base font-medium">Log out</span>
                  </button>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="mt-4 flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                     <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center text-gray-300 font-bold border border-gray-600">
                       {user.profile?.avatar?.url ? (
                         <img src={`${user.profile.avatar.url}?v=${new Date(user.updatedAt).getTime()}`} className="w-full h-full object-cover" alt={user.username} />
                       ) : (
                         user.fullname?.charAt(0).toUpperCase() || '?'
                       )}
                     </div>
                     <div className="flex flex-col overflow-hidden">
                       <span className="font-semibold text-sm truncate group-hover:text-white">{user.fullname}</span>
                       <span className="text-gray-500 text-xs truncate">@{user.username}</span>
                     </div>
                  </Link>
                </>
              ) : (
                <div className="flex flex-col gap-3 pb-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                    <button className="w-full bg-primary-500 text-white font-bold py-3 rounded-xl">Log in</button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                    <button className="w-full border border-white/20 text-gray-200 font-bold py-3 rounded-xl">Sign up</button>
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      <div className="w-full max-w-7xl flex relative z-10">
        
        {/* Desktop Left Sidebar Navigation */}
        <aside className={`${isDesktopNav ? 'flex' : 'hidden'} ${sidebarWidthClass} transition-all duration-300 border-r border-white/5 h-screen sticky top-0 flex-col items-center py-6 px-3 bg-surface/30 backdrop-blur-xl group/sidebar`}>
          <div className={`flex items-center gap-3 mb-8 w-full cursor-pointer ${isInitiallyCollapsed && !isSidebarExpanded ? 'justify-center' : 'px-2'}`}>
            <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] transition-all duration-300">
              SP
            </div>
            <span className={`text-xl font-black tracking-tight transition-all duration-300 ${(isSidebarExpanded || !isInitiallyCollapsed) ? 'block' : 'hidden'}`}>SocialPulse</span>
          </div>
          
          {renderNavItems()}

          {/* Expand/Collapse Toggle Button */}
          {isInitiallyCollapsed && (
            <button 
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="mb-4 p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-all border border-transparent hover:border-white/10"
              title={isSidebarExpanded ? "Collapse" : "Expand"}
            >
              {isSidebarExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          )}

          {/* User Profile Snippet */}
          <div className="mt-auto w-full pt-4 border-t border-white/5">
            {user ? (
              <>
                <button 
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  className={`flex items-center gap-3 p-3 rounded-xl w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent transition-all duration-300 group ${isInitiallyCollapsed && !isSidebarExpanded ? 'justify-center' : ''}`}
                >
                  <LogOut className="w-6 h-6 flex-shrink-0" />
                  <span className={`text-base font-medium ${(isSidebarExpanded || !isInitiallyCollapsed) ? 'block' : 'hidden'}`}>Log out</span>
                </button>
                <Link to="/profile" className={`mt-4 flex items-center gap-3 rounded-xl hover:bg-white/5 py-2 transition-colors group cursor-pointer ${isInitiallyCollapsed && !isSidebarExpanded ? 'justify-center' : 'px-3'}`}>
                   <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center text-gray-300 font-bold border border-gray-600">
                     {user.profile?.avatar?.url ? (
                       <img src={`${user.profile.avatar.url}?v=${new Date(user.updatedAt).getTime()}`} className="w-full h-full object-cover" alt={user.username} />
                     ) : (
                       user.fullname?.charAt(0).toUpperCase() || '?'
                     )}
                   </div>
                   <div className={`flex flex-col overflow-hidden ${(isSidebarExpanded || !isInitiallyCollapsed) ? 'flex' : 'hidden'}`}>
                     <span className="font-semibold text-sm truncate group-hover:text-white transition-colors">{user.fullname}</span>
                     <span className="text-gray-500 text-xs truncate">@{user.username}</span>
                   </div>
                </Link>
              </>
            ) : (
              <div className={`flex flex-col gap-3 pb-2 ${isInitiallyCollapsed && !isSidebarExpanded ? 'items-center' : 'px-2'}`}>
                <Link to="/login" className="w-full">
                  <button className={`w-full bg-primary-500 hover:bg-primary-400 text-white font-bold py-2 rounded-xl transition-colors shadow-lg shadow-primary-500/20 ${(isSidebarExpanded || !isInitiallyCollapsed) ? 'px-4' : 'px-0 flex items-center justify-center'}`}>
                    {(isSidebarExpanded || !isInitiallyCollapsed) ? 'Log in' : <LogOut className="w-5 h-5" />}
                  </button>
                </Link>
                {(isSidebarExpanded || !isInitiallyCollapsed) && (
                  <Link to="/register" className="w-full">
                    <button className="w-full border border-white/20 hover:bg-white/5 text-gray-200 font-bold py-2 px-4 rounded-xl transition-colors">
                      Sign up
                    </button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main Feed Content Area */}
        <main className={`flex-1 min-w-0 border-x border-white/5 relative xl:max-w-2xl bg-surface/10 h-screen overflow-y-auto no-scrollbar pb-16 md:pb-0`}>
          <Outlet context={{ setIsMobileMenuOpen }} />
        </main>

        {/* Right Sidebar - Trends/Roadmap */}
        {showRightSidebar && (
          <aside className="w-80 h-screen sticky top-0 py-6 px-6 lg:block">
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
        )}
      </div>

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
