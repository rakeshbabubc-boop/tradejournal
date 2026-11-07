/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TradesProvider, useTrades } from './context/TradesContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { Navbar, AppTab } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { TradeEntryScreen } from './components/trade/TradeEntryScreen';
import { TradeHistoryScreen } from './components/history/TradeHistoryScreen';
import { StrategyAnalyticsScreen } from './components/analytics/StrategyAnalyticsScreen';
import { SetupAnalyticsScreen } from './components/analytics/SetupAnalyticsScreen';
import { PerformanceAnalyticsScreen } from './components/analytics/PerformanceAnalyticsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { CapitalManagementModal } from './components/capital/CapitalManagementModal';
import { BackupRestoreModal } from './components/backup/BackupRestoreModal';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { Trade } from './types/trade';
import { TrendingUp, Loader2 } from 'lucide-react';

function MainApp() {
  const { currentUser, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<AppTab>('dashboard');
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Splash Screen while restoring Firebase session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center text-slate-100 select-none">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-2xl shadow-emerald-500/30 animate-pulse mb-4">
          <div className="w-full h-full rounded-[22px] bg-[#0c1322] flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-xl font-extrabold text-white tracking-wider">TradeJournal</h1>
        <p className="text-xs text-emerald-400 font-mono mt-1">Connecting to Firebase Cloud...</p>
        <Loader2 className="w-5 h-5 text-slate-500 animate-spin mt-6" />
      </div>
    );
  }

  // Protected Screen check
  if (!currentUser) {
    return <AuthScreen />;
  }

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setCurrentTab('entry');
  };

  const handleEntrySuccess = () => {
    setEditingTrade(null);
    setCurrentTab('history');
  };

  const handleEntryCancel = () => {
    setEditingTrade(null);
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'entry') setEditingTrade(null);
          setCurrentTab(tab);
        }}
        onOpenCapitalModal={() => setIsCapitalModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardScreen
            onNavigateToTab={(tab) => {
              if (tab !== 'entry') setEditingTrade(null);
              setCurrentTab(tab);
            }}
            onOpenCapitalModal={() => setIsCapitalModalOpen(true)}
            onOpenBackupModal={() => setIsBackupModalOpen(true)}
            onInspectTrade={(t) => {
              setEditingTrade(t);
              setCurrentTab('entry');
            }}
          />
        )}

        {currentTab === 'entry' && (
          <TradeEntryScreen
            editTrade={editingTrade}
            onSuccess={handleEntrySuccess}
            onCancel={handleEntryCancel}
          />
        )}

        {currentTab === 'history' && (
          <TradeHistoryScreen onEditTrade={handleEditTrade} />
        )}

        {currentTab === 'strategy_analytics' && (
          <StrategyAnalyticsScreen />
        )}

        {currentTab === 'setup_analytics' && (
          <SetupAnalyticsScreen />
        )}

        {currentTab === 'performance_analytics' && (
          <PerformanceAnalyticsScreen />
        )}

        {currentTab === 'settings' && (
          <SettingsScreen
            onOpenCapitalModal={() => setIsCapitalModalOpen(true)}
            onOpenBackupModal={() => setIsBackupModalOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'entry') setEditingTrade(null);
          setCurrentTab(tab);
        }}
      />

      {/* Capital Management Modal */}
      <CapitalManagementModal
        isOpen={isCapitalModalOpen}
        onClose={() => setIsCapitalModalOpen(false)}
      />

      {/* Backup & Restore Modal */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TradesProvider>
        <MainApp />
      </TradesProvider>
    </AuthProvider>
  );
}
