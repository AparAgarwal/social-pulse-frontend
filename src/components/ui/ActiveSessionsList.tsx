import type { ActiveSession } from '../../lib/api/types';
import { Button } from './Button';
import { Monitor, Smartphone, Tablet, Clock } from 'lucide-react';
import { formatRelativeTime } from '../../lib/utils/date';

interface ActiveSessionsListProps {
  sessions: ActiveSession[];
  onRevoke: (sessionId: string) => Promise<void>;
  isRevoking: boolean;
  revokingSessionId: string | null;
}

export const ActiveSessionsList = ({
  sessions,
  onRevoke,
  isRevoking,
  revokingSessionId,
}: ActiveSessionsListProps) => {
  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType.toLowerCase();
    if (type.includes('desktop')) return <Monitor className="w-5 h-5" />;
    if (type.includes('mobile')) return <Smartphone className="w-5 h-5" />;
    if (type.includes('tablet')) return <Tablet className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  return (
    <div className="space-y-3">
      {!Array.isArray(sessions) || sessions.length === 0 ? (
        <div className="py-6 text-center bg-white/5 rounded-xl border border-white/5">
          <p className="text-sm text-gray-500">No active sessions found.</p>
        </div>
      ) : (
        sessions.map((session) => (
          <div
            key={session.sessionId}
            className={`flex items-center justify-between gap-4 p-3 rounded-xl border transition-all duration-300 ${
              session.isCurrent 
                ? 'bg-primary-500/5 border-primary-500/20' 
                : 'bg-transparent border-white/5 hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className={`p-2 rounded-lg ${
                session.isCurrent ? 'bg-primary-500/20 text-primary-400' : 'bg-white/5 text-gray-400'
              }`}>
                {getDeviceIcon(session.deviceType)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white truncate text-[14px]">
                    {session.browser} {session.os.includes('Windows') ? 'on Windows' : `on ${session.os}`}
                  </span>
                  {session.isCurrent && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-primary-500/20 text-primary-400 rounded">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last used: {formatRelativeTime(session.lastUsedAt)}</span>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRevoke(session.sessionId)}
              disabled={isRevoking}
              isLoading={isRevoking && revokingSessionId === session.sessionId}
              className="bg-white/5 border-white/10 hover:bg-white/10 text-xs px-4 h-8 shrink-0"
            >
              Log Out
            </Button>
          </div>
        ))
      )}
    </div>
  );
};
