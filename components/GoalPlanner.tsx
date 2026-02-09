
import React, { useState, useMemo } from 'react';
import { Target, ArrowRight } from 'lucide-react';

const GoalPlanner: React.FC = () => {
  const [target, setTarget] = useState(5000000); // 50 Lakhs
  const [years, setYears] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);

  const requiredSIP = useMemo(() => {
    const i = (expectedReturn / 100) / 12;
    const n = years * 12;
    // P = Target / [ ((1+i)^n - 1) / i * (1+i) ]
    const denominator = ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    return Math.round(target / denominator);
  }, [target, years, expectedReturn]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-600" />
        Reverse Goal Planner
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">My Target Wealth: ₹{target.toLocaleString()}</label>
          <input 
            type="range" min="100000" max="100000000" step="100000" value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Years to Goal: {years}</label>
            <input 
              type="range" min="1" max="40" value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Expected Return: {expectedReturn}%</label>
            <input 
              type="range" min="5" max="25" value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        <div className="p-6 bg-indigo-600 rounded-2xl text-white text-center">
          <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-1">Required Monthly SIP</p>
          <p className="text-4xl font-black">₹{requiredSIP.toLocaleString()}</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-indigo-200 text-xs font-semibold">
            <span>START NOW</span>
            <ArrowRight className="w-3 h-3" />
            <span>BECOME A CROREPATI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalPlanner;
