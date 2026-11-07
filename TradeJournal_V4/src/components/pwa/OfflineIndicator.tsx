import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full bg-amber-500/95 text-slate-950 px-4 py-2 text-xs font-semibold shadow-2xl backdrop-blur-md border border-amber-400 animate-bounce">
      <WifiOff className="w-4 h-4 text-slate-950" />
      <span>Offline Mode — Changes saved to device & will auto-sync to Firebase</span>
      <Database className="w-3.5 h-3.5 opacity-80" />
    </div>
  );
};
