
import { MutualFund } from './types';

export const MOCK_FUNDS: MutualFund[] = [
  {
    id: '1',
    schemeCode: '120847', // Quant Small Cap
    name: 'Quant Small Cap Fund - Growth',
    category: 'Small Cap',
    risk: 'High',
    expenseRatio: 0.77,
    exitLoad: '1% if redeemed within 1 year',
    aum: '₹17,400 Cr',
    aumValue: 17400,
    benchmarkName: 'Nifty Smallcap 250 TRI',
    returns: { '1y': 52.4, '3y': 38.2, '5y': 32.1, '10y': 24.5, 'rolling': 28.5 },
    benchmarkReturns: { '5y': 22.1 },
    manager: { name: 'Ankit Pande', experience: 12, rating: 4.8, tenureYears: 4 },
    holdings: ['Reliance Industries', 'Jio Financial', 'HDFC Bank'],
    riskRatios: { sharpe: 1.85, alpha: 8.2, beta: 1.15, sortino: 2.1, standardDeviation: 18.5 },
    score: { total: 92, returns: 28, expense: 12, manager: 14, volatility: 11, aum: 9, drawdown: 13, quality: 5 },
    description: 'Extremely aggressive fund using predictive analytics to capture momentum.',
    redFlags: []
  },
  {
    id: '2',
    schemeCode: '119598', // Parag Parikh Flexi Cap
    name: 'Parag Parikh Flexi Cap Fund - Direct',
    category: 'Flexi Cap',
    risk: 'Medium',
    expenseRatio: 0.61,
    exitLoad: '2% < 1yr, 1% < 2yrs',
    aum: '₹58,200 Cr',
    aumValue: 58200,
    benchmarkName: 'Nifty 500 TRI',
    returns: { '1y': 32.1, '3y': 22.4, '5y': 24.8, '10y': 19.8, 'rolling': 21.2 },
    benchmarkReturns: { '5y': 18.4 },
    manager: { name: 'Rajeev Thakkar', experience: 22, rating: 4.9, tenureYears: 11 },
    holdings: ['Alphabet Inc', 'ITC Ltd', 'Bajaj Holdings'],
    riskRatios: { sharpe: 1.45, alpha: 5.1, beta: 0.78, sortino: 1.9, standardDeviation: 12.4 },
    score: { total: 95, returns: 29, expense: 14, manager: 15, volatility: 14, aum: 10, drawdown: 9, quality: 4 },
    description: 'Value-oriented fund with international exposure and conservative approach.',
    redFlags: []
  },
  {
    id: '3',
    schemeCode: '143467', // Nippon India Nifty 50 Index
    name: 'Nippon India Nifty 50 Index Fund',
    category: 'Index Fund',
    risk: 'Low',
    expenseRatio: 0.15,
    exitLoad: 'Nil',
    aum: '₹3,200 Cr',
    aumValue: 3200,
    benchmarkName: 'Nifty 50 TRI',
    returns: { '1y': 21.2, '3y': 15.4, '5y': 14.1, '10y': 13.2, 'rolling': 13.8 },
    benchmarkReturns: { '5y': 14.1 },
    manager: { name: 'Himanshu Mange', experience: 8, rating: 4.2, tenureYears: 3 },
    holdings: ['HDFC Bank', 'Reliance', 'ICICI Bank', 'Infosys'],
    riskRatios: { sharpe: 0.95, alpha: -0.05, beta: 1.0, sortino: 1.1, standardDeviation: 14.1 },
    score: { total: 88, returns: 20, expense: 15, manager: 12, volatility: 15, aum: 8, drawdown: 13, quality: 5 },
    description: 'Low-cost tracker for Nifty 50, perfect for long-term core portfolios.',
    redFlags: []
  },
  {
    id: '4',
    schemeCode: '118989', // HDFC Mid-Cap Opportunities (Used for Red Flag sample)
    name: 'High-Cost Active Fund (Sample)',
    category: 'Mid Cap',
    risk: 'High',
    expenseRatio: 2.15,
    exitLoad: '1% if < 1yr',
    aum: '₹450 Cr',
    aumValue: 450,
    benchmarkName: 'Nifty Midcap 150 TRI',
    returns: { '1y': 15.5, '3y': 12.1, '5y': 10.4, '10y': 11.2, 'rolling': 9.5 },
    benchmarkReturns: { '5y': 20.4 },
    manager: { name: 'New Manager', experience: 5, rating: 2.5, tenureYears: 0.5 },
    holdings: ['Various Midcaps'],
    riskRatios: { sharpe: 0.45, alpha: -4.2, beta: 1.25, sortino: 0.5, standardDeviation: 22.1 },
    score: { total: 42, returns: 10, expense: 2, manager: 5, volatility: 8, aum: 3, drawdown: 9, quality: 5 },
    description: 'A sample fund showing red flags like high expense and low performance.',
    redFlags: ['High Expense Ratio', 'Underperforming Benchmark', 'Low AUM', 'Frequent Manager Change']
  }
];

export const CATEGORY_GUIDANCE = {
  'Index Fund': 'Perfect for beginners. Tracks Nifty/Sensex with the lowest fees.',
  'Large Cap': 'Relatively stable growth with India\'s top 100 companies.',
  'Flexi Cap': 'Dynamic allocation across company sizes. Managed for all-season growth.',
  'Mid Cap': 'Higher growth potential by investing in emerging industry leaders.',
  'Small Cap': 'High risk, high reward. Only for investors with 7+ years horizon.',
  'Debt / Liquid': 'Low risk preservation. Ideal for emergency funds or < 2 years goals.'
};
