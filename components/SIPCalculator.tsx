
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

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-slate-800">SIP Profit Predictor</h2>
        <div className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-widest">
          Dynamic Projections
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Input Controls */}
        <div className="space-y-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Monthly SIP</label>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">₹{sip.toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range" min="500" max="200000" step="500" value={sip}
                onChange={(e) => setSip(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Duration</label>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{years} Years</span>
              </div>
              <input 
                type="range" min="1" max="40" value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Returns (p.a.)</label>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{returnRate}%</span>
              </div>
              <input 
                type="range" min="1" max="30" value={returnRate}
                onChange={(e) => setReturnRate(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Annual Step-up</label>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{stepUp}%</span>
              </div>
              <input 
                type="range" min="0" max="50" value={stepUp}
                onChange={(e) => setStepUp(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Amount Displays - Redesigned for full visibility */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center min-w-0">
            <p className="text-[10px] text-slate-400 uppercase font-black mb-1 whitespace-nowrap">Total Invested</p>
            <p className="text-lg xl:text-xl font-black text-slate-800 break-words" title={finalInvested.toLocaleString('en-IN')}>
              {formatCurrency(finalInvested)}
            </p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-green-100 shadow-sm flex flex-col justify-center min-w-0">
            <p className="text-[10px] text-green-600 uppercase font-black mb-1 whitespace-nowrap">Est. Profit</p>
            <p className="text-lg xl:text-xl font-black text-green-600 break-words" title={profit.toLocaleString('en-IN')}>
              +{formatCurrency(profit)}
            </p>
          </div>
          <div className="p-4 bg-indigo-600 rounded-2xl shadow-md flex flex-col justify-center min-w-0 ring-4 ring-indigo-50">
            <p className="text-[10px] text-indigo-100 uppercase font-black mb-1 whitespace-nowrap">Total Wealth</p>
            <p className="text-xl xl:text-2xl font-black text-white break-words" title={finalValue.toLocaleString('en-IN')}>
              {formatCurrency(finalValue)}
            </p>
          </div>
        </div>

        {/* Visual Chart */}
        <div className="h-[200px] w-full bg-white rounded-2xl p-2 border border-slate-50">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="year" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: '900', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} animationDuration={1000} />
              <Area type="monotone" dataKey="invested" stroke="#94a3b8" fill="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={0.05} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Total Wealth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Principal</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 text-center italic font-medium leading-relaxed">
          Step-up SIPs of ₹{sip.toLocaleString('en-IN')} with {stepUp}% growth over {years} years can result in a wealth multiplier of <span className="text-indigo-600 font-bold">{((finalValue/finalInvested)).toFixed(1)}x</span>.
        </p>
      </div>
    </div>
  );
};

export default SIPCalculator;
