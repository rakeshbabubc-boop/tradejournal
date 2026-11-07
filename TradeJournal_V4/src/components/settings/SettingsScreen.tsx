import React, { useState } from 'react';
import {
  Mail,
  Key,
  LogOut,
  Wallet,
  Database,
  Calendar,
  Copy,
  Check,
  Laptop,
  Download,
  FolderArchive,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTrades } from '../../context/TradesContext';
import { downloadProjectZip } from '../../utils/downloadZip';

interface SettingsScreenProps {
  onOpenCapitalModal: () => void;
  onOpenBackupModal: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onOpenCapitalModal,
  onOpenBackupModal,
}) => {
  const { currentUser, userProfile, logout } = useAuth();
  const { trades, kpis } = useTrades();
  const [copiedUid, setCopiedUid] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const copyUid = () => {
    if (currentUser?.uid) {
      navigator.clipboard.writeText(currentUser.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="w-2 h-5 rounded-sm bg-emerald-500 inline-block" />
          Settings & Profile
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Account identity, multi-device synchronization, and data export settings
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d121c] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-4">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || 'User'}
              className="w-16 h-16 rounded-2xl border border-white/[0.1] object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xl">
              {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'T'}
            </div>
          )}

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {userProfile?.name || currentUser?.displayName || 'Trader'}
              <span className="text-[11px] font-medium text-emerald-400">
                · Verified Account
              </span>
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono-nums">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              {currentUser?.email || userProfile?.email || 'No email attached'}
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono-nums">
              <Calendar className="w-3 h-3 text-slate-500" />
              Active since: {userProfile?.createdAt ? userProfile.createdAt.split('T')[0] : 'Today'}
            </p>
          </div>
        </div>

        {/* UID Display */}
        <div className="pt-3 border-t border-white/[0.05]">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0e17] border border-white/[0.05] text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <Key className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-slate-400 font-mono-nums text-[11px] truncate">
                UID: {currentUser?.uid}
              </span>
            </div>
            <button
              onClick={copyUid}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 ml-2 shrink-0 cursor-pointer"
            >
              {copiedUid ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedUid ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Device Synchronous Cloud Storage */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d121c] p-6 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Laptop className="w-4 h-4 text-cyan-400" />
          Cross-Device Sync
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your account automatically synchronizes identical trading data in real-time between your
          Android phone, Desktop PC, and Laptop. Offline entries will automatically push to the cloud once reconnected.
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono-nums">
          <div className="p-3 rounded-xl bg-[#0a0e17] border border-white/[0.05]">
            <span className="text-[10px] text-slate-500 block uppercase font-sans">Realtime Trades</span>
            <span className="text-white font-bold">{trades.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0a0e17] border border-white/[0.05]">
            <span className="text-[10px] text-slate-500 block uppercase font-sans">Cloud Engine</span>
            <span className="text-emerald-400 font-bold">Firebase Firestore</span>
          </div>
        </div>
      </div>

      {/* Export & Data Management */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d121c] p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            Project & Data Export
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Export your entire trading journal dataset or save offline archives. To export the full source code, use the AI Studio top toolbar export button.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={onOpenBackupModal}
            className="flex items-center justify-between p-4 rounded-xl bg-[#0a0e17] border border-white/[0.06] hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Database className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Export Trades</p>
                <p className="text-[11px] text-slate-400">CSV, Excel & JSON</p>
              </div>
            </div>
            <span className="text-slate-500 text-xs group-hover:text-emerald-400 transition-colors">&rarr;</span>
          </button>

          <a
            href="/TradeJournal-Project-Export.zip"
            download="TradeJournal-Project-Export.zip"
            onClick={(e) => {
              e.preventDefault();
              downloadProjectZip();
            }}
            className="flex items-center justify-between p-4 rounded-xl bg-[#0a0e17] border border-white/[0.06] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderArchive className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">Download Project ZIP</p>
                <p className="text-[11px] text-slate-400">Full Source Codebase</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </a>

          <button
            onClick={onOpenCapitalModal}
            className="flex items-center justify-between p-4 rounded-xl bg-[#0a0e17] border border-white/[0.06] hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Wallet className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">Capital Management</p>
                <p className="text-[11px] text-slate-400 font-mono-nums">Balance: ${kpis.currentBalance.toFixed(2)}</p>
              </div>
            </div>
            <span className="text-slate-500 text-xs group-hover:text-cyan-400 transition-colors">&rarr;</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-[#080b11] border border-white/[0.04] flex items-start gap-2.5 text-xs text-slate-400">
          <FolderArchive className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">Codebase Export:</strong> To download the complete TypeScript, React, and Vite source code repository or push directly to GitHub, click the <strong>Export</strong> button in the top right of the Google AI Studio toolbar.
          </p>
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full py-3 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          {loggingOut ? 'Signing Out...' : 'Sign Out of TradeJournal'}
        </button>
      </div>
    </div>
  );
};
