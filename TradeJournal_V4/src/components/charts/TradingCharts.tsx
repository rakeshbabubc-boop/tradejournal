import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Layers,
} from 'lucide-react';
import { Trade } from '../../types/trade';

interface TradingChartsProps {
  trades: Trade[];
  initialCapital?: number;
}

type ChartTab = 'equity' | 'periodic' | 'strategy' | 'setup';
type PeriodType = 'daily' | 'weekly' | 'monthly';
type TimeframeFilter = '1W' | '1M' | '3M' | 'ALL';

export const TradingCharts: React.FC<TradingChartsProps> = ({ trades, initialCapital = 10000 }) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('equity');
  const [periodType, setPeriodType] = useState<PeriodType>('daily');
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('ALL');
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    equity: number;
    pnl: number;
    symbol?: string;
    x: number;
    y: number;
  } | null>(null);

  // Chronologically sorted trades
  const sortedTrades = useMemo(() => {
    return [...trades].sort(
      (a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
    );
  }, [trades]);

  // Filtered trades by timeframe
  const filteredSortedTrades = useMemo(() => {
    if (timeframe === 'ALL') return sortedTrades;
    const now = new Date();
    const cutoff = new Date();
    if (timeframe === '1W') cutoff.setDate(now.getDate() - 7);
    else if (timeframe === '1M') cutoff.setMonth(now.getMonth() - 1);
    else if (timeframe === '3M') cutoff.setMonth(now.getMonth() - 3);

    return sortedTrades.filter((t) => new Date(t.tradeDate) >= cutoff);
  }, [sortedTrades, timeframe]);

  // Equity Curve Data
  const equityPoints = useMemo(() => {
    let running = initialCapital;
    const points: Array<{ date: string; equity: number; pnl: number; symbol: string }> = [
      { date: 'Start', equity: initialCapital, pnl: 0, symbol: 'Initial' },
    ];
    filteredSortedTrades.forEach((t) => {
      running += Number(t.profitLoss) || 0;
      points.push({
        date: t.tradeDate.split('T')[0],
        equity: running,
        pnl: Number(t.profitLoss) || 0,
        symbol: t.symbol,
      });
    });
    return points;
  }, [filteredSortedTrades, initialCapital]);

  // Periodic P&L Data (Daily, Weekly, Monthly)
  const periodicData = useMemo(() => {
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map = new Map<
      string,
      { pnl: number; wins: number; losses: number; count: number; displayLabel: string; sortOrder: string }
    >();

    sortedTrades.forEach((t) => {
      const d = new Date(t.tradeDate);
      if (isNaN(d.getTime())) return;

      let key = '';
      let displayLabel = '';
      let sortOrder = '';

      if (periodType === 'daily') {
        const dateStr = t.tradeDate.split('T')[0];
        const month = MONTH_NAMES[d.getMonth()];
        const day = String(d.getDate()).padStart(2, '0');
        key = dateStr;
        displayLabel = `${month} ${day}`;
        sortOrder = dateStr;
      } else if (periodType === 'weekly') {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d);
        monday.setDate(diff);
        const monMonth = MONTH_NAMES[monday.getMonth()];
        const monDay = String(monday.getDate()).padStart(2, '0');
        key = monday.toISOString().split('T')[0];
        displayLabel = `Wk ${monMonth} ${monDay}`;
        sortOrder = key;
      } else {
        // Monthly: use MMM format (e.g. "Nov 2026" or "Nov")
        const year = d.getFullYear();
        const month = MONTH_NAMES[d.getMonth()];
        key = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        displayLabel = `${month} ${year}`;
        sortOrder = key;
      }

      const existing = map.get(key) || {
        pnl: 0,
        wins: 0,
        losses: 0,
        count: 0,
        displayLabel,
        sortOrder,
      };
      const pnl = Number(t.profitLoss) || 0;
      existing.pnl += pnl;
      existing.count += 1;
      if (pnl > 0) existing.wins += 1;
      else if (pnl < 0) existing.losses += 1;
      map.set(key, existing);
    });

    return Array.from(map.entries())
      .sort((a, b) => a[1].sortOrder.localeCompare(b[1].sortOrder))
      .map(([periodKey, data]) => ({
        periodKey,
        period: data.displayLabel, // MMM format e.g. "Nov 2026"
        shortLabel: periodType === 'monthly' ? data.displayLabel.split(' ')[0] : data.displayLabel, // "Nov"
        pnl: Math.round(data.pnl * 100) / 100,
        wins: data.wins,
        losses: data.losses,
        count: data.count,
        winRate: data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0,
      }));
  }, [sortedTrades, periodType]);

  // Strategy Profitability Data (Dynamic to support all playbook entries)
  const strategyData = useMemo(() => {
    const strategySet = new Set<string>();
    trades.forEach((t) => {
      if (t.strategy && t.strategy.trim()) strategySet.add(t.strategy.trim());
    });
    // Ensure standard defaults are present if few trades
    ['Breakout', 'Pullback', 'Reversal', 'Trend Following', 'Scalping'].forEach((s) => strategySet.add(s));

    const map = new Map<string, { pnl: number; count: number; wins: number; grossProfit: number; grossLoss: number }>();
    Array.from(strategySet).forEach((s) => map.set(s, { pnl: 0, count: 0, wins: 0, grossProfit: 0, grossLoss: 0 }));

    trades.forEach((t) => {
      const strat = t.strategy?.trim() || 'Other';
      if (!map.has(strat)) {
        map.set(strat, { pnl: 0, count: 0, wins: 0, grossProfit: 0, grossLoss: 0 });
      }
      const stats = map.get(strat)!;
      const pnl = Number(t.profitLoss) || 0;
      stats.pnl += pnl;
      stats.count += 1;
      if (pnl > 0) {
        stats.wins += 1;
        stats.grossProfit += pnl;
      } else if (pnl < 0) {
        stats.grossLoss += Math.abs(pnl);
      }
    });

    return Array.from(map.entries())
      .map(([name, stats]) => ({
        name,
        pnl: Math.round(stats.pnl * 100) / 100,
        count: stats.count,
        wins: stats.wins,
        winRate: stats.count > 0 ? Math.round((stats.wins / stats.count) * 100) : 0,
        profitFactor: stats.grossLoss > 0 ? Math.round((stats.grossProfit / stats.grossLoss) * 10) / 10 : stats.grossProfit > 0 ? 10 : 0,
      }))
      .filter((s) => s.count > 0 || trades.length === 0);
  }, [trades]);

  // Setup Performance Data
  const setupData = useMemo(() => {
    const map = new Map<string, { pnl: number; count: number; wins: number }>();

    trades.forEach((t) => {
      const setupName = t.setup?.trim() || 'Standard Pattern';
      const stats = map.get(setupName) || { pnl: 0, count: 0, wins: 0 };
      const pnl = Number(t.profitLoss) || 0;
      stats.pnl += pnl;
      stats.count += 1;
      if (pnl > 0) stats.wins += 1;
      map.set(setupName, stats);
    });

    return Array.from(map.entries())
      .map(([setup, stats]) => ({
        setup,
        pnl: Math.round(stats.pnl * 100) / 100,
        count: stats.count,
        winRate: stats.count > 0 ? Math.round((stats.wins / stats.count) * 100) : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  if (trades.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.05] bg-[#0d121c] p-12 text-center text-slate-400">
        <TrendingUp className="w-10 h-10 mx-auto mb-3 text-slate-600" />
        <h3 className="text-base font-semibold text-slate-200">No Trading Executions Yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Log trades to generate interactive portfolio equity curves, periodic distributions, and playbook analytics.
        </p>
      </div>
    );
  }

  // Sizing and scaling for Equity Curve SVG
  const svgWidth = 720;
  const svgHeight = 270;
  const paddingX = 48;
  const paddingY = 32;

  const minEquity = Math.min(...equityPoints.map((p) => p.equity));
  const maxEquity = Math.max(...equityPoints.map((p) => p.equity));
  const equityRange = Math.max(10, maxEquity - minEquity);

  const getY = (val: number) => {
    const ratio = (val - minEquity) / equityRange;
    return svgHeight - paddingY - ratio * (svgHeight - paddingY * 2);
  };

  const getX = (index: number) => {
    if (equityPoints.length <= 1) return paddingX;
    return paddingX + (index / (equityPoints.length - 1)) * (svgWidth - paddingX * 2);
  };

  const linePath = equityPoints.reduce((acc, point, index) => {
    const x = getX(index);
    const y = getY(point.equity);
    return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaPath = `${linePath} L ${getX(equityPoints.length - 1)} ${svgHeight - paddingY} L ${paddingX} ${svgHeight - paddingY} Z`;
  const isOverallProfitable = equityPoints[equityPoints.length - 1].equity >= initialCapital;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d121c] shadow-sm overflow-hidden">
      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.05] px-5 py-3 gap-3 bg-[#0a0e17]/60">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('equity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'equity'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Equity Curve
          </button>
          <button
            onClick={() => setActiveTab('periodic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'periodic'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Periodic P&L
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'strategy'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Strategy
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'setup'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Setups
          </button>
        </div>

        {/* Sub-selectors */}
        {activeTab === 'equity' && (
          <div className="flex items-center rounded-lg bg-[#0e1320] p-0.5 border border-white/[0.05] text-xs font-mono-nums">
            {(['1W', '1M', '3M', 'ALL'] as TimeframeFilter[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  timeframe === tf
                    ? 'bg-white/[0.1] text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'periodic' && (
          <div className="flex items-center rounded-lg bg-[#0e1320] p-0.5 border border-white/[0.05] text-xs">
            {(['daily', 'weekly', 'monthly'] as PeriodType[]).map((period) => (
              <button
                key={period}
                onClick={() => setPeriodType(period)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                  periodType === period
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div className="p-5">
        {activeTab === 'equity' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-nums text-slate-400">
              <span>
                Peak Equity: <strong className="text-emerald-400 font-bold">${maxEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </span>
              <span>
                Current Equity:{' '}
                <strong className={isOverallProfitable ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  ${equityPoints[equityPoints.length - 1].equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </span>
            </div>

            <div className="relative w-full h-[270px] bg-[#0a0e17]/80 rounded-xl border border-white/[0.04] p-2 overflow-hidden select-none">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="equityGradGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="equityGradRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const val = minEquity + ratio * equityRange;
                  const y = getY(val);
                  return (
                    <g key={ratio}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke="rgba(255,255,255,0.05)"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        textAnchor="end"
                        fill="#64748b"
                        fontSize="9"
                        className="font-mono-nums"
                      >
                        ${Math.round(val)}
                      </text>
                    </g>
                  );
                })}

                {/* Starting Capital baseline */}
                <line
                  x1={paddingX}
                  y1={getY(initialCapital)}
                  x2={svgWidth - paddingX}
                  y2={getY(initialCapital)}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />

                {/* Area Gradient */}
                <path
                  d={areaPath}
                  fill={isOverallProfitable ? 'url(#equityGradGreen)' : 'url(#equityGradRed)'}
                />

                {/* Line Path */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={isOverallProfitable ? '#10b981' : '#f43f5e'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Vertical Crosshair tracking line on active point */}
                {hoveredPoint && (
                  <line
                    x1={hoveredPoint.x}
                    y1={paddingY}
                    x2={hoveredPoint.x}
                    y2={svgHeight - paddingY}
                    stroke="rgba(255,255,255,0.25)"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                )}

                {/* Interactive Points */}
                {equityPoints.map((point, index) => {
                  const x = getX(index);
                  const y = getY(point.equity);
                  const isHovered = hoveredPoint?.date === point.date;
                  return (
                    <g key={index}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 6 : 3}
                        fill={point.pnl >= 0 ? '#10b981' : '#f43f5e'}
                        stroke="#07090e"
                        strokeWidth="1.5"
                        className="transition-all duration-150 cursor-pointer"
                        onMouseEnter={() => setHoveredPoint({ ...point, x, y })}
                        onTouchStart={() => setHoveredPoint({ ...point, x, y })}
                        onClick={() => setHoveredPoint({ ...point, x, y })}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredPoint && (
                <div
                  className="absolute z-20 pointer-events-none rounded-xl bg-[#0e1422]/95 backdrop-blur-md border border-white/[0.12] p-3 shadow-2xl text-xs text-slate-200 whitespace-nowrap transform -translate-x-1/2 -translate-y-full font-mono-nums"
                  style={{
                    left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                    top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                    marginTop: '-12px',
                  }}
                >
                  <div className="font-semibold text-white flex items-center justify-between gap-3 border-b border-white/[0.06] pb-1.5 mb-1.5">
                    <span>{hoveredPoint.date}</span>
                    {hoveredPoint.symbol !== 'Initial' && (
                      <span className="text-cyan-400 font-bold">{hoveredPoint.symbol}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400 font-sans">Trade P&L:</span>
                    <span className={hoveredPoint.pnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {hoveredPoint.pnl >= 0 ? '+' : ''}${hoveredPoint.pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 mt-0.5">
                    <span className="text-slate-400 font-sans">Portfolio Equity:</span>
                    <span className="text-white font-bold">${hoveredPoint.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 text-center font-sans">
              Tap or hover points to inspect individual trade P&L and cumulative portfolio balance.
            </p>
          </div>
        )}

        {activeTab === 'periodic' && (
          <div className="space-y-4">
            <div className="h-[240px] flex items-end gap-2 overflow-x-auto pb-4 pt-6 px-2 scrollbar-thin">
              {periodicData.map((item) => {
                const maxAbs = Math.max(1, ...periodicData.map((p) => Math.abs(p.pnl)));
                const heightPercent = Math.max(12, (Math.abs(item.pnl) / maxAbs) * 100);
                const isProfit = item.pnl >= 0;

                return (
                  <div
                    key={item.period}
                    className="flex-1 min-w-[54px] max-w-[85px] flex flex-col items-center justify-end h-full group relative"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 z-20 rounded-lg bg-[#0e1422] border border-white/[0.1] p-2 text-xs text-white shadow-xl whitespace-nowrap font-mono-nums">
                      <p className="font-semibold text-slate-300">{item.period}</p>
                      <p className={isProfit ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {isProfit ? '+' : ''}${item.pnl.toFixed(2)}
                      </p>
                      <p className="text-slate-400 text-[10px]">{item.wins}W / {item.losses}L ({item.winRate}%)</p>
                    </div>

                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isProfit
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-500/20'
                          : 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-sm shadow-rose-500/20'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />

                    <span className="text-[10px] text-slate-300 mt-2 truncate w-full text-center font-mono-nums font-medium">
                      {item.shortLabel || item.period}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/[0.05] text-xs font-mono-nums text-slate-300">
              <div className="p-3 rounded-lg bg-[#0a0e17] border border-white/[0.04]">
                <span className="text-[10px] text-slate-400 block uppercase font-sans">Profitable Periods</span>
                <span className="text-emerald-400 font-bold">
                  {periodicData.filter((p) => p.pnl > 0).length} of {periodicData.length}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#0a0e17] border border-white/[0.04]">
                <span className="text-[10px] text-slate-400 block uppercase font-sans">Best Period</span>
                <span className="text-emerald-400 font-bold">
                  +${Math.max(0, ...periodicData.map((p) => p.pnl)).toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#0a0e17] border border-white/[0.04]">
                <span className="text-[10px] text-slate-400 block uppercase font-sans">Worst Period</span>
                <span className="text-rose-400 font-bold">
                  ${Math.min(0, ...periodicData.map((p) => p.pnl)).toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#0a0e17] border border-white/[0.04]">
                <span className="text-[10px] text-slate-400 block uppercase font-sans">Avg Period Return</span>
                <span className="font-bold text-white">
                  ${(periodicData.reduce((acc, p) => acc + p.pnl, 0) / Math.max(1, periodicData.length)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'strategy' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {strategyData.map((strat) => {
              const isProfit = strat.pnl >= 0;
              return (
                <div
                  key={strat.name}
                  className="p-4 rounded-xl bg-[#0a0e17] border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white text-xs">{strat.name}</span>
                    <span
                      className={`text-xs font-mono-nums font-bold ${
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}${strat.pnl.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-mono-nums">
                      <span>Win Rate: {strat.winRate}%</span>
                      <span>{strat.wins}W · {strat.count - strat.wins}L ({strat.count} trades)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${strat.winRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/[0.05] pt-2 font-mono-nums">
                    <span>Profit Factor: <strong className="text-slate-200">{strat.profitFactor}</strong></span>
                    <span>Avg/Trade: <strong className="text-slate-200">${strat.count > 0 ? (strat.pnl / strat.count).toFixed(2) : '0'}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="space-y-2">
            {setupData.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No specific technical setups logged yet.</p>
            ) : (
              setupData.map((item) => {
                const isProfit = item.pnl >= 0;
                return (
                  <div
                    key={item.setup}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#0a0e17] border border-white/[0.05] text-xs font-mono-nums"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-1.5 h-4 rounded-full ${isProfit ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <div>
                        <p className="font-semibold text-white font-sans">{item.setup}</p>
                        <p className="text-[11px] text-slate-400">{item.count} executions · {item.winRate}% Win Rate</p>
                      </div>
                    </div>
                    <span className={`font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfit ? '+' : ''}${item.pnl.toFixed(2)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
