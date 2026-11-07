import React, { useState } from 'react';
import {
  TrendingUp,
  AlertCircle,
  Shield,
  Laptop,
  Wifi,
  Scale,
  Zap,
  Target,
  ArrowRight,
  BarChart2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthScreen: React.FC = () => {
  const { signInWithGoogle, authError } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign in failed');
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between p-4 sm:p-8 select-none relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[300px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-[1px] shadow-sm shadow-emerald-500/20">
            <div className="w-full h-full rounded-[11px] bg-[#0c111c] flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block">
              TradeJournal
            </span>
            <span className="text-[10px] text-slate-400 font-mono-nums block -mt-0.5">
              Progressive Web App
            </span>
          </div>
        </div>
      </header>

      {/* Hero Showcase Split Layout */}
      <div className="max-w-6xl w-full mx-auto my-auto py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Value Proposition & Login */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-mono-nums">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Real-Time Cloud Sync · Offline PWA</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Master Your Trading Edge.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
              Institutional-grade trading journal with real-time Firebase cloud sync, statistical expectancy, mathematical payoff ratios, and instant offline resilience.
            </p>
          </div>

          {(error || authError) && (
            <div className="flex items-center gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error || authError}</span>
            </div>
          )}

          {/* Sign In with Google Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0d121c]/90 backdrop-blur-md p-6 space-y-4 shadow-xl">
            <button
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md shadow-white/5 flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{signingIn ? 'Connecting securely...' : 'Sign in with Google Account'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="pt-3 border-t border-white/[0.05] grid grid-cols-3 gap-2 text-center font-mono-nums">
              <div className="p-2 rounded-lg bg-[#0a0e17] border border-white/[0.04]">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Access</span>
                <span className="text-white text-xs font-semibold">1-Click OAuth</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0a0e17] border border-white/[0.04]">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Storage</span>
                <span className="text-emerald-400 text-xs font-semibold">Firestore Cloud</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0a0e17] border border-white/[0.04]">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Devices</span>
                <span className="text-cyan-400 text-xs font-semibold">Android / Desktop</span>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0d121c]/60 border border-white/[0.04]">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Isolated User Records</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0d121c]/60 border border-white/[0.04]">
              <Laptop className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Cross-Device Cloud</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0d121c]/60 border border-white/[0.04]">
              <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Offline First Cache</span>
            </div>
          </div>
        </div>

        {/* Right Column: Realistic Live Terminal Preview Mockup */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0d121c] p-6 shadow-2xl space-y-4 relative overflow-hidden">
            {/* Top Bar of Mock Terminal */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                <span className="text-xs text-slate-400 font-mono-nums ml-2">portfolio_equity.svg</span>
              </div>
              <span className="text-xs font-mono-nums text-emerald-400 font-bold">+28.4% YTD</span>
            </div>

            {/* Mock KPI Strip */}
            <div className="grid grid-cols-3 gap-2 font-mono-nums">
              <div className="p-3 rounded-xl bg-[#0a0e17] border border-emerald-500/20">
                <span className="text-[10px] text-slate-400 block font-sans">Net P&L</span>
                <span className="text-base font-extrabold text-emerald-400">+$24,850.00</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0e17] border border-cyan-500/20">
                <span className="text-[10px] text-slate-400 block font-sans">Win Rate</span>
                <span className="text-base font-extrabold text-cyan-400">68.2%</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0e17] border border-indigo-500/20">
                <span className="text-[10px] text-slate-400 block font-sans">Profit Factor</span>
                <span className="text-base font-extrabold text-white">2.45</span>
              </div>
            </div>

            {/* Mock Mini Equity Curve Visualizer */}
            <div className="h-32 bg-[#0a0e17] rounded-xl border border-white/[0.04] p-2 relative overflow-hidden">
              <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="landingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 10 80 Q 80 75, 120 55 T 220 40 T 310 25 T 390 15 L 390 95 L 10 95 Z"
                  fill="url(#landingGrad)"
                />
                <path
                  d="M 10 80 Q 80 75, 120 55 T 220 40 T 310 25 T 390 15"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute top-3 left-3 text-[10px] font-mono-nums text-slate-400">
                CUMULATIVE PERFORMANCE (30-DAY RUN)
              </div>
            </div>

            {/* Mock Execution Tape */}
            <div className="space-y-1.5 text-xs font-mono-nums">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0a0e17] border border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-3 rounded-full bg-emerald-400" />
                  <span className="font-bold text-white">NVDA</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1 rounded">LONG</span>
                  <span className="text-slate-400 font-sans text-xs">Breakout</span>
                </div>
                <span className="text-emerald-400 font-bold">+$1,420.00</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0a0e17] border border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-3 rounded-full bg-emerald-400" />
                  <span className="font-bold text-white">SPY</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1 rounded">LONG</span>
                  <span className="text-slate-400 font-sans text-xs">Pullback</span>
                </div>
                <span className="text-emerald-400 font-bold">+$850.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 py-3 relative z-10 font-mono-nums">
        TradeJournal · Progressive Web Application · Firebase Cloud Engine
      </footer>
    </div>
  );
};
