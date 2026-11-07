import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Trash2,
  Edit3,
  Eye,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { useTrades } from '../../context/TradesContext';
import { Trade } from '../../types/trade';

interface TradeHistoryScreenProps {
  onEditTrade: (trade: Trade) => void;
}

type SortOption = 'latest' | 'oldest' | 'highest_profit' | 'highest_loss';

export const TradeHistoryScreen: React.FC<TradeHistoryScreenProps> = ({ onEditTrade }) => {
  const { trades, strategies, deleteTrade, bulkDeleteTrades } = useTrades();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('ALL');
  const [selectedOutcome, setSelectedOutcome] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [selectedSetup, setSelectedSetup] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  // Bulk actions
  const [selectedTradeIds, setSelectedTradeIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);

  // Detail Modal view
  const [inspectTrade, setInspectTrade] = useState<Trade | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Unique list of setups for filter
  const uniqueSetups = useMemo(() => {
    const set = new Set<string>();
    trades.forEach((t) => {
      if (t.setup?.trim()) set.add(t.setup.trim());
    });
    return Array.from(set);
  }, [trades]);

  // Filter & Sort Logic
  const filteredTrades = useMemo(() => {
    let result = [...trades];

    // Search query: symbol or notes
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (t) => t.symbol.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q)
      );
    }

    // Strategy Filter
    if (selectedStrategy !== 'ALL') {
      result = result.filter((t) => t.strategy === selectedStrategy);
    }

    // Setup Filter
    if (selectedSetup !== 'ALL') {
      result = result.filter((t) => t.setup === selectedSetup);
    }

    // Outcome Filter
    if (selectedOutcome === 'WIN') {
      result = result.filter((t) => t.profitLoss > 0);
    } else if (selectedOutcome === 'LOSS') {
      result = result.filter((t) => t.profitLoss < 0);
    }

    // Date Filter
    if (dateFilter !== 'ALL') {
      const now = new Date();
      result = result.filter((t) => {
        const tradeD = new Date(t.tradeDate);
        if (isNaN(tradeD.getTime())) return true;

        if (dateFilter === 'TODAY') {
          return tradeD.toDateString() === now.toDateString();
        } else if (dateFilter === 'WEEK') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          return tradeD >= sevenDaysAgo;
        } else if (dateFilter === 'MONTH') {
          return (
            tradeD.getMonth() === now.getMonth() && tradeD.getFullYear() === now.getFullYear()
          );
        }
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime();
      }
      if (sortBy === 'highest_profit') {
        return b.profitLoss - a.profitLoss;
      }
      if (sortBy === 'highest_loss') {
        return a.profitLoss - b.profitLoss;
      }
      return 0;
    });

    return result;
  }, [trades, searchTerm, selectedStrategy, selectedOutcome, dateFilter, selectedSetup, sortBy]);

  // Paginated Slices
  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / pageSize));
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTrades.slice(start, start + pageSize);
  }, [filteredTrades, currentPage, pageSize]);

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedTradeIds.length === paginatedTrades.length) {
      setSelectedTradeIds([]);
    } else {
      setSelectedTradeIds(paginatedTrades.map((t) => t.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedTradeIds.includes(id)) {
      setSelectedTradeIds(selectedTradeIds.filter((tId) => tId !== id));
    } else {
      setSelectedTradeIds([...selectedTradeIds, id]);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedTradeIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await bulkDeleteTrades(selectedTradeIds);
      setSelectedTradeIds([]);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleConfirmSingleDelete = async () => {
    if (!tradeToDelete) return;
    try {
      await deleteTrade(tradeToDelete.id);
      setTradeToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-5 rounded-sm bg-cyan-500 inline-block" />
            Trade Journal Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono-nums">
            {filteredTrades.length} recorded trade{filteredTrades.length === 1 ? '' : 's'} matching criteria
          </p>
        </div>

        {/* Bulk Delete Button when items selected */}
        {selectedTradeIds.length > 0 && (
          <button
            onClick={handleConfirmBulkDelete}
            disabled={isBulkDeleting}
            className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 text-xs font-bold shadow-md transition-colors active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Selected ({selectedTradeIds.length})
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d121c] p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticker (e.g. NVDA) or keywords in trade reflections..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl bg-[#0a0e17] border border-white/[0.06] pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-xl bg-[#0a0e17] border border-white/[0.06] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_profit">Highest Profit</option>
              <option value="highest_loss">Highest Loss</option>
            </select>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.05] text-xs">
          {/* Outcome Filter */}
          <div className="flex rounded-lg bg-[#0a0e17] p-0.5 border border-white/[0.05]">
            {(['ALL', 'WIN', 'LOSS'] as const).map((outcome) => (
              <button
                key={outcome}
                onClick={() => {
                  setSelectedOutcome(outcome);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedOutcome === outcome
                    ? outcome === 'WIN'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : outcome === 'LOSS'
                      ? 'bg-rose-500 text-white font-bold'
                      : 'bg-white/[0.1] text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {outcome}
              </button>
            ))}
          </div>

          {/* Strategy Filter */}
          <select
            value={selectedStrategy}
            onChange={(e) => {
              setSelectedStrategy(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg bg-[#0a0e17] border border-white/[0.06] px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Strategies</option>
            {strategies.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Setup Filter */}
          {uniqueSetups.length > 0 && (
            <select
              value={selectedSetup}
              onChange={(e) => {
                setSelectedSetup(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg bg-[#0a0e17] border border-white/[0.06] px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Setups</option>
              {uniqueSetups.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          {/* Date Filter */}
          <div className="flex rounded-lg bg-[#0a0e17] p-0.5 border border-white/[0.05]">
            {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as const).map((df) => (
              <button
                key={df}
                onClick={() => {
                  setDateFilter(df);
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                  dateFilter === df
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {df}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trades High-Density Data Table (Desktop/Tablet) */}
      {paginatedTrades.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.05] bg-[#0d121c] p-12 text-center text-slate-400">
          <Layers className="w-10 h-10 mx-auto mb-2 text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-200">No matching trades found</h4>
          <p className="text-xs text-slate-500 mt-1">Try clearing your filters or search terms.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Top Bar on page */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-400 font-mono-nums">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 hover:text-slate-200 cursor-pointer"
            >
              {selectedTradeIds.length === paginatedTrades.length && paginatedTrades.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>Select all on page ({paginatedTrades.length})</span>
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {/* High-Density Desktop Data Grid */}
          <div className="hidden md:block rounded-2xl border border-white/[0.06] bg-[#0d121c] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0e17] border-b border-white/[0.05] text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-3 w-8"></th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Qty</th>
                  <th className="py-3 px-4 text-right">Realized Net P&L</th>
                  <th className="py-3 px-4">Strategy & Setup</th>
                  <th className="py-3 px-4 text-center">Confidence</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {paginatedTrades.map((trade) => {
                  const isProfit = trade.profitLoss >= 0;
                  const isSelected = selectedTradeIds.includes(trade.id);

                  return (
                    <tr
                      key={trade.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isSelected ? 'bg-cyan-500/5' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <button
                          onClick={() => toggleSelectOne(trade.id)}
                          className="text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-mono-nums text-slate-300">
                        {trade.tradeDate.split('T')[0]}
                      </td>
                      <td className="py-3 px-4 font-mono-nums font-bold text-white">
                        {trade.symbol}
                      </td>
                      <td className="py-3 px-4 font-mono-nums">
                        <span
                          className={`text-xs font-bold ${
                            trade.tradeType === 'SHORT'
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {trade.tradeType || 'LONG'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono-nums text-slate-300">
                        {trade.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-nums font-bold">
                        <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                          {isProfit ? '+' : ''}${trade.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-medium">{trade.strategy}</span>
                          {trade.setup && (
                            <>
                              <span className="text-slate-600">·</span>
                              <span className="text-slate-400">{trade.setup}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono-nums">
                        <span className="text-amber-400 font-semibold">{trade.confidenceLevel}</span>
                        <span className="text-slate-600 text-[10px]">/10</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectTrade(trade)}
                            className="p-1 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Inspect Trade"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditTrade(trade)}
                            className="p-1 rounded-lg hover:bg-white/[0.08] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                            title="Edit Trade"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTradeToDelete(trade)}
                            className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Trade"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-2">
            {paginatedTrades.map((trade) => {
              const isProfit = trade.profitLoss >= 0;
              const isSelected = selectedTradeIds.includes(trade.id);

              return (
                <div
                  key={trade.id}
                  className={`rounded-2xl border transition-all p-4 ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/50'
                      : 'bg-[#0d121c] border-white/[0.05]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleSelectOne(trade.id)}
                        className="mt-1 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 font-mono-nums">
                          <span className="font-extrabold text-base text-white">
                            {trade.symbol}
                          </span>
                          <span
                            className={`text-xs font-bold ${
                              trade.tradeType === 'SHORT'
                                ? 'text-rose-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {trade.tradeType || 'LONG'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-400 font-mono-nums">
                          <span>{trade.tradeDate.split('T')[0]}</span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span>Qty: {trade.quantity}</span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="font-sans text-slate-300">{trade.strategy}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <div
                        className={`text-base font-mono-nums font-extrabold ${
                          isProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isProfit ? '+' : ''}${trade.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>

                      <div className="flex items-center gap-1.5 mt-2">
                        <button
                          onClick={() => setInspectTrade(trade)}
                          className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditTrade(trade)}
                          className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-cyan-400 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTradeToDelete(trade)}
                          className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {trade.notes && (
                    <p className="mt-2.5 pt-2 border-t border-white/[0.05] text-xs text-slate-400 italic line-clamp-1">
                      "{trade.notes}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0e1320] text-xs font-medium text-slate-300 hover:bg-white/[0.08] disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold font-mono-nums transition-colors cursor-pointer ${
                      currentPage === i + 1
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-[#0e1320] text-slate-400 hover:text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0e1320] text-xs font-medium text-slate-300 hover:bg-white/[0.08] disabled:opacity-40 transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Single Trade Modal */}
      {tradeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0d121c] border border-white/[0.08] p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-white">Delete Trade Record?</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-mono-nums">
              Are you sure you want to delete the trade for{' '}
              <strong className="text-white font-bold">{tradeToDelete.symbol}</strong> ({tradeToDelete.tradeDate})?
              This action cannot be undone.
            </p>
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setTradeToDelete(null)}
                className="flex-1 py-2 rounded-xl bg-white/[0.06] text-xs font-medium text-slate-300 hover:bg-white/[0.1] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSingleDelete}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trade Inspection Detail Modal */}
      {inspectTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#0d121c] border border-white/[0.08] shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 bg-[#0a0e17]">
              <div className="flex items-center gap-3 font-mono-nums">
                <span className="text-lg font-bold text-white">{inspectTrade.symbol}</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    inspectTrade.tradeType === 'SHORT'
                      ? 'bg-rose-500/10 text-rose-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {inspectTrade.tradeType || 'LONG'}
                </span>
                <span className="text-xs text-slate-400">{inspectTrade.tradeDate.split('T')[0]}</span>
              </div>
              <button
                onClick={() => setInspectTrade(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin">
              {/* Outcome Highlight */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  inspectTrade.profitLoss >= 0
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}
              >
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Realized Net P&L
                </span>
                <span
                  className={`text-2xl font-extrabold font-mono-nums ${
                    inspectTrade.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {inspectTrade.profitLoss >= 0 ? '+' : ''}${inspectTrade.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono-nums">
                <div className="p-3 rounded-xl bg-[#0a0e17] border border-white/[0.05]">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Position Size</span>
                  <span className="text-white font-bold">{inspectTrade.quantity}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0e17] border border-white/[0.05]">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Confidence Rating</span>
                  <span className="text-amber-400 font-bold">{inspectTrade.confidenceLevel} / 10</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0e17] border border-white/[0.05]">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Entry Price</span>
                  <span className="text-white font-bold">
                    {inspectTrade.entryPrice ? `$${inspectTrade.entryPrice}` : 'N/A'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0e17] border border-white/[0.05]">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Exit Price</span>
                  <span className="text-white font-bold">
                    {inspectTrade.exitPrice ? `$${inspectTrade.exitPrice}` : 'N/A'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0e17] border border-white/[0.05]">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Playbook Strategy</span>
                  <span className="text-cyan-400 font-bold font-sans">{inspectTrade.strategy}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0e17] border border-white/[0.05]">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Chart Setup</span>
                  <span className="text-slate-200 font-bold font-sans">{inspectTrade.setup || 'None'}</span>
                </div>
              </div>

              {/* Notes */}
              {inspectTrade.notes && (
                <div className="p-4 rounded-xl bg-[#0a0e17] border border-white/[0.05] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Execution Reflection & Notes
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {inspectTrade.notes}
                  </p>
                </div>
              )}

              {/* Screenshot */}
              {inspectTrade.imageUrl && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Execution Chart Screenshot
                  </span>
                  <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-black">
                    <img
                      src={inspectTrade.imageUrl}
                      alt="Trade Chart"
                      className="w-full max-h-80 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 border-t border-white/[0.06] px-6 py-3 bg-[#0a0e17]">
              <button
                onClick={() => {
                  const t = inspectTrade;
                  setInspectTrade(null);
                  onEditTrade(t);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit This Trade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
