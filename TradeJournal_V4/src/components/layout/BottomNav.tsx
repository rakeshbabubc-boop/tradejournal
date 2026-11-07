import React, { useState } from 'react';
import {
  LayoutDashboard,
  History,
  Settings,
  PieChart,
  Layers,
  Activity,
  BarChart3,
  X,
} from 'lucide-react';
import { AppTab } from './Navbar';

interface BottomNavProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const [showAnalyticsMenu, setShowAnalyticsMenu] = useState(false);

  const isAnalyticsActive =
    currentTab === 'strategy_analytics' ||
    currentTab === 'setup_analytics' ||
    currentTab === 'performance_analytics';

  return (
    <>
      {/* Mobile Analytics Drawer / Quick Sheet */}
      {showAnalyticsMenu && (
        <div
          onClick={() => setShowAnalyticsMenu(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col justify-end p-4 lg:hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm mx-auto rounded-3xl bg-[#0d121c] border border-white/[0.08] p-5 shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Select Analytics View
              </span>
              <button
                onClick={() => setShowAnalyticsMenu(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                onClick={() => {
                  onSelectTab('strategy_analytics');
                  setShowAnalyticsMenu(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors text-left cursor-pointer ${
                  currentTab === 'strategy_analytics'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-[#0a0e17] hover:bg-white/[0.04] text-slate-200'
                }`}
              >
                <PieChart className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-xs">Strategy Analytics</p>
                  <p className="text-[11px] text-slate-400">Playbook expectancy & win rates</p>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectTab('setup_analytics');
                  setShowAnalyticsMenu(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors text-left cursor-pointer ${
                  currentTab === 'setup_analytics'
                    ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
                    : 'bg-[#0a0e17] hover:bg-white/[0.04] text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <p className="font-bold text-xs">Setup Analytics</p>
                  <p className="text-[11px] text-slate-400">Chart pattern performance</p>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectTab('performance_analytics');
                  setShowAnalyticsMenu(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors text-left cursor-pointer ${
                  currentTab === 'performance_analytics'
                    ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300'
                    : 'bg-[#0a0e17] hover:bg-white/[0.04] text-slate-200'
                }`}
              >
                <Activity className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <p className="font-bold text-xs">Performance Diagnostics</p>
                  <p className="text-[11px] text-slate-400">Trader Score & bias analysis</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#080b11]/95 backdrop-blur-lg border-t border-white/[0.06] px-2 py-1.5 safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Dashboard */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-colors cursor-pointer ${
              currentTab === 'dashboard'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">Dashboard</span>
          </button>

          {/* History */}
          <button
            onClick={() => onSelectTab('history')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-colors cursor-pointer ${
              currentTab === 'history'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px]">History</span>
          </button>

          {/* Analytics Menu Trigger */}
          <button
            onClick={() => setShowAnalyticsMenu(true)}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-colors cursor-pointer ${
              isAnalyticsActive
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px]">Analytics</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => onSelectTab('settings')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-colors cursor-pointer ${
              currentTab === 'settings'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px]">Settings</span>
          </button>
        </div>
      </nav>
    </>
  );
};
