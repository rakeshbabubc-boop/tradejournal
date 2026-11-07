import React from 'react';
import {
  Percent,
  Scale,
  Wallet,
  Zap,
  Target,
  ShieldAlert,
} from 'lucide-react';
import { DashboardKPIs } from '../../types/trade';

interface KPICardsProps {
  kpis: DashboardKPIs;
  onOpenCapitalModal: () => void;
  onNavigateToPerformance?: () => void;
  className?: string;
}

export const KPICards: React.FC<KPICardsProps> = ({
  kpis,
  onOpenCapitalModal,
  onNavigateToPerformance,
  className = '',
}) => {
  const isExpectancyPositive = kpis.expectancy >= 0;

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 ${className}`}>
      {/* 1. Win Rate Card */}
      <div className="relative overflow-hidden rounded-2xl p-4 border border-white/[0.06] bg-[#0d121c] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">
            Win Rate
          </span>
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Percent className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl font-extrabold font-mono-nums text-cyan-400 tracking-tight">
            {kpis.winRate}%
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#0a0e17] mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, kpis.winRate)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5 font-mono-nums">
            <span>{kpis.winningTrades}W</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{kpis.losingTrades}L</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{kpis.breakEvenTrades}BE</span>
          </div>
        </div>
      </div>

      {/* 2. Trader Score Card */}
      <div
        onClick={onNavigateToPerformance}
        className="relative overflow-hidden rounded-2xl p-4 border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-[#0d121c] to-[#0a0e17] hover:border-indigo-400/50 transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-300">
            Trader Score
          </span>
          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-extrabold font-mono-nums text-white tracking-tight">
              {kpis.traderScore.score}
            </span>
            <span className="text-xs text-slate-400 font-mono-nums">/100</span>
          </div>
          <div className="text-xs text-slate-300 mt-2 flex items-center justify-between">
            <span className="font-semibold text-emerald-400">{kpis.traderScore.grade}</span>
            <span className="text-indigo-400 text-[11px] font-medium group-hover:underline">Diagnostics &rarr;</span>
          </div>
        </div>
      </div>

      {/* 3. Profit Factor */}
      <div className="p-4 rounded-xl bg-[#0d121c] border border-white/[0.05] hover:border-white/[0.12] transition-colors shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Profit Factor</span>
          <Scale className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="mt-1">
          <div className="text-lg sm:text-xl font-bold font-mono-nums text-cyan-300">
            {kpis.profitFactor}
          </div>
          <span className="text-[11px] text-slate-500 font-mono-nums block mt-1">Benchmark &gt; 1.5</span>
        </div>
      </div>

      {/* 4. Expectancy */}
      <div className="p-4 rounded-xl bg-[#0d121c] border border-white/[0.05] hover:border-white/[0.12] transition-colors shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Expectancy</span>
          <Target className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="mt-1">
          <div
            className={`text-lg sm:text-xl font-bold font-mono-nums ${
              isExpectancyPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isExpectancyPositive ? '+' : ''}${kpis.expectancy.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 font-mono-nums block mt-1">Expected / trade</span>
        </div>
      </div>

      {/* 5. Max Drawdown */}
      <div className="p-4 rounded-xl bg-[#0d121c] border border-white/[0.05] hover:border-white/[0.12] transition-colors shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Max Drawdown</span>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="mt-1">
          <div className="text-lg sm:text-xl font-bold font-mono-nums text-rose-400">
            -${kpis.maxDrawdown.toFixed(0)}
          </div>
          <span className="text-[11px] text-rose-400/80 font-mono-nums block mt-1">-{kpis.maxDrawdownPercentage}% peak</span>
        </div>
      </div>

      {/* 6. Account Capital */}
      <div
        onClick={onOpenCapitalModal}
        className="p-4 rounded-xl bg-[#0d121c] border border-white/[0.05] hover:border-indigo-500/40 transition-colors cursor-pointer group shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Account Balance</span>
          <Wallet className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-1">
          <div className="text-lg sm:text-xl font-bold font-mono-nums text-white">
            ${kpis.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-indigo-400 font-medium group-hover:underline block mt-1">Manage Capital &rarr;</span>
        </div>
      </div>
    </div>
  );
};
