import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, AlertCircle, Info, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
  isLoading = false,
}: ConfirmModalProps) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger': return <AlertTriangle className="w-12 h-12 text-red-500" />;
      case 'warning': return <AlertCircle className="w-12 h-12 text-amber-500" />;
      case 'info': return <Info className="w-12 h-12 text-primary-500" />;
      default: return <HelpCircle className="w-12 h-12 text-primary-500" />;
    }
  };

  const getVariantBg = () => {
    switch (variant) {
      case 'danger': return 'bg-red-500/10';
      case 'warning': return 'bg-amber-500/10';
      case 'info': return 'bg-primary-500/10';
      default: return 'bg-primary-500/10';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md p-0 overflow-hidden border-white/10 glass-panel shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      showCloseButton={false}
    >
      <div className="p-8">
        <div className="flex flex-col items-center text-center gap-2">
          <div className={`p-6 rounded-full ${getVariantBg()}`}>
            {getIcon()}
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-black text-white tracking-tight">{title}</h3>
            <p className="text-[15px] text-gray-400 leading-relaxed px-2">
              {message}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
            <Button
              variant="outline"
              className="flex-1 border-white/10 hover:bg-white/5 order-2 sm:order-1 h-12 font-semibold"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              className={`flex-1 order-1 sm:order-2 h-12 font-bold shadow-lg transition-all duration-300 ${variant === 'danger'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border-none text-white shadow-red-900/20'
                  : 'shadow-primary-500/20 text-white'
                }`}
              onClick={onConfirm}
              isLoading={isLoading}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
