
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SIPCalculator: React.FC = () => {
  const [sip, setSip] = useState(10000);
  const [years, setYears] = useState(10);
  const [returnRate, setReturnRate] = useState(12);
  const [stepUp, setStepUp] = useState(10);

  const data = useMemo(() => {
    let currentSip = sip;
    let totalInvested = 0;
    let totalValue = 0;
    const chartData = [];

    for (let year = 1; year <= years; year++) {
      const yearlyInvested = currentSip * 12;
      totalInvested += yearlyInvested;
      
      // Calculate value for this year
      // Monthly compounding simplification
      const monthlyRate = (returnRate / 100) / 12;
      for (let m = 0; m < 12; m++) {
        totalValue = (totalValue + currentSip) * (1 + monthlyRate);
      }

      chartData.push({
        year: `Year ${year}`,
        invested: Math.round(totalInvested),
        value: Math.round(totalValue),
      });

      // Annual step up
      currentSip = currentSip * (1 + stepUp / 100);
    }
    return chartData;
  }, [sip, years, returnRate, stepUp]);

  const finalValue = data[data.length - 1]?.value || 0;
  const finalInvested = data[data.length - 1]?.invested || 0;
  const profit = finalValue - finalInvested;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
      <h2 className="text-xl font-bold text-slate-800 mb-6">SIP Profit Predictor</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Monthly SIP: ₹{sip.toLocaleString()}</label>
            <input 
              type="range" min="1000" max="100000" step="1000" value={sip}
              onChange={(e) => setSip(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Duration: {years} Years</label>
            <input 
              type="range" min="1" max="40" value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Expected Returns: {returnRate}% p.a.</label>
            <input 
              type="range" min="1" max="30" value={returnRate}
              onChange={(e) => setReturnRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Annual Step-up: {stepUp}%</label>
            <input 
              type="range" min="0" max="25" value={stepUp}
              onChange={(e) => setStepUp(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-xs text-slate-500 mt-2 italic">Pro-tip: Stepping up SIP by 10% every year can double your final wealth!</p>
          </div>

          <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Invested</p>
              <p className="text-lg font-bold text-slate-800">₹{finalInvested.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-xs text-indigo-600 uppercase tracking-wider font-semibold">Est. Wealth</p>
              <p className="text-xl font-black text-indigo-700">₹{finalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" hide />
              <YAxis hide />
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
              <Area type="monotone" dataKey="invested" stroke="#94a3b8" fill="#e2e8f0" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
              <span className="text-xs text-slate-600">Total Wealth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
              <span className="text-xs text-slate-600">Invested Capital</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIPCalculator;
