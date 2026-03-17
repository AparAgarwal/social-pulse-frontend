import { AlertCircle, X } from 'lucide-react';
import { Button } from './Button';

interface SessionRevokedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SessionRevokedModal({ isOpen, onClose }: SessionRevokedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-[40rem] bg-[#16181D] border border-white/5 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-12 flex flex-col items-center text-center">
          {/* Icon with Glow */}
          <div className="relative mb-2">
            <div className="w-24 h-24 bg-none rounded-full border-3 border-white/10 flex items-center justify-center relative">
              <AlertCircle className="w-15 h-15 text-white" strokeWidth={2} />
            </div>

            {/* Decorative Alert Lines */}
            <div className="absolute -top-3 right-3 w-1 h-2 bg-gray-500 rounded-full rotate-20"></div>

            <div className="absolute -top-2.5 right-0 w-1 h-4 bg-gray-600 rounded-full rotate-45"></div>

            <div className="absolute top-1 -right-2 w-1 h-3 bg-gray-700 rounded-full rotate-75"></div>
          </div>

          <h2 className="text-[28px] font-extrabold text-white mb-2 tracking-tight">
            Device got logged out
          </h2>

          <div className="text-[#8B8D98] text-[16px] leading-relaxed mb-10 max-w-[380px]">
            <p>You were logged out from your SocialPulse account. We request you to log in again to continue.</p>
          </div>

          <Button
            className="w-full h-16 rounded-2xl text-xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-400 hover:opacity-90 transition-all border-none active:scale-[0.98] cursor-pointer"
            onClick={() => {
              onClose();
              window.location.href = '/';
            }}
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
