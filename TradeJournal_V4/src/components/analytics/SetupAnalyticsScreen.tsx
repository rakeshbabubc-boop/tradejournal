import React, { useMemo, useState } from 'react';
import {
  Layers,
  TrendingUp,
  Target,
  ArrowUpDown,
  Search,
  Sparkles,
  BarChart,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { useTrades } from '../../context/TradesContext';

type SortField = 'pnl' | 'winRate' | 'count' | 'expectancy';

export const SetupAnalyticsScreen: React.FC = () => {
  const { trades } = useTrades();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('pnl');

  const setupStats = useMemo(() => {
    const map = new Map<
      string,
      {
        setup: string;
        count: number;
        wins: number;
        losses: number;
        pnl: number;
        grossProfit: number;
        grossLoss: number;
        totalConfidence: number;
      }
    >();

    trades.forEach((t) => {
      const name = t.setup?.trim() || 'Standard Execution';
      const existing = map.get(name) || {
        setup: name,
        count: 0,
        wins: 0,
        losses: 0,
        pnl: 0,
        grossProfit: 0,
        grossLoss: 0,
        totalConfidence: 0,
      };

      const val = Number(t.profitLoss) || 0;
      existing.count += 1;
      existing.pnl += val;
      existing.totalConfidence += Number(t.confidenceLevel) || 5;

      if (val > 0) {
        existing.wins += 1;
        existing.grossProfit += val;
      } else if (val < 0) {
        existing.losses += 1;
        existing.grossLoss += Math.abs(val);
      }

      map.set(name, existing);
    });

    return Array.from(map.values()).map((s) => {
      const winRate = s.count > 0 ? (s.wins / s.count) * 100 : 0;
      const profitFactor = s.grossLoss > 0 ? s.grossProfit / s.grossLoss : s.grossProfit > 0 ? 99.9 : 0;
      const expectancy = s.count > 0 ? s.pnl / s.count : 0;
      const avgConfidence = s.count > 0 ? s.totalConfidence / s.count : 5;

      return {
        setup: s.setup,
        count: s.count,
        wins: s.wins,
        losses: s.losses,
        pnl: Math.round(s.pnl * 100) / 100,
        winRate: Math.round(winRate * 10) / 10,
        profitFactor: Math.round(profitFactor * 100) / 100,
        expectancy: Math.round(expectancy * 100) / 100,
        avgConfidence: Math.round(avgConfidence * 10) / 10,
      };
    });
  }, [trades]);

  const filteredSetups = useMemo(() => {
    let result = [...setupStats];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((s) => s.setup.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      if (sortBy === 'pnl') return b.pnl - a.pnl;
      if (sortBy === 'winRate') return b.winRate - a.winRate;
      if (sortBy === 'count') return b.count - a.count;
      if (sortBy === 'expectancy') return b.expectancy - a.expectancy;
      return 0;
    });

    return result;
  }, [setupStats, searchTerm, sortBy]);

  const topSetup = filteredSetups.length > 0 ? filteredSetups[0] : null;

  return (
    <div className="space-y-6 pb-20">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="w-2 h-5 rounded-sm bg-cyan-500 inline-block" />
          Technical Setup Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Detailed edge profiling for your candlestick patterns, support/resistance levels, and indicators
        </p>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#0d121c] border border-white/[0.06] shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search setup name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-[#0a0e17] border border-white/[0.06] pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 text-xs">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="rounded-xl bg-[#0a0e17] border border-white/[0.06] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition cursor-pointer"
          >
            <option value="pnl">Highest Net P&L</option>
            <option value="winRate">Highest Win Rate</option>
            <option value="expectancy">Highest Expectancy</option>
            <option value="count">Most Traded Frequency</option>
          </select>
        </div>
      </div>

      {/* Setups Cards Grid */}
      {filteredSetups.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.05] bg-[#0d121c] p-12 text-center text-slate-400">
          <Layers className="w-10 h-10 mx-auto mb-2 text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-200">No setups found</h4>
          <p className="text-xs text-slate-500 mt-1">
            Specify technical setups (e.g. Bull Flag, VWAP Bounce) when logging trades to see setup stats.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredSetups.map((s) => {
            const isProfit = s.pnl >= 0;
            return (
              <div
                key={s.setup}
                className="p-5 rounded-2xl bg-[#0d121c] border border-white/[0.06] hover:border-white/[0.12] transition-colors shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base tracking-tight">{s.setup}</h3>
                    {/* Zero-Pill unboxed metadata with subtle dots */}
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 font-mono-nums">
                      <span>{s.count} executions</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-emerald-400 font-semibold">{s.wins}W</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-rose-400 font-semibold">{s.losses}L</span>
                    </p>
                  </div>

                  {/* Clean unboxed financial figure */}
                  <div className="text-right">
                    <span
                      className={`font-mono-nums font-extrabold text-base ${
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}${s.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="block text-[11px] text-slate-500 font-mono-nums">Net Realized</span>
                  </div>
                </div>

                {/* Win rate progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono-nums">
                    <span>Win Rate: <strong className="text-cyan-400 font-bold">{s.winRate}%</strong></span>
                    <span>Confidence: <strong className="text-amber-400 font-bold">{s.avgConfidence}/10</strong></span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#0a0e17] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${s.winRate}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Breakdown Row */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.05] text-xs font-mono-nums">
                  <div className="p-2.5 rounded-xl bg-[#0a0e17] border border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans">Expectancy / Trade</span>
                    <span className={s.expectancy >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {s.expectancy >= 0 ? '+' : ''}${s.expectancy.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0a0e17] border border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans">Profit Factor</span>
                    <span className="text-white font-bold">{s.profitFactor}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
