import React, { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, DollarSign, Wallet, History, AlertCircle } from 'lucide-react';
import { useTrades } from '../../context/TradesContext';
import { useAuth } from '../../context/AuthContext';

interface CapitalManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CapitalManagementModal: React.FC<CapitalManagementModalProps> = ({ isOpen, onClose }) => {
  const { kpis, capitalTransactions, addCapitalTransaction } = useTrades();
  const { userProfile, updateCapitalSettings } = useAuth();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'initial' | 'history'>('deposit');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [initialCapitalInput, setInitialCapitalInput] = useState(
    (userProfile?.initialCapital || 10000).toString()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid positive dollar amount.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (activeTab === 'deposit') {
        await addCapitalTransaction('DEPOSIT', val, notes);
      } else if (activeTab === 'withdraw') {
        await addCapitalTransaction('WITHDRAWAL', val, notes);
      }
      setAmount('');
      setNotes('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInitial = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(initialCapitalInput);
    if (isNaN(val) || val < 0) {
      setError('Please enter a valid starting capital amount.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await updateCapitalSettings(val);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update capital');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-[#0d121c] border border-white/[0.08] shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 bg-[#0a0e17]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Capital Management</h3>
              <p className="text-xs text-slate-400">Account balance & capital movements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balances Summary */}
        <div className="grid grid-cols-3 gap-2 p-5 bg-[#0a0e17]/60 border-b border-white/[0.05] font-mono-nums">
          <div className="p-3 rounded-xl bg-[#0d121c] border border-white/[0.04]">
            <span className="text-[10px] text-slate-500 uppercase font-sans block">Total Deposited</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400">
              ${kpis.totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d121c] border border-white/[0.04]">
            <span className="text-[10px] text-slate-500 uppercase font-sans block">Total Withdrawn</span>
            <span className="text-xs sm:text-sm font-bold text-rose-400">
              ${kpis.totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d121c] border border-white/[0.04]">
            <span className="text-[10px] text-slate-500 uppercase font-sans block">Current Balance</span>
            <span className="text-xs sm:text-sm font-bold text-white">
              ${kpis.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex border-b border-white/[0.06] px-6 pt-3 gap-2 bg-[#0a0e17]/30">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'deposit'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            Deposit
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'withdraw'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            Withdrawal
          </button>
          <button
            onClick={() => setActiveTab('initial')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'initial'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Starting Capital
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History ({capitalTransactions.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {(activeTab === 'deposit' || activeTab === 'withdraw') && (
            <form onSubmit={handleTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {activeTab === 'deposit' ? 'Deposit Amount ($)' : 'Withdrawal Amount ($)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono-nums text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="5000.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full rounded-xl bg-[#0a0e17] border border-white/[0.08] pl-8 pr-4 py-2.5 text-sm text-white font-mono-nums placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Memo / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wire transfer from checking account"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl bg-[#0a0e17] border border-white/[0.08] px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'deposit'
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    : 'bg-rose-500 text-white hover:bg-rose-400'
                } disabled:opacity-50`}
              >
                {loading ? 'Processing...' : activeTab === 'deposit' ? 'Add Deposit to Account' : 'Confirm Withdrawal'}
              </button>
            </form>
          )}

          {activeTab === 'initial' && (
            <form onSubmit={handleUpdateInitial} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Base Starting Capital ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono-nums text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={initialCapitalInput}
                    onChange={(e) => setInitialCapitalInput(e.target.value)}
                    required
                    className="w-full rounded-xl bg-[#0a0e17] border border-white/[0.08] pl-8 pr-4 py-2.5 text-sm text-white font-mono-nums placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Base starting balance prior to deposits or trading P&L.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Save Starting Capital'}
              </button>
            </form>
          )}

          {activeTab === 'history' && (
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin font-mono-nums">
              {capitalTransactions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6 font-sans">No deposit or withdrawal transactions logged yet.</p>
              ) : (
                capitalTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0a0e17] border border-white/[0.05] text-xs"
                  >
                    <div className="flex items-center gap-2.5 font-sans">
                      {tx.type === 'DEPOSIT' ? (
                        <ArrowDownCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <ArrowUpCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-white capitalize">{tx.type.toLowerCase()}</p>
                        <p className="text-[10px] text-slate-400 font-mono-nums">
                          {tx.date} {tx.notes ? `· ${tx.notes}` : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-bold ${
                        tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
