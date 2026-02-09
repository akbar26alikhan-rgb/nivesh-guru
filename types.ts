
export type RiskProfile = 'Low' | 'Medium' | 'High';
export type InvestmentHorizon = '1 Year' | '3 Years' | '5 Years' | '10+ Years';
export type GoalType = 'Wealth Creation' | 'Retirement' | 'Child Education' | 'House Purchase' | 'Emergency Fund';

export interface UserInputs {
  sipAmount: number;
  lumpSum: number;
  horizon: InvestmentHorizon;
  riskProfile: RiskProfile;
  goalType: GoalType;
  targetAmount?: number;
}

export interface RiskRatios {
  sharpe: number;
  alpha: number;
  beta: number;
  sortino: number;
  standardDeviation: number;
}

export interface FundScore {
  total: number;
  returns: number;
  expense: number;
  manager: number;
  volatility: number;
  aum: number;
  drawdown: number;
  quality: number;
}

export interface MutualFund {
  id: string;
  schemeCode: string; // AMFI/MFAPI Code
  name: string;
  category: string;
  risk: RiskProfile;
  expenseRatio: number;
  exitLoad: string;
  aum: string;
  aumValue: number;
  benchmarkName: string;
  currentNav?: number;
  lastUpdated?: string;
  returns: {
    '1y': number;
    '3y': number;
    '5y': number;
    '10y': number;
    'rolling': number;
  };
  benchmarkReturns: {
    '5y': number;
  };
  manager: {
    name: string;
    experience: number;
    rating: number;
    tenureYears: number;
  };
  holdings: string[];
  riskRatios: RiskRatios;
  score: FundScore;
  description: string;
  redFlags: string[];
}
