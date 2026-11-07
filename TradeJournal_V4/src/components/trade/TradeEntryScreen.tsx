import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowRight,
  Plus,
  Loader2,
} from 'lucide-react';
import { useTrades } from '../../context/TradesContext';
import { useAuth } from '../../context/AuthContext';
import { uploadTradeScreenshotFile } from '../../firebase/config';
import { Trade, TradeDirection } from '../../types/trade';

interface TradeEntryScreenProps {
  editTrade?: Trade | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const POPULAR_SYMBOLS = ['SPY', 'QQQ', 'NVDA', 'AAPL', 'TSLA', 'BTC/USDT', 'ETH/USDT', 'NQ', 'ES'];

export const TradeEntryScreen: React.FC<TradeEntryScreenProps> = ({
  editTrade,
  onSuccess,
  onCancel,
}) => {
  const { addTrade, updateTrade, strategies, addCustomStrategy } = useTrades();
  const { currentUser } = useAuth();

  // Form states
  const [tradeDate, setTradeDate] = useState(
    editTrade?.tradeDate?.split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [symbol, setSymbol] = useState(editTrade?.symbol || '');
  const [tradeType, setTradeType] = useState<TradeDirection>(editTrade?.tradeType || 'LONG');
  const [quantity, setQuantity] = useState(editTrade?.quantity?.toString() || '1');
  const [profitLoss, setProfitLoss] = useState(editTrade?.profitLoss?.toString() || '');
  const [strategy, setStrategy] = useState<string>(editTrade?.strategy || (strategies[0] || 'Breakout'));
  const [setup, setSetup] = useState(editTrade?.setup || '');
  const [confidenceLevel, setConfidenceLevel] = useState<number>(editTrade?.confidenceLevel || 8);
  const [notes, setNotes] = useState(editTrade?.notes || '');
  const [imageUrl, setImageUrl] = useState(editTrade?.imageUrl || '');
  const [uploadingImage, setUploadingImage] = useState(false);

  // New Strategy Input state
  const [showNewStrategyInput, setShowNewStrategyInput] = useState(false);
  const [newStrategyName, setNewStrategyName] = useState('');
  const [addingStrategy, setAddingStrategy] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  // Quick Polarity Toggle for P&L (+ / -)
  const togglePolarity = (makePositive: boolean) => {
    const val = parseFloat(profitLoss);
    if (!isNaN(val) && val !== 0) {
      const absVal = Math.abs(val);
      setProfitLoss(makePositive ? absVal.toString() : (-absVal).toString());
    } else if (profitLoss === '' || profitLoss === '0') {
      setProfitLoss(makePositive ? '' : '-');
    }
  };

  // Add a new Strategy to Playbook
  const handleAddNewStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newStrategyName.trim();
    if (!trimmed) return;

    setAddingStrategy(true);
    try {
      await addCustomStrategy(trimmed);
      setStrategy(trimmed);
      setNewStrategyName('');
      setShowNewStrategyInput(false);
    } catch (err) {
      console.error('Error adding custom strategy:', err);
    } finally {
      setAddingStrategy(false);
    }
  };

  // Handle Screenshot Upload via Firebase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }

    setError(null);
    setUploadingImage(true);

    try {
      const tempId = editTrade?.id || 't_' + Date.now();
      const url = await uploadTradeScreenshotFile(currentUser.uid, tempId, file);
      setImageUrl(url);
    } catch {
      setError('Failed to upload screenshot. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanSymbol = symbol.trim().toUpperCase();
    if (!cleanSymbol) {
      setError('Ticker symbol is required (e.g. SPY, AAPL, BTC/USDT).');
      return;
    }

    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }

    const pnlNum = parseFloat(profitLoss);
    if (isNaN(pnlNum)) {
      setError('Net Profit/Loss is required. Enter the realized dollar return.');
      return;
    }

    if (!tradeDate) {
      setError('Trade date is required.');
      return;
    }

    setSaving(true);
    try {
      if (editTrade) {
        await updateTrade(editTrade.id, {
          tradeDate,
          symbol: cleanSymbol,
          tradeType,
          quantity: qtyNum,
          profitLoss: pnlNum,
          strategy,
          setup: setup.trim(),
          confidenceLevel,
          notes: notes.trim(),
          imageUrl,
        });
      } else {
        await addTrade({
          tradeDate,
          symbol: cleanSymbol,
          tradeType,
          quantity: qtyNum,
          profitLoss: pnlNum,
          strategy,
          setup: setup.trim(),
          confidenceLevel,
          notes: notes.trim(),
          imageUrl,
        });
      }

      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        if (onSuccess) onSuccess();
        else {
          setSymbol('');
          setQuantity('1');
          setProfitLoss('');
          setNotes('');
          setImageUrl('');
          setSetup('');
        }
      }, 700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save trade entry.');
    } finally {
      setSaving(false);
    }
  };

  const parsedPnL = parseFloat(profitLoss);
  const isProfit = !isNaN(parsedPnL) && parsedPnL > 0;
  const isLoss = !isNaN(parsedPnL) && parsedPnL < 0;

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Screen Title */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-5 rounded-sm bg-emerald-500 inline-block" />
            {editTrade ? 'Edit Trade Record' : 'Log New Trade Execution'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Capture execution return, playbook strategy, and psychological discipline
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Trade successfully recorded into Firebase Journal!</span>
          </div>
        )}

        {/* Section 1: Execution Details */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0d121c] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Execution Details
            </span>

            {/* Long / Short Toggle */}
            <div className="flex rounded-lg bg-[#0a0e17] p-0.5 border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setTradeType('LONG')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  tradeType === 'LONG'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                LONG
              </button>
              <button
                type="button"
                onClick={() => setTradeType('SHORT')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  tradeType === 'SHORT'
                    ? 'bg-rose-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                SHORT
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Symbol */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Symbol / Ticker <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. SPY, NVDA, BTC/USDT"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                required
                className="w-full rounded-xl bg-[#0a0e17] border border-white/[0.08] px-3.5 py-2.5 text-sm text-white font-mono-nums uppercase tracking-wide placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />

              {/* Quick symbol suggestions */}
              <div className="flex flex-wrap gap-1 mt-1.5 font-mono-nums">
                {POPULAR_SYMBOLS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSymbol(s)}
                    className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[10px] text-slate-300 transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Trade Date */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Trade Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={tradeDate}
                onChange={(e) => setTradeDate(e.target.value)}
                required
                className="w-full rounded-xl bg-[#0a0e17] border border-white/[0.08] px-3.5 py-2.5 text-sm text-white font-mono-nums focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Quantity / Contracts / Position Size <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.000001"
              placeholder="e.g. 100 or 2"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full rounded-xl bg-[#0a0e17] border border-white/[0.08] px-3.5 py-2.5 text-sm text-white font-mono-nums focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Section 2: Enter P&L Manually */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0d121c] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Realized Return (Enter P&L Manually)
            </span>

            {/* Quick Profit / Loss polarity buttons */}
            <div className="flex items-center gap-1.5 text-xs font-mono-nums">
              <button
                type="button"
                onClick={() => togglePolarity(true)}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                  isProfit
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                }`}
              >
                + Profit
              </button>
              <button
                type="button"
                onClick={() => togglePolarity(false)}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                  isLoss
                    ? 'bg-rose-500 text-white'
                    : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                }`}
              >
                - Loss
              </button>
            </div>
          </div>

          {/* Profit / Loss Input Box */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isProfit
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : isLoss
                ? 'bg-rose-950/20 border-rose-500/30'
                : 'bg-[#0a0e17] border-white/[0.08]'
            }`}
          >
            <div className="flex items-center justify-between mb-2 text-xs font-mono-nums">
              <label htmlFor="pnl-input" className="font-semibold text-slate-300 font-sans">
                Net Profit / Loss ($) <span className="text-rose-400">*</span>
              </label>
              <span
                className={`font-bold ${
                  isProfit ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                {isProfit ? 'WINNING TRADE' : isLoss ? 'LOSING TRADE' : 'BREAKEVEN'}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono-nums text-lg font-bold text-slate-400">
                $
              </span>
              <input
                id="pnl-input"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={profitLoss}
                onChange={(e) => setProfitLoss(e.target.value)}
                required
                className={`w-full rounded-xl bg-[#0a0e17] border pl-8 pr-4 py-3 text-2xl font-black font-mono-nums focus:outline-none transition-colors ${
                  isProfit
                    ? 'border-emerald-500/50 text-emerald-400'
                    : isLoss
                    ? 'border-rose-500/50 text-rose-400'
                    : 'border-white/[0.08] text-white'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-sans">
              Enter positive value for gains (e.g. 350.00) or negative for losses (e.g. -120.00).
            </p>
          </div>
        </div>

        {/* Section 3: Strategy Playbook, Setup & Confidence */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0d121c] p-5 space-y-4 shadow-xs">
          <div className="border-b border-white/[0.05] pb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Strategy Playbook & Setup
            </span>

            {/* Add New Strategy Trigger */}
            <button
              type="button"
              onClick={() => setShowNewStrategyInput(!showNewStrategyInput)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showNewStrategyInput ? 'Close' : 'Add Playbook Entry'}</span>
            </button>
          </div>

          {/* New Strategy Creation Drawer */}
          {showNewStrategyInput && (
            <div className="p-3.5 rounded-xl bg-[#0a0e17] border border-emerald-500/30 space-y-2 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-emerald-400">
                Add New Entry to Strategy Playbook
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Mean Reversion, Gap & Go, VWAP Squeeze"
                  value={newStrategyName}
                  onChange={(e) => setNewStrategyName(e.target.value)}
                  className="flex-1 rounded-lg bg-[#0d121c] border border-white/[0.1] px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddNewStrategy}
                  disabled={addingStrategy || !newStrategyName.trim()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {addingStrategy ? 'Saving...' : 'Add'}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strategy Dropdown */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Strategy Playbook <span className="text-rose-400">*</span>
              </label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full rounded-xl bg-[#0a0e17] border border-white/[0.08] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                {strategies.map((s) => (
                  <option key={s} value={s} className="bg-[#0a0e17] text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Setup Input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Technical Pattern / Setup
              </label>
              <input
                type="text"
                placeholder="e.g. Bull Flag, VWAP Bounce, Double Bottom"
                value={setup}
                onChange={(e) => setSetup(e.target.value)}
                className="w-full rounded-xl bg-[#0a0e17] border border-white/[0.08] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Confidence Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300">
                Confidence Level (1 to 10 scale)
              </label>
              <span
                className={`text-xs font-bold font-mono-nums ${
                  confidenceLevel >= 8
                    ? 'text-emerald-400'
                    : confidenceLevel >= 5
                    ? 'text-cyan-400'
                    : 'text-rose-400'
                }`}
              >
                {confidenceLevel} / 10 ({confidenceLevel >= 8 ? 'High Conviction' : confidenceLevel >= 5 ? 'Balanced' : 'Low Conviction'})
              </span>
            </div>

            {/* Touchable scale with chromatic conviction feedback */}
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5 font-mono-nums">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = confidenceLevel === num;
                const isHigh = num >= 8;
                const isMed = num >= 5;

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setConfidenceLevel(num)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? isHigh
                          ? 'bg-emerald-500 text-slate-950 shadow-xs scale-105'
                          : isMed
                          ? 'bg-cyan-500 text-slate-950 shadow-xs scale-105'
                          : 'bg-rose-500 text-white shadow-xs scale-105'
                        : num <= confidenceLevel
                        ? isHigh
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isMed
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-[#0a0e17] text-slate-500 hover:bg-white/[0.04] border border-white/[0.03]'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Notes & Screenshot */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0d121c] p-5 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Trading Notes & Psychology Reflection
            </label>
            <textarea
              rows={3}
              placeholder="What prompted this entry? Did you stick to risk parameters? What was your emotional state?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl bg-[#0a0e17] border border-white/[0.08] p-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed resize-none"
            />
          </div>

          {/* Screenshot Upload with Firebase Storage */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Chart Screenshot (Firebase Storage)
            </label>

            {uploadingImage ? (
              <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-white/[0.08] bg-[#0a0e17] text-cyan-400">
                <Loader2 className="w-5 h-5 animate-spin mb-2" />
                <span className="text-xs font-medium">Uploading to Firebase Storage...</span>
              </div>
            ) : imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-black">
                <img
                  src={imageUrl}
                  alt="Chart Screenshot"
                  className="w-full max-h-56 object-contain"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-md cursor-pointer"
                  title="Remove screenshot"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-emerald-500/40 bg-[#0a0e17] cursor-pointer transition-colors">
                <Upload className="w-5 h-5 text-slate-400 mb-1.5" />
                <span className="text-xs font-medium text-slate-300">
                  Upload trade screenshot
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  PNG, JPG, WEBP (up to 5MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={saving || uploadingImage}
          className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide shadow-md shadow-emerald-500/10 transition-colors active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {saving ? (
            'Saving Trade to Firebase...'
          ) : (
            <>
              <span>{editTrade ? 'Update Trade Record' : 'Save Trade to Journal'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
