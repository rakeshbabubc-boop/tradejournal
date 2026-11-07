import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Compass,
  Zap,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';
import { useTrades } from '../../context/TradesContext';

export const PerformanceAnalyticsScreen: React.FC = () => {
  const { trades, kpis } = useTrades();

  // Long vs Short Direction Performance
  const directionStats = useMemo(() => {
    let longPnl = 0;
    let longWins = 0;
    let longCount = 0;

    let shortPnl = 0;
    let shortWins = 0;
    let shortCount = 0;

    trades.forEach((t) => {
      const pnl = Number(t.profitLoss) || 0;
      if (t.tradeType === 'SHORT') {
        shortCount++;
        shortPnl += pnl;
        if (pnl > 0) shortWins++;
      } else {
        longCount++;
        longPnl += pnl;
        if (pnl > 0) longWins++;
      }
    });

    return {
      long: {
        count: longCount,
        pnl: Math.round(longPnl * 100) / 100,
        winRate: longCount > 0 ? Math.round((longWins / longCount) * 100) : 0,
        expectancy: longCount > 0 ? Math.round((longPnl / longCount) * 100) / 100 : 0,
      },
      short: {
        count: shortCount,
        pnl: Math.round(shortPnl * 100) / 100,
        winRate: shortCount > 0 ? Math.round((shortWins / shortCount) * 100) : 0,
        expectancy: shortCount > 0 ? Math.round((shortPnl / shortCount) * 100) / 100 : 0,
      },
    };
  }, [trades]);

  // Day of Week Distribution
  const dayOfWeekStats = useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayMap = new Map<number, { count: number; pnl: number; wins: number }>();
    [1, 2, 3, 4, 5].forEach((d) => dayMap.set(d, { count: 0, pnl: 0, wins: 0 }));

    trades.forEach((t) => {
      const date = new Date(t.tradeDate);
      const day = date.getDay();
      if (day >= 1 && day <= 5) {
        const item = dayMap.get(day)!;
        const pnl = Number(t.profitLoss) || 0;
        item.count += 1;
        item.pnl += pnl;
        if (pnl > 0) item.wins += 1;
      }
    });

    return days.map((dayName, idx) => {
      const stats = dayMap.get(idx + 1)!;
      const winRate = stats.count > 0 ? Math.round((stats.wins / stats.count) * 100) : 0;
      return {
        day: dayName,
        count: stats.count,
        pnl: Math.round(stats.pnl * 100) / 100,
        winRate,
      };
    });
  }, [trades]);

  // Confidence Calibration Curve (1-4, 5-7, 8-10)
  const confidenceStats = useMemo(() => {
    const tiers = [
      { label: 'Low Confidence (1 - 4)', min: 1, max: 4, count: 0, pnl: 0, wins: 0 },
      { label: 'Medium Confidence (5 - 7)', min: 5, max: 7, count: 0, pnl: 0, wins: 0 },
      { label: 'High Confidence (8 - 10)', min: 8, max: 10, count: 0, pnl: 0, wins: 0 },
    ];

    trades.forEach((t) => {
      const conf = Number(t.confidenceLevel) || 5;
      const pnl = Number(t.profitLoss) || 0;
      const tier = tiers.find((tr) => conf >= tr.min && conf <= tr.max);
      if (tier) {
        tier.count++;
        tier.pnl += pnl;
        if (pnl > 0) tier.wins++;
      }
    });

    return tiers.map((tr) => ({
      ...tr,
      pnl: Math.round(tr.pnl * 100) / 100,
      winRate: tr.count > 0 ? Math.round((tr.wins / tr.count) * 100) : 0,
      expectancy: tr.count > 0 ? Math.round((tr.pnl / tr.count) * 100) / 100 : 0,
    }));
  }, [trades]);

  const score = kpis.traderScore;

  return (
    <div className="space-y-6 pb-20">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="w-2 h-5 rounded-sm bg-indigo-500 inline-block" />
          Trader Score & Execution Diagnostics
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Algorithmic discipline rating, behavioral biases, direction asymmetry, and weekly edge distribution
        </p>
      </div>

      {/* Trader Score Master Card */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-[#0d121c] to-[#0a0e17] p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold text-indigo-300 tracking-wider">
                Discipline & Edge Score
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                · {score.grade}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl sm:text-5xl font-black font-mono-nums text-white tracking-tight">
                {score.score}
              </span>
              <span className="text-slate-400 text-sm font-semibold font-mono-nums">/ 100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono-nums">
            <div className="p-3 rounded-xl bg-[#0a0e17] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block uppercase font-sans">Consistency</span>
              <span className="text-white font-bold">{score.consistencyScore} / 25</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0a0e17] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block uppercase font-sans">Profit Factor</span>
              <span className="text-white font-bold">{score.profitFactorScore} / 25</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0a0e17] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block uppercase font-sans">Expectancy</span>
              <span className="text-white font-bold">{score.expectancyScore} / 25</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0a0e17] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block uppercase font-sans">Drawdown Ctrl</span>
              <span className="text-white font-bold">{score.riskDisciplineScore} / 25</span>
            </div>
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="pt-4 border-t border-white/[0.05] space-y-2">
          <span className="text-xs font-semibold text-indigo-200 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Execution Recommendations
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {score.recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-3 rounded-xl bg-[#0a0e17] border border-white/[0.05] text-xs text-slate-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Long vs Short Direction Asymmetry */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d121c] p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          Direction Asymmetry: Long vs Short
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Long Trades */}
          <div className="p-5 rounded-xl bg-[#0a0e17] border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                LONG POSITIONS
              </span>
              <span className="font-mono-nums text-xs text-slate-400">
                {directionStats.long.count} Trades
              </span>
            </div>

            <div className="text-xl font-extrabold font-mono-nums text-white">
              <span className={directionStats.long.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {directionStats.long.pnl >= 0 ? '+' : ''}${directionStats.long.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-mono-nums">
              <span>Win Rate: <strong className="text-cyan-400">{directionStats.long.winRate}%</strong></span>
              <span>Exp: <strong className={directionStats.long.expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                ${directionStats.long.expectancy}
              </strong></span>
            </div>
          </div>

          {/* Short Trades */}
          <div className="p-5 rounded-xl bg-[#0a0e17] border border-rose-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400 text-xs flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                SHORT POSITIONS
              </span>
              <span className="font-mono-nums text-xs text-slate-400">
                {directionStats.short.count} Trades
              </span>
            </div>

            <div className="text-xl font-extrabold font-mono-nums text-white">
              <span className={directionStats.short.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {directionStats.short.pnl >= 0 ? '+' : ''}${directionStats.short.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-mono-nums">
              <span>Win Rate: <strong className="text-cyan-400">{directionStats.short.winRate}%</strong></span>
              <span>Exp: <strong className={directionStats.short.expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                ${directionStats.short.expectancy}
              </strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Level Calibration */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d121c] p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-amber-400" />
          Confidence Calibration Matrix (1 - 10 Scale)
        </h3>
        <p className="text-xs text-slate-400">
          Evaluates if higher self-reported conviction correlates with greater statistical expectancy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {confidenceStats.map((tier) => {
            const isProfit = tier.pnl >= 0;
            return (
              <div
                key={tier.label}
                className="p-4 rounded-xl bg-[#0a0e17] border border-white/[0.05] hover:border-white/[0.1] transition-colors space-y-2"
              >
                <div className="text-xs font-semibold text-slate-200">{tier.label}</div>
                <div className="flex items-baseline justify-between font-mono-nums">
                  <span className="text-xs text-slate-500">{tier.count} trades</span>
                  <span className={`font-extrabold text-sm ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfit ? '+' : ''}${tier.pnl.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono-nums pt-1 border-t border-white/[0.05]">
                  <span>Win Rate: <strong className="text-cyan-400">{tier.winRate}%</strong></span>
                  <span>Exp: <strong className={tier.expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    ${tier.expectancy}
                  </strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day of Week Trading Distribution */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d121c] p-6 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          Day of the Week Edge Distribution
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          {dayOfWeekStats.map((d) => {
            const isProfit = d.pnl >= 0;
            return (
              <div
                key={d.day}
                className="p-3 rounded-xl bg-[#0a0e17] border border-white/[0.05] text-center space-y-1"
              >
                <span className="text-xs font-semibold text-white block">{d.day}</span>
                <span
                  className={`text-xs font-extrabold font-mono-nums block ${
                    isProfit ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isProfit ? '+' : ''}${d.pnl.toFixed(0)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono-nums block">
                  {d.count} trades ({d.winRate}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
