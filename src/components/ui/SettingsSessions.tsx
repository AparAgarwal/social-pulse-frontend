import { useState, useEffect, useCallback } from 'react';
import { ActiveSessionsList } from '../ui/ActiveSessionsList';
import { getActiveSessions, revokeActiveSession } from '../../lib/api/auth';
import type { ActiveSession } from '../../lib/api/types';
import { useAuth } from '../../lib/session/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { ConfirmModal } from '../ui/ConfirmModal';

export const SettingsSessions = () => {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Confirm Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingLogoutId, setPendingLogoutId] = useState<string | null>(null);

  const { logout } = useAuth();

  const extractSessions = useCallback((data: unknown): ActiveSession[] => {
    if (Array.isArray(data)) return data;
    const d = data as Record<string, unknown>;
    if (d && Array.isArray(d.activeSessions)) return d.activeSessions as ActiveSession[];
    if (d && Array.isArray(d.sessions)) return d.sessions as ActiveSession[];
    return [];
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await getActiveSessions();
      setSessions(extractSessions(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch active sessions');
    } finally {
      setIsLoading(false);
    }
  }, [extractSessions]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevoke = async (sessionId: string) => {
    const session = sessions.find(s => s.sessionId === sessionId);
    if (!session) return;

    if (session.isCurrent) {
      setPendingLogoutId(sessionId);
      setIsConfirmOpen(true);
      return;
    }

    executeRevoke(sessionId);
  };

  const executeRevoke = async (sessionId: string) => {
    setIsRevoking(true);
    setRevokingSessionId(sessionId);
    setError(null);
    try {
      await revokeActiveSession(sessionId);
      
      const session = sessions.find(s => s.sessionId === sessionId);
      if (session?.isCurrent) {
        logout();
        return;
      }
      
      await fetchSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke session');
      setIsRevoking(false);
      setRevokingSessionId(null);
    } finally {
      setIsConfirmOpen(false);
      setPendingLogoutId(null);
    }
  };

  if (isLoading) {
    return <div className="py-10 text-center text-gray-400">Loading active sessions...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <ShieldAlert className="w-20 h-20 text-indigo-400" />
        </div>
        <div className="flex flex-col gap-2 relative z-10">
          <h3 className="text-xl font-black text-white glow-text">Security & Sessions</h3>
          <p className="text-sm text-indigo-200/70 leading-relaxed max-w-md font-medium">
            Manage your active digital presence. These are the devices that currently have access to your SocialPulse account.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-sm font-medium text-red-500">
          {error}
        </div>
      )}

      <ActiveSessionsList
        sessions={sessions}
        onRevoke={handleRevoke}
        isRevoking={isRevoking}
        revokingSessionId={revokingSessionId}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => pendingLogoutId && executeRevoke(pendingLogoutId)}
        title="Log Out Current Device?"
        message="Logging out from this device will end your current session. You will need to log in again to access your account."
        confirmLabel="Log Out"
        variant="danger"
        isLoading={isRevoking}
      />
    </div>
  );
};
