import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth } from './AuthContext';
import { Trade, CapitalTransaction, DashboardKPIs, TraderScoreMetrics, DEFAULT_STRATEGIES } from '../types/trade';

interface TradesContextType {
  trades: Trade[];
  strategies: string[];
  capitalTransactions: CapitalTransaction[];
  loadingTrades: boolean;
  kpis: DashboardKPIs;
  addTrade: (trade: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  updateTrade: (tradeId: string, trade: Partial<Trade>) => Promise<void>;
  deleteTrade: (tradeId: string) => Promise<void>;
  bulkDeleteTrades: (tradeIds: string[]) => Promise<void>;
  addCapitalTransaction: (type: 'DEPOSIT' | 'WITHDRAWAL' | 'ADJUSTMENT', amount: number, notes?: string) => Promise<void>;
  addCustomStrategy: (strategyName: string) => Promise<void>;
  exportToCSV: () => void;
  exportToExcel: () => void;
  backupAllTradesJSON: () => void;
  restoreTradesFromJSON: (jsonData: string) => Promise<{ imported: number; errors: number }>;
}

const TradesContext = createContext<TradesContextType | undefined>(undefined);

export const TradesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [capitalTransactions, setCapitalTransactions] = useState<CapitalTransaction[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(true);

  // Sync user trades in realtime from Firestore
  useEffect(() => {
    if (!currentUser) {
      setTrades([]);
      setCapitalTransactions([]);
      setLoadingTrades(false);
      return;
    }

    setLoadingTrades(true);
    const tradesPath = `users/${currentUser.uid}/trades`;
    const tradesRef = collection(db, tradesPath);
    const tradesQuery = query(tradesRef, orderBy('tradeDate', 'desc'));

    const unsubscribeTrades = onSnapshot(
      tradesQuery,
      (snapshot) => {
        const fetchedTrades: Trade[] = [];
        snapshot.forEach((docSnap) => {
          fetchedTrades.push({ id: docSnap.id, ...(docSnap.data() as Omit<Trade, 'id'>) });
        });
        setTrades(fetchedTrades);
        setLoadingTrades(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, tradesPath);
      }
    );

    // Sync capital transactions
    const capitalPath = `users/${currentUser.uid}/capital`;
    const capitalRef = collection(db, capitalPath);
    const capitalQuery = query(capitalRef, orderBy('date', 'desc'));

    const unsubscribeCapital = onSnapshot(
      capitalQuery,
      (snapshot) => {
        const fetchedTransactions: CapitalTransaction[] = [];
        snapshot.forEach((docSnap) => {
          fetchedTransactions.push({ id: docSnap.id, ...(docSnap.data() as Omit<CapitalTransaction, 'id'>) });
        });
        setCapitalTransactions(fetchedTransactions);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, capitalPath);
      }
    );

    return () => {
      unsubscribeTrades();
      unsubscribeCapital();
    };
  }, [currentUser]);

  // Add a new trade
  const addTrade = async (tradeData: Omit<Trade, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');
    const tradeId = 't_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const tradePath = `users/${currentUser.uid}/trades/${tradeId}`;
    
    // Clean and validate payload
    const payload: Trade = {
      id: tradeId,
      userId: currentUser.uid,
      tradeDate: tradeData.tradeDate,
      symbol: tradeData.symbol.toUpperCase().trim(),
      tradeType: tradeData.tradeType || 'LONG',
      quantity: Number(tradeData.quantity) || 1,
      entryPrice: tradeData.entryPrice !== undefined ? Number(tradeData.entryPrice) : 0,
      exitPrice: tradeData.exitPrice !== undefined ? Number(tradeData.exitPrice) : 0,
      profitLoss: Number(tradeData.profitLoss) || 0,
      strategy: tradeData.strategy,
      setup: tradeData.setup?.trim() || '',
      confidenceLevel: Math.min(10, Math.max(1, Number(tradeData.confidenceLevel) || 5)),
      notes: tradeData.notes || '',
      imageUrl: tradeData.imageUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'trades', tradeId), payload);
      return tradeId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, tradePath);
    }
  };

  // Update existing trade
  const updateTrade = async (tradeId: string, tradeData: Partial<Trade>) => {
    if (!currentUser) throw new Error('User not authenticated');
    const tradePath = `users/${currentUser.uid}/trades/${tradeId}`;

    const updatePayload: Record<string, unknown> = {
      ...tradeData,
      updatedAt: new Date().toISOString(),
    };
    if (updatePayload.symbol && typeof updatePayload.symbol === 'string') {
      updatePayload.symbol = updatePayload.symbol.toUpperCase().trim();
    }
    delete updatePayload.id;
    delete updatePayload.userId;
    delete updatePayload.createdAt;

    try {
      await updateDoc(doc(db, 'users', currentUser.uid, 'trades', tradeId), updatePayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, tradePath);
    }
  };

  // Delete single trade
  const deleteTrade = async (tradeId: string) => {
    if (!currentUser) throw new Error('User not authenticated');
    const tradePath = `users/${currentUser.uid}/trades/${tradeId}`;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'trades', tradeId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, tradePath);
    }
  };

  // Bulk delete trades
  const bulkDeleteTrades = async (tradeIds: string[]) => {
    if (!currentUser || tradeIds.length === 0) return;
    const batch = writeBatch(db);
    tradeIds.forEach((id) => {
      const ref = doc(db, 'users', currentUser.uid, 'trades', id);
      batch.delete(ref);
    });
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${currentUser.uid}/trades`);
    }
  };

  // Add capital movement
  const addCapitalTransaction = async (
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'ADJUSTMENT',
    amount: number,
    notes?: string
  ) => {
    if (!currentUser) throw new Error('User not authenticated');
    const capitalId = 'c_' + Date.now();
    const capitalDocRef = doc(db, 'users', currentUser.uid, 'capital', capitalId);

    const payload: CapitalTransaction = {
      id: capitalId,
      userId: currentUser.uid,
      type,
      amount: Math.abs(amount),
      date: new Date().toISOString().split('T')[0],
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(capitalDocRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${currentUser.uid}/capital/${capitalId}`);
    }
  };

  // Combine default strategies, user custom strategies, and any trade strategies
  const strategies = useMemo(() => {
    const set = new Set<string>(DEFAULT_STRATEGIES);
    if (userProfile?.customStrategies && Array.isArray(userProfile.customStrategies)) {
      userProfile.customStrategies.forEach((s) => {
        if (s && s.trim()) set.add(s.trim());
      });
    }
    trades.forEach((t) => {
      if (t.strategy && t.strategy.trim()) set.add(t.strategy.trim());
    });
    return Array.from(set);
  }, [userProfile?.customStrategies, trades]);

  // Add custom strategy to user's playbook
  const addCustomStrategy = async (strategyName: string) => {
    const trimmed = strategyName.trim();
    if (!trimmed || !currentUser) return;

    const existing = userProfile?.customStrategies || [];
    if (existing.includes(trimmed)) return;

    const updated = [...existing, trimmed];
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, {
        customStrategies: updated,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  // Calculate comprehensive institutional KPIs and Trader Score
  const kpis: DashboardKPIs = useMemo(() => {
    let winningTrades = 0;
    let losingTrades = 0;
    let breakEvenTrades = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let netProfit = 0;

    trades.forEach((t) => {
      const pnl = Number(t.profitLoss) || 0;
      netProfit += pnl;
      if (pnl > 0) {
        winningTrades++;
        grossProfit += pnl;
      } else if (pnl < 0) {
        losingTrades++;
        grossLoss += Math.abs(pnl);
      } else {
        breakEvenTrades++;
      }
    });

    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const lossRate = totalTrades > 0 ? (losingTrades / totalTrades) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.9 : 0;
    const averageWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
    const averageLoss = losingTrades > 0 ? grossLoss / losingTrades : 0;
    const payoffRatio = averageLoss > 0 ? averageWin / averageLoss : averageWin > 0 ? 5 : 0;
    const averageTrade = totalTrades > 0 ? netProfit / totalTrades : 0;
    
    // Statistical Trading Expectancy (Expected value in $ per executed trade)
    // Expectancy = (Win% * AvgWin) - (Loss% * AvgLoss)
    const expectancy = totalTrades > 0
      ? ((winRate / 100) * averageWin) - ((lossRate / 100) * averageLoss)
      : 0;

    // Calculate maximum drawdown from equity curve
    let peak = userProfile?.initialCapital || 10000;
    let maxDrawdown = 0;
    let maxDrawdownPercentage = 0;
    let runningEquity = userProfile?.initialCapital || 10000;

    const chronological = [...trades].sort(
      (a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
    );

    chronological.forEach((t) => {
      runningEquity += Number(t.profitLoss) || 0;
      if (runningEquity > peak) {
        peak = runningEquity;
      }
      const dd = peak - runningEquity;
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
        if (peak > 0) {
          maxDrawdownPercentage = (dd / peak) * 100;
        }
      }
    });

    // Capital overview
    let totalDeposited = userProfile?.initialCapital || 10000;
    let totalWithdrawn = userProfile?.capitalWithdrawn || 0;

    capitalTransactions.forEach((c) => {
      if (c.type === 'DEPOSIT') totalDeposited += c.amount;
      if (c.type === 'WITHDRAWAL') totalWithdrawn += c.amount;
    });

    const currentBalance = totalDeposited - totalWithdrawn + netProfit;

    // Trader Score Algorithm (0 to 100)
    // 1. Profit Factor Score (0 - 25)
    let pfScore = 0;
    if (profitFactor >= 2.5) pfScore = 25;
    else if (profitFactor >= 1.8) pfScore = 21;
    else if (profitFactor >= 1.3) pfScore = 17;
    else if (profitFactor >= 1.0) pfScore = 12;
    else if (profitFactor > 0) pfScore = 5;

    // 2. Consistency & Win Rate Score (0 - 25)
    let consistencyScore = 0;
    if (winRate >= 65) consistencyScore = 25;
    else if (winRate >= 50) consistencyScore = 20;
    else if (winRate >= 40 && payoffRatio >= 2.0) consistencyScore = 22; // High R:R trend trader
    else if (winRate >= 35) consistencyScore = 14;
    else consistencyScore = Math.max(3, Math.round(winRate * 0.3));

    // 3. Expectancy Score (0 - 25)
    let expectancyScore = 0;
    if (expectancy > 200) expectancyScore = 25;
    else if (expectancy > 100) expectancyScore = 21;
    else if (expectancy > 25) expectancyScore = 18;
    else if (expectancy > 0) expectancyScore = 14;
    else expectancyScore = 4;

    // 4. Risk Discipline & Drawdown Score (0 - 25)
    let riskDisciplineScore = 0;
    if (maxDrawdownPercentage <= 5) riskDisciplineScore = 25;
    else if (maxDrawdownPercentage <= 10) riskDisciplineScore = 22;
    else if (maxDrawdownPercentage <= 18) riskDisciplineScore = 17;
    else if (maxDrawdownPercentage <= 28) riskDisciplineScore = 11;
    else riskDisciplineScore = 5;

    const totalScore = totalTrades === 0
      ? 50
      : Math.min(100, Math.max(10, pfScore + consistencyScore + expectancyScore + riskDisciplineScore));

    let grade: TraderScoreMetrics['grade'] = 'Developing';
    let badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    const recommendations: string[] = [];

    if (totalScore >= 88) {
      grade = 'Elite Institutional';
      badgeColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40';
      recommendations.push('Superb capital preservation and edge execution.');
      recommendations.push('Maintain strict risk per trade as position sizes scale up.');
    } else if (totalScore >= 75) {
      grade = 'Professional';
      badgeColor = 'text-cyan-400 bg-cyan-500/15 border-cyan-500/40';
      recommendations.push('Strong positive mathematical expectancy.');
      recommendations.push('Focus on trimming tail-end losses to boost profit factor beyond 2.0.');
    } else if (totalScore >= 62) {
      grade = 'Consistent Trader';
      badgeColor = 'text-teal-400 bg-teal-500/15 border-teal-500/40';
      recommendations.push('Solid base established. Protect against overtrading on drawdown days.');
      recommendations.push('Review low-confidence entries to prune negative expectancy setups.');
    } else if (totalScore >= 45) {
      grade = 'Developing';
      badgeColor = 'text-amber-400 bg-amber-500/15 border-amber-500/40';
      recommendations.push('Tighten stop loss parameters to increase payoff ratio.');
      recommendations.push('Stick strictly to top performing strategies.');
    } else {
      grade = 'High Risk';
      badgeColor = 'text-rose-400 bg-rose-500/15 border-rose-500/40';
      recommendations.push('Pause live sizing: gross losses exceed profits.');
      recommendations.push('Review trade risk-reward ratios and reduce contract sizing.');
    }

    const traderScore: TraderScoreMetrics = {
      score: totalScore,
      grade,
      badgeColor,
      consistencyScore,
      profitFactorScore: pfScore,
      expectancyScore,
      riskDisciplineScore,
      recommendations,
    };

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      breakEvenTrades,
      winRate: Math.round(winRate * 10) / 10,
      netProfit: Math.round(netProfit * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossLoss: Math.round(grossLoss * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      expectancy: Math.round(expectancy * 100) / 100,
      averageWin: Math.round(averageWin * 100) / 100,
      averageLoss: Math.round(averageLoss * 100) / 100,
      payoffRatio: Math.round(payoffRatio * 100) / 100,
      averageTrade: Math.round(averageTrade * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      maxDrawdownPercentage: Math.round(maxDrawdownPercentage * 10) / 10,
      currentBalance: Math.round(currentBalance * 100) / 100,
      totalDeposited: Math.round(totalDeposited * 100) / 100,
      totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
      traderScore,
    };
  }, [trades, capitalTransactions, userProfile]);

  // Export to CSV
  const exportToCSV = () => {
    if (trades.length === 0) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const filename = `TradeJournal_Backup_${todayStr}.csv`;

    const headers = [
      'Trade Date',
      'Symbol',
      'Direction',
      'Quantity',
      'Entry Price',
      'Exit Price',
      'Profit / Loss',
      'Strategy',
      'Setup',
      'Confidence (1-10)',
      'Notes',
      'Created At',
    ];

    const rows = trades.map((t) => [
      t.tradeDate,
      t.symbol,
      t.tradeType || 'LONG',
      t.quantity,
      t.entryPrice || '',
      t.exitPrice || '',
      t.profitLoss,
      `"${(t.strategy || '').replace(/"/g, '""')}"`,
      `"${(t.setup || '').replace(/"/g, '""')}"`,
      t.confidenceLevel,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      t.createdAt || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Excel compatible XML format
  const exportToExcel = () => {
    if (trades.length === 0) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const filename = `TradeJournal_Backup_${todayStr}.xls`;

    let table = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8" /></head>
      <body>
        <table border="1">
          <tr style="background-color: #0f172a; color: #ffffff; font-weight: bold;">
            <th>Trade Date</th>
            <th>Symbol</th>
            <th>Direction</th>
            <th>Quantity</th>
            <th>Entry Price</th>
            <th>Exit Price</th>
            <th>Profit / Loss</th>
            <th>Strategy</th>
            <th>Setup</th>
            <th>Confidence</th>
            <th>Notes</th>
          </tr>
    `;

    trades.forEach((t) => {
      const isProfit = t.profitLoss >= 0;
      const color = isProfit ? '#10b981' : '#ef4444';
      table += `
        <tr>
          <td>${t.tradeDate}</td>
          <td style="font-weight: bold;">${t.symbol}</td>
          <td>${t.tradeType || 'LONG'}</td>
          <td>${t.quantity}</td>
          <td>${t.entryPrice || 0}</td>
          <td>${t.exitPrice || 0}</td>
          <td style="color: ${color}; font-weight: bold;">${t.profitLoss}</td>
          <td>${t.strategy}</td>
          <td>${t.setup || ''}</td>
          <td>${t.confidenceLevel}</td>
          <td>${t.notes || ''}</td>
        </tr>
      `;
    });

    table += `</table></body></html>`;

    const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Full backup JSON export
  const backupAllTradesJSON = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const backupData = {
      appName: 'TradeJournal',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: {
        email: currentUser?.email,
        uid: currentUser?.uid,
      },
      kpis,
      trades,
      capitalTransactions,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TradeJournal_Backup_${todayStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Restore trades from JSON backup file
  const restoreTradesFromJSON = async (jsonData: string): Promise<{ imported: number; errors: number }> => {
    if (!currentUser) throw new Error('User not authenticated');
    let parsed: any;
    try {
      parsed = JSON.parse(jsonData);
    } catch {
      throw new Error('Invalid JSON file format');
    }

    const itemsToImport: any[] = Array.isArray(parsed) ? parsed : parsed.trades || [];
    if (!Array.isArray(itemsToImport) || itemsToImport.length === 0) {
      throw new Error('No valid trade records found in file');
    }

    let imported = 0;
    let errors = 0;

    for (const item of itemsToImport) {
      try {
        if (!item.symbol || item.profitLoss === undefined) {
          errors++;
          continue;
        }
        await addTrade({
          tradeDate: item.tradeDate || new Date().toISOString().split('T')[0],
          symbol: item.symbol,
          tradeType: item.tradeType || 'LONG',
          quantity: Number(item.quantity) || 1,
          entryPrice: item.entryPrice ? Number(item.entryPrice) : 0,
          exitPrice: item.exitPrice ? Number(item.exitPrice) : 0,
          profitLoss: Number(item.profitLoss) || 0,
          strategy: item.strategy || 'Other',
          setup: item.setup || '',
          confidenceLevel: Number(item.confidenceLevel) || 5,
          notes: item.notes || '',
          imageUrl: item.imageUrl || '',
        });
        imported++;
      } catch (e) {
        console.error('Import item error:', e);
        errors++;
      }
    }

    return { imported, errors };
  };

  return (
    <TradesContext.Provider
      value={{
        trades,
        strategies,
        capitalTransactions,
        loadingTrades,
        kpis,
        addTrade,
        updateTrade,
        deleteTrade,
        bulkDeleteTrades,
        addCapitalTransaction,
        addCustomStrategy,
        exportToCSV,
        exportToExcel,
        backupAllTradesJSON,
        restoreTradesFromJSON,
      }}
    >
      {children}
    </TradesContext.Provider>
  );
};

export function useTrades() {
  const context = useContext(TradesContext);
  if (!context) {
    throw new Error('useTrades must be used within a TradesProvider');
  }
  return context;
}
