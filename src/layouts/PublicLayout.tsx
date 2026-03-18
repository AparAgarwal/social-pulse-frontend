
import { Outlet, Link } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-white/5 bg-surface/40 backdrop-blur-xl fixed top-0 w-full z-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] group-hover:shadow-[0_0_25px_rgba(14,165,233,0.7)] group-hover:scale-105 transition-all duration-300">
            SP
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:glow-text transition-all duration-300">SocialPulse</span>
        </div>
        <nav className="flex items-center gap-3 sm:gap-6 text-sm font-medium">
          <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
            Log in
          </Link>
          <Link to="/register" className="bg-primary-600 hover:bg-primary-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all shadow-[0_0_10px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] hover:-translate-y-0.5">
            Sign up
          </Link>
        </nav>
      </header>
      
      <main>
        <Outlet />
      </main>

      <footer className="border-t border-gray-800 py-8 text-center text-xs text-gray-500 mt-auto">
        <p>© {new Date().getFullYear()} SocialPulse. Built with current constraints.</p>
      </footer>
    </div>
  );
}
