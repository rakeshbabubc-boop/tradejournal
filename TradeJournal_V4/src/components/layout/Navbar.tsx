import React from 'react';
import {
  TrendingUp,
  LayoutDashboard,
  History,
  PieChart,
  Layers,
  Activity,
  Settings,
  Wallet,
  Wifi,
  WifiOff,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTrades } from '../../context/TradesContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { downloadProjectZip } from '../../utils/downloadZip';

export type AppTab =
  | 'dashboard'
  | 'entry'
  | 'history'
  | 'strategy_analytics'
  | 'setup_analytics'
  | 'performance_analytics'
  | 'settings';

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenCapitalModal: () => void;
  onOpenBackupModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCapitalModal,
}) => {
  const { currentUser } = useAuth();
  const { kpis } = useTrades();
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 bg-[#080b11]/95 backdrop-blur-md border-b border-white/[0.06] px-4 sm:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 p-[1px] shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[7px] bg-[#0c111c] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <span className="font-extrabold text-base tracking-tight text-white whitespace-nowrap">
            TradeJournal
          </span>
        </div>

        {/* Zone 2: Navigation Links (Clean single-line text links / segmented bar) */}
        <nav className="hidden lg:flex items-center gap-1 rounded-xl bg-[#0e1320]/80 p-1 border border-white/[0.05] text-xs">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'dashboard'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'history'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History
          </button>
          <button
            onClick={() => onSelectTab('strategy_analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'strategy_analytics'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Strategy
          </button>
          <button
            onClick={() => onSelectTab('setup_analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'setup_analytics'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Setups
          </button>
          <button
            onClick={() => onSelectTab('performance_analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'performance_analytics'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Performance
          </button>
          <button
            onClick={() => onSelectTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'settings'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Online/Offline indicator */}
          <div
            className={`flex items-center gap-1.5 text-xs font-mono-nums ${
              isOnline ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px] font-medium">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Quick Balance pill */}
          <button
            onClick={onOpenCapitalModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1320] border border-white/[0.06] hover:border-white/[0.12] transition-colors text-xs font-mono-nums text-slate-200 cursor-pointer"
            title="Capital Management"
          >
            <Wallet className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">${kpis.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
          </button>

          {/* Quick Direct Download ZIP Button */}
          <a
            href="/TradeJournal-Project-Export.zip"
            download="TradeJournal-Project-Export.zip"
            onClick={(e) => {
              e.preventDefault();
              downloadProjectZip();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
            title="Download Complete Project ZIP to Local Machine"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Download ZIP</span>
          </a>

          {/* User Profile Avatar */}
          <button
            onClick={() => onSelectTab('settings')}
            className="flex items-center p-0.5 rounded-lg hover:ring-2 hover:ring-white/20 transition cursor-pointer"
            title="Account Profile"
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Profile"
                className="w-8 h-8 rounded-lg object-cover border border-white/[0.1]"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'T'}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
