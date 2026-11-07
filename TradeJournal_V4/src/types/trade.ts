export type TradeStrategy = string;

export const DEFAULT_STRATEGIES = [
  'Breakout',
  'Pullback',
  'Reversal',
  'Trend Following',
  'Scalping',
  'Other',
];

export type TradeDirection = 'LONG' | 'SHORT';

export interface Trade {
  id: string;
  userId: string;
  tradeDate: string; // YYYY-MM-DD
  symbol: string;
  tradeType: TradeDirection;
  quantity: number;
  entryPrice?: number;
  exitPrice?: number;
  profitLoss: number; // positive = profit, negative = loss
  strategy: TradeStrategy;
  setup?: string;
  confidenceLevel: number; // 1 to 10 scale
  notes: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  initialCapital?: number;
  capitalDeposited?: number;
  capitalWithdrawn?: number;
  customStrategies?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type CapitalTransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'ADJUSTMENT';

export interface CapitalTransaction {
  id: string;
  userId: string;
  type: CapitalTransactionType;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface TraderScoreMetrics {
  score: number; // 0 to 100
  grade: 'Elite Institutional' | 'Professional' | 'Consistent Trader' | 'Developing' | 'High Risk';
  badgeColor: string;
  consistencyScore: number; // 0 - 25
  profitFactorScore: number; // 0 - 25
  expectancyScore: number; // 0 - 25
  riskDisciplineScore: number; // 0 - 25
  recommendations: string[];
}

export interface DashboardKPIs {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRate: number; // e.g. 62.5%
  netProfit: number; // Net P&L
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  expectancy: number; // (Win Rate * Avg Win) - (Loss Rate * Avg Loss)
  averageWin: number;
  averageLoss: number;
  payoffRatio: number; // Avg Win / Avg Loss
  averageTrade: number;
  maxDrawdown: number; // In dollars
  maxDrawdownPercentage: number; // In percent of peak equity
  currentBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  traderScore: TraderScoreMetrics;
}
