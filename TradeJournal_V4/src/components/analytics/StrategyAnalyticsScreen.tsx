import React, { useMemo, useState } from 'react';
import {
  PieChart,
  Award,
  Scale,
  Target,
  BarChart2,
  Plus,
} from 'lucide-react';
import { useTrades } from '../../context/TradesContext';

export const StrategyAnalyticsScreen: React.FC = () => {
  const { trades, kpis, strategies, addCustomStrategy } = useTrades();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStrategyName, setNewStrategyName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newStrategyName.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      await addCustomStrategy(trimmed);
      setNewStrategyName('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding custom strategy:', err);
    } finally {
      setSaving(false);
    }
  };

  const strategyStats = useMemo(() => {
    return strategies.map((strat) => {
      const stratTrades = trades.filter((t) => t.strategy === strat);
      const count = stratTrades.length;
      let pnl = 0;
      let wins = 0;
      let losses = 0;
      let grossProfit = 0;
      let grossLoss = 0;
      let maxWin = 0;
      let maxLoss = 0;

      stratTrades.forEach((t) => {
        const val = Number(t.profitLoss) || 0;
        pnl += val;
        if (val > 0) {
          wins++;
          grossProfit += val;
          if (val > maxWin) maxWin = val;
        } else if (val < 0) {
          losses++;
          grossLoss += Math.abs(val);
          if (val < maxLoss) maxLoss = val;
        }
      });

      const winRate = count > 0 ? (wins / count) * 100 : 0;
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.9 : 0;
      const avgWin = wins > 0 ? grossProfit / wins : 0;
      const avgLoss = losses > 0 ? grossLoss / losses : 0;
      const expectancy = count > 0 ? pnl / count : 0;
      const payoffRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 5 : 0;

      return {
        strategy: strat,
        count,
        pnl: Math.round(pnl * 100) / 100,
        wins,
        losses,
        winRate: Math.round(winRate * 10) / 10,
        profitFactor: Math.round(profitFactor * 100) / 100,
        expectancy: Math.round(expectancy * 100) / 100,
        avgWin: Math.round(avgWin * 100) / 100,
        avgLoss: Math.round(avgLoss * 100) / 100,
        payoffRatio: Math.round(payoffRatio * 100) / 100,
        maxWin: Math.round(maxWin * 100) / 100,
        maxLoss: Math.round(maxLoss * 100) / 100,
        frequencyPct: trades.length > 0 ? Math.round((count / trades.length) * 100) : 0,
      };
    }).sort((a, b) => b.pnl - a.pnl);
  }, [trades, strategies]);

  const activeStrategies = strategyStats.filter((s) => s.count > 0);
  const bestStrategy = activeStrategies.length > 0 ? activeStrategies[0] : null;
  const highestWinRate = activeStrategies.length > 0
    ? [...activeStrategies].sort((a, b) => b.winRate - a.winRate)[0]
    : null;

  const maxPnl = Math.max(1, ...strategyStats.map((s) => Math.abs(s.pnl)));

  return (
    <div className="space-y-6 pb-20">
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-5 rounded-sm bg-emerald-500 inline-block" />
            Strategy Playbook Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate expectancy, payoff ratios, and edge consistency across your trading setups
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-xs transition-colors active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Playbook Entry</span>
        </button>
      </div>

      {/* Add New Strategy Form Card */}
      {showAddModal && (
        <div className="p-4 rounded-2xl bg-[#0d121c] border border-emerald-500/30 space-y-2 animate-in fade-in duration-150">
          <h3 className="text-xs font-bold text-emerald-400">Add New Strategy to Playbook</h3>
          <form onSubmit={handleAddStrategy} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. Mean Reversion, Gap Fill, Opening Range Breakout (ORB)"
              value={newStrategyName}
              onChange={(e) => setNewStrategyName(e.target.value)}
              required
              className="flex-1 rounded-xl bg-[#0a0e17] border border-white/[0.08] px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !newStrategyName.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Add Strategy'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Highlights / Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-5 rounded-2xl bg-[#0d121c] border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-400 text-xs">Top Profit Playbook</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          {bestStrategy ? (
            <>
              <div className="text-lg font-bold text-white">{bestStrategy.strategy}</div>
              <div className="text-emerald-400 font-mono-nums font-extrabold text-base">
                +${bestStrategy.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400 font-mono-nums flex items-center gap-2">
                <span>{bestStrategy.count} trades</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{bestStrategy.winRate}% win rate</span>
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-500">Log trades to see top playbook</p>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-[#0d121c] border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-400 text-xs">Highest Win Rate</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          {highestWinRate ? (
            <>
              <div className="text-lg font-bold text-white">{highestWinRate.strategy}</div>
              <div className="text-cyan-400 font-mono-nums font-extrabold text-base">
                {highestWinRate.winRate}% Accuracy
              </div>
              <p className="text-xs text-slate-400 font-mono-nums flex items-center gap-2">
                <span>{highestWinRate.wins} wins</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{highestWinRate.count} executions</span>
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-500">Log trades to analyze accuracy</p>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-[#0d121c] border border-indigo-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-400 text-xs">Portfolio Expectancy</span>
            <Scale className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white">Expected Return / Execution</div>
          <div
            className={`font-mono-nums font-extrabold text-base ${
              kpis.expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {kpis.expectancy >= 0 ? '+' : ''}${kpis.expectancy.toFixed(2)}
          </div>
          <p className="text-xs text-slate-400 font-mono-nums flex items-center gap-2">
            <span>Payoff Ratio: <strong className="text-white">{kpis.payoffRatio}x</strong></span>
          </p>
        </div>
      </div>

      {/* P&L Distribution Bar Visualizer */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d121c] p-6 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          Net P&L by Strategy
        </h3>

        <div className="space-y-3.5 pt-2">
          {strategyStats.map((item) => {
            const isProfit = item.pnl >= 0;
            const barWidth = maxPnl > 0 ? (Math.abs(item.pnl) / maxPnl) * 100 : 0;

            return (
              <div key={item.strategy} className="space-y-1.5 font-mono-nums">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white font-sans">{item.strategy}</span>
                    <span className="text-slate-500 text-xs">
                      ({item.count} trades · {item.frequencyPct}%)
                    </span>
                  </div>
                  <span
                    className={`font-bold ${
                      isProfit ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isProfit ? '+' : ''}${item.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-[#0a0e17] overflow-hidden flex items-center">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isProfit
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-rose-500 to-red-400'
                    }`}
                    style={{ width: `${Math.max(item.count > 0 ? 3 : 0, barWidth)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Strategy Comparison Matrix */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d121c] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] bg-[#0a0e17] flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Playbook Performance Matrix
          </h3>
          <span className="text-xs text-slate-400 font-mono-nums">{activeStrategies.length} Active Playbooks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-nums">
            <thead className="bg-[#0a0e17] border-b border-white/[0.05] text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-4 font-sans">Strategy</th>
                <th className="py-3 px-4">Trades</th>
                <th className="py-3 px-4">Win Rate</th>
                <th className="py-3 px-4">Net P&L</th>
                <th className="py-3 px-4">Profit Factor</th>
                <th className="py-3 px-4">Expectancy</th>
                <th className="py-3 px-4">Avg Win / Loss</th>
                <th className="py-3 px-4">Max Win</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {strategyStats.map((strat) => {
                const isProfit = strat.pnl >= 0;
                return (
                  <tr key={strat.strategy} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white font-sans">
                      {strat.strategy}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {strat.count} <span className="text-slate-500 text-[10px]">({strat.wins}W/{strat.losses}L)</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-cyan-400">{strat.winRate}%</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                        {isProfit ? '+' : ''}${strat.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">
                      {strat.profitFactor}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={strat.expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {strat.expectancy >= 0 ? '+' : ''}${strat.expectancy.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      ${strat.avgWin} / -${strat.avgLoss}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">
                      +${strat.maxWin}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
