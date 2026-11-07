import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Percent,
} from 'lucide-react';
import { DashboardKPIs } from '../../types/trade';

interface NetProfitLossCardProps {
  kpis: DashboardKPIs;
  onOpenCapitalModal: () => void;
  className?: string;
}

export const NetProfitLossCard: React.FC<NetProfitLossCardProps> = ({
  kpis,
  onOpenCapitalModal,
  className = '',
}) => {
  const isNetProfitable = kpis.netProfit >= 0;
  const totalVolume = kpis.grossProfit + kpis.grossLoss;
  const profitShare = totalVolume > 0 ? (kpis.grossProfit / totalVolume) * 100 : 50;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 border flex flex-col justify-between transition-all ${
        isNetProfitable
          ? 'bg-gradient-to-br from-emerald-950/25 via-[#0d121c] to-[#0a0e17] border-emerald-500/30 shadow-sm shadow-emerald-500/5'
          : 'bg-gradient-to-br from-rose-950/25 via-[#0d121c] to-[#0a0e17] border-rose-500/30 shadow-sm shadow-rose-500/5'
      } ${className}`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Net Profit / Loss
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isNetProfitable
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
              }`}
            >
              {isNetProfitable ? 'PROFITABLE' : 'NET LOSS'}
            </span>
          </div>

          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isNetProfitable ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
            }`}
          >
            {isNetProfitable ? <TrendingUp className="w-4 h-4 stroke-[2.5]" /> : <TrendingDown className="w-4 h-4 stroke-[2.5]" />}
          </div>
        </div>

        {/* Hero Figure */}
        <div className="mt-3">
          <div
            className={`text-3xl sm:text-4xl font-black font-mono-nums tracking-tight ${
              isNetProfitable ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isNetProfitable ? '+' : ''}${kpis.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-2 font-mono-nums">
            <span>{kpis.totalTrades} executions</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{kpis.winningTrades}W / {kpis.losingTrades}L</span>
            {kpis.breakEvenTrades > 0 && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{kpis.breakEvenTrades}BE</span>
              </>
            )}
          </div>
        </div>

        {/* Gross Breakdown Bar */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-nums">
            <span className="flex items-center gap-1 text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Gross: +${kpis.grossProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Loss: -${kpis.grossLoss.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-rose-500/30 overflow-hidden flex">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${Math.max(0, Math.min(100, profitShare))}%` }}
              title={`Profit Share: ${profitShare.toFixed(1)}%`}
            />
          </div>
        </div>
      </div>

      {/* Bottom Summary Strip */}
      <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono-nums">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-400">
            <Percent className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-300 font-bold">{kpis.winRate}%</span>
          </div>
          <span aria-hidden="true" className="text-slate-700">|</span>
          <div className="flex items-center gap-1 text-slate-400">
            <Scale className="w-3 h-3 text-indigo-400" />
            <span className="text-slate-300 font-bold">{kpis.profitFactor} PF</span>
          </div>
        </div>

        <button
          onClick={onOpenCapitalModal}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer group"
          title="Manage Capital"
        >
          <Wallet className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          <span className="font-medium group-hover:text-emerald-400 transition-colors">
            ${kpis.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
        </button>
      </div>
    </div>
  );
};
