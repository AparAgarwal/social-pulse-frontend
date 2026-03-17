import { useAuth } from '../lib/session/AuthContext';
import { SessionRevokedModal } from './ui/SessionRevokedModal';

export function GlobalModals() {
  const { isSessionRevoked, setIsSessionRevoked } = useAuth();

  return (
    <>
      <SessionRevokedModal 
        isOpen={isSessionRevoked} 
        onClose={() => setIsSessionRevoked(false)} 
      />
    </>
  );
}
