import React from 'react';
import {
  Plus,
  ArrowRight,
  History,
  TrendingUp,
  Layers,
  PieChart,
  Activity,
  Download,
} from 'lucide-react';
import { useTrades } from '../../context/TradesContext';
import { useAuth } from '../../context/AuthContext';
import { KPICards } from './KPICards';
import { NetProfitLossCard } from './NetProfitLossCard';
import { TradingCharts } from '../charts/TradingCharts';
import { downloadProjectZip } from '../../utils/downloadZip';
import { Trade } from '../../types/trade';
import { AppTab } from '../layout/Navbar';

interface DashboardScreenProps {
  onNavigateToTab: (tab: AppTab) => void;
  onOpenCapitalModal: () => void;
  onOpenBackupModal: () => void;
  onInspectTrade: (trade: Trade) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToTab,
  onOpenCapitalModal,
  onOpenBackupModal,
  onInspectTrade,
}) => {
  const { userProfile } = useAuth();
  const { trades, kpis } = useTrades();

  const recentTrades = trades.slice(0, 5);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0d121c] via-[#0b0f17] to-[#0d121c] p-6 rounded-2xl border border-white/[0.06] shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Trading Cockpit
            </h1>
            <span className="text-xs text-slate-400 font-mono-nums">
              ({trades.length} executions logged)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, <strong className="text-slate-200 font-medium">{userProfile?.name || 'Trader'}</strong>. Live edge analytics, mathematical expectancy, and portfolio discipline.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateToTab('entry')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/10 transition-colors active:scale-98 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Trade</span>
          </button>

          <button
            onClick={() => downloadProjectZip('TradeJournal-Project-Setup.zip')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-colors active:scale-98 cursor-pointer shrink-0"
            title="Download full project setup in ZIP file"
          >
            <Download className="w-4 h-4" />
            <span>Export Project (ZIP)</span>
          </button>
        </div>
      </div>

      {/* Top Cockpit: Net Profit / Loss Card next to Performance & Portfolio Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Left: Dedicated Net Profit / Loss Card */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col">
          <NetProfitLossCard
            kpis={kpis}
            onOpenCapitalModal={onOpenCapitalModal}
            className="h-full"
          />
        </div>

        {/* Right: Performance & Portfolio Analytics directly next to Net Profit / Loss */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Performance & Portfolio Analytics
            </h2>
            <span className="text-xs text-slate-400 font-mono-nums">
              {trades.length} Executions
            </span>
          </div>
          <TradingCharts trades={trades} initialCapital={userProfile?.initialCapital || 10000} />
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <KPICards
        kpis={kpis}
        onOpenCapitalModal={onOpenCapitalModal}
        onNavigateToPerformance={() => onNavigateToTab('performance_analytics')}
      />

      {/* Quick Analytics Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigateToTab('strategy_analytics')}
          className="flex items-center justify-between p-4 rounded-xl bg-[#0d121c] border border-white/[0.05] hover:border-emerald-500/30 transition-colors cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Strategy Analytics</p>
              <p className="text-[11px] text-slate-400">Playbook expectancy & metrics</p>
            </div>
          </div>
          <span className="text-slate-500 text-xs group-hover:text-emerald-400 transition-colors">&rarr;</span>
        </button>

        <button
          onClick={() => onNavigateToTab('setup_analytics')}
          className="flex items-center justify-between p-4 rounded-xl bg-[#0d121c] border border-white/[0.05] hover:border-cyan-500/30 transition-colors cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Setup Analytics</p>
              <p className="text-[11px] text-slate-400">Pattern edge & success rates</p>
            </div>
          </div>
          <span className="text-slate-500 text-xs group-hover:text-cyan-400 transition-colors">&rarr;</span>
        </button>

        <button
          onClick={() => onNavigateToTab('performance_analytics')}
          className="flex items-center justify-between p-4 rounded-xl bg-[#0d121c] border border-white/[0.05] hover:border-indigo-500/30 transition-colors cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Trader Score & Diagnostics</p>
              <p className="text-[11px] text-slate-400 font-mono-nums">Rating: {kpis.traderScore.score}/100 ({kpis.traderScore.grade})</p>
            </div>
          </div>
          <span className="text-slate-500 text-xs group-hover:text-indigo-400 transition-colors">&rarr;</span>
        </button>
      </div>

      {/* Recent Trades Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Recent Executions
          </h2>
          {trades.length > 0 && (
            <button
              onClick={() => onNavigateToTab('history')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentTrades.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.05] bg-[#0d121c] p-8 text-center text-slate-400">
            <Layers className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs text-slate-300 font-semibold">No trades logged yet</p>
            <p className="text-[11px] text-slate-500 mt-1">Tap "Log Trade" above to start your journal.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTrades.map((t) => {
              const isProfit = t.profitLoss >= 0;
              return (
                <div
                  key={t.id}
                  onClick={() => onInspectTrade(t)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#0d121c] border border-white/[0.05] hover:border-white/[0.12] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-1.5 h-6 rounded-full ${
                        isProfit ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2 font-mono-nums">
                        <span className="font-bold text-sm text-white">{t.symbol}</span>
                        <span
                          className={`text-xs font-bold ${
                            t.tradeType === 'SHORT'
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {t.tradeType || 'LONG'}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-xs text-slate-300 font-sans">{t.strategy}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-mono-nums">
                        <span>{t.tradeDate.split('T')[0]}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span>Qty: {t.quantity}</span>
                        {t.setup && (
                          <>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="text-slate-400 font-sans">{t.setup}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-bold font-mono-nums ${
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}${t.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] text-slate-500 block font-mono-nums">Confidence: {t.confidenceLevel}/10</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
