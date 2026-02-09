
import React from 'react';
import { FundScore } from '../types';

interface FundScoreCardProps {
  score: FundScore;
}

const FundScoreCard: React.FC<FundScoreCardProps> = ({ score }) => {
  const categories = [
    { label: 'Returns Consistency', value: score.returns, max: 30, color: 'bg-green-500' },
    { label: 'Expense Ratio', value: score.expense, max: 15, color: 'bg-blue-500' },
    { label: 'Manager Track Record', value: score.manager, max: 15, color: 'bg-purple-500' },
    { label: 'Risk/Volatility', value: score.volatility, max: 15, color: 'bg-orange-500' },
    { label: 'AUM Stability', value: score.aum, max: 10, color: 'bg-indigo-500' },
    { label: 'Downside Protection', value: score.drawdown, max: 10, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-3 mt-4">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-semibold text-slate-600">Total Score</span>
        <span className="text-3xl font-bold text-slate-800">{score.total}<span className="text-sm text-slate-400 font-normal">/100</span></span>
      </div>
      {categories.map((cat, idx) => (
        <div key={idx}>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>{cat.label}</span>
            <span>{cat.value} / {cat.max}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${cat.color} transition-all duration-1000`} 
              style={{ width: `${(cat.value / cat.max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FundScoreCard;
