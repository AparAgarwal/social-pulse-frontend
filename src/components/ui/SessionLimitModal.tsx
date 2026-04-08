import { useState, useEffect, useCallback } from 'react';
import { Modal } from './Modal';
import { ActiveSessionsList } from './ActiveSessionsList';
import { getBlockedLoginSessions, revokeBlockedLoginSession } from '../../lib/api/auth';
import type { MaxSessionsReachedPayload, ActiveSession } from '../../lib/api/types';
import { AlertCircle, CircleX } from 'lucide-react';

interface SessionLimitModalProps {
  payload: MaxSessionsReachedPayload;
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export const SessionLimitModal = ({
  payload,
  isOpen,
  onClose,
  onRetry,
}: SessionLimitModalProps) => {
  // Helper to safely extract array from varying response structures
  const extractSessions = useCallback((data: unknown): ActiveSession[] => {
    if (Array.isArray(data)) return data;
    const d = data as Record<string, unknown>;
    if (d && Array.isArray(d.activeSessions)) return d.activeSessions as ActiveSession[];
    if (d && Array.isArray(d.sessions)) return d.sessions as ActiveSession[];
    return [];
  }, []);

  const [sessions, setSessions] = useState<ActiveSession[]>(() => extractSessions(payload));
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await getBlockedLoginSessions(payload.sessionManagementToken);
      const updatedSessions = extractSessions(data);
      setSessions(updatedSessions);
      
      // Auto-retry if limit reached is cleared
      if (updatedSessions.length < payload.maxActiveSessions) {
        onRetry();
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  }, [payload.sessionManagementToken, payload.maxActiveSessions, extractSessions, onRetry]);

  const handleRevoke = async (sessionId: string) => {
    setIsRevoking(true);
    setRevokingSessionId(sessionId);
    setError(null);
    try {
      await revokeBlockedLoginSession(payload.sessionManagementToken, sessionId);
      await fetchSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log out device. Please try again.');
      setIsRevoking(false);
      setRevokingSessionId(null);
    }
  };

  useEffect(() => {
    let active = true;
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSessions().then(() => {
        if (!active) return;
      });
    }
    return () => { active = false; };
  }, [isOpen, fetchSessions]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-3xl p-0 overflow-hidden bg-[#0F1014] border-white/5"
      showCloseButton={true}
    >
      <div className="flex flex-col md:flex-row min-h-[400px]">
        {/* Left Section: Illustration & Text */}
        <div className="w-full md:w-2/5 p-8 bg-gradient-to-br from-[#16181D] to-[#0F1014] flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-white/5">
          <div className="relative mb-8 flex items-center justify-center">
             <div className="w-24 h-24 bg-red-500/10 rounded-full border border-red-500/20 flex items-center justify-center relative hover:scale-105 transition-transform duration-500">
                <CircleX className="w-12 h-12 text-red-500" strokeWidth={1.5} />
                <div className="absolute inset-0 bg-red-500/5 blur-2xl rounded-full -z-10"></div>
             </div>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-3">Login Pending, Device Limit Reached</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your current plan supports {payload.maxActiveSessions} Devices only
          </p>
        </div>

        {/* Right Section: Session List */}
        <div className="w-full md:w-3/5 p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[17px] font-semibold text-white">Log Out 1 Device to Continue</h3>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex-1 overflow-y-auto no-scrollbar -mx-2 px-2">
            <ActiveSessionsList
              sessions={sessions}
              onRevoke={handleRevoke}
              isRevoking={isRevoking}
              revokingSessionId={revokingSessionId}
            />
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[11px] text-gray-600 text-center">
              Logging out from a device will allow you to continue on this device immediately.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
