
import React from 'react';
import { MutualFund } from '../types';
import { 
  TrendingUp, Shield, BarChart3, Users, 
  Info, AlertTriangle, Landmark, Scale,
  Zap, Calendar, Target, Sparkles
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface FundDetailViewProps {
  fund: MutualFund;
  onBack: () => void;
  aiData?: any;
}

const FundDetailView: React.FC<FundDetailViewProps> = ({ fund, onBack, aiData }) => {
  const returnMetrics = [
    { label: '1 Year', val: fund.returns['1y'] },
    { label: '3 Year', val: fund.returns['3y'] },
    { label: '5 Year', val: fund.returns['5y'] || aiData?.estimated5y || 'N/A' },
    { label: '10 Year', val: fund.returns['10y'] || 'N/A' },
  ];

  const riskRatios = aiData?.riskRatios || fund.riskRatios;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* Hero Header */}
      <div className="bg-indigo-600 p-8 text-white relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Landmark className="w-32 h-32" />
        </div>
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-indigo-100 hover:text-white transition-colors text-sm font-bold">
          ← Back to Explorer
        </button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">{fund.category}</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">{fund.risk} Risk</span>
            </div>
            <h2 className="text-3xl font-black leading-tight max-w-2xl">{fund.name}</h2>
            <p className="text-indigo-100 mt-2 font-medium">AMFI Code: {fund.schemeCode} • {fund.benchmarkName || aiData?.benchmark}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-right min-w-[180px]">
            <p className="text-[10px] font-black text-indigo-200 uppercase mb-1">Current NAV</p>
            <p className="text-4xl font-black">₹{fund.currentNav}</p>
            <p className="text-[10px] text-indigo-200 font-bold mt-1 uppercase">Synced: {fund.lastUpdated}</p>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Historical Performance */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Annualized Returns (CAGR)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {returnMetrics.map((m, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{m.label}</p>
                  <p className={`text-xl font-black ${Number(m.val) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {m.val !== 'N/A' ? `${parseFloat(m.val as any).toFixed(2)}%` : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Risk Ratios Grid */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Risk & Volatility Ratios
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {[
                { label: 'Sharpe', val: riskRatios.sharpe, hint: 'Returns/Risk' },
                { label: 'Alpha', val: riskRatios.alpha, hint: 'vs Market' },
                { label: 'Beta', val: riskRatios.beta, hint: 'Sensitivity' },
                { label: 'Sortino', val: riskRatios.sortino || riskRatios.sortinoRatio, hint: 'Downside' },
                { label: 'Std Dev', val: riskRatios.sd || riskRatios.standardDeviation, hint: 'Volatility' },
              ].map((r, i) => (
                <div key={i} className="text-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <p className="text-[9px] font-black text-indigo-400 uppercase">{r.label}</p>
                  <p className="text-lg font-black text-indigo-700">{r.val || '--'}</p>
                  <p className="text-[8px] text-slate-400 font-bold">{r.hint}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Performance Comparison Chart */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Comparison vs Category Average
            </h3>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-end mb-6">
                <div>
                   <p className="text-xs font-bold text-slate-400">CATEGORY AVERAGE (5Y)</p>
                   <p className="text-2xl font-black text-slate-800">{aiData?.catAvg5y || '--'}%</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold text-slate-400">FUND PERFORMANCE (5Y)</p>
                   <p className="text-2xl font-black text-indigo-600">{fund.returns['5y'] || '--'}%</p>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                 <div className="h-full bg-slate-400" style={{ width: `${(aiData?.catAvg5y || 0) * 2}%` }} />
                 <div className="h-full bg-indigo-600 border-l-2 border-white" style={{ width: `${(fund.returns['5y'] || 0) * 2}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium italic">*Estimations based on historical category trends.</p>
            </div>
          </section>

          {/* AI Strategic Advice */}
          <section className="p-6 bg-slate-900 rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-20 h-20" /></div>
            <h4 className="font-bold flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-indigo-400" />
              AI Strategic Outlook
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              {aiData?.aiStrategy || "Analyzing fund strategy... This fund demonstrates a specific focus on the category mandates. Recommended for investors with a horizon matching the underlying asset class volatility."}
            </p>
          </section>
        </div>

        {/* Sidebar Info Column */}
        <div className="space-y-6">
          {/* Fund Details Card */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
             <h4 className="text-sm font-black text-slate-800 uppercase mb-4 flex items-center gap-2">
               <Info className="w-4 h-4" />
               Scheme Info
             </h4>
             <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs text-slate-500 font-bold">Manager</span>
                  <span className="text-xs font-black text-slate-800">{aiData?.manager?.name || fund.manager.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs text-slate-500 font-bold">Experience</span>
                  <span className="text-xs font-black text-slate-800">{aiData?.manager?.exp || fund.manager.experience} Yrs</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs text-slate-500 font-bold">Expense Ratio</span>
                  <span className="text-xs font-black text-indigo-600">{aiData?.expenseRatio || fund.expenseRatio}%</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs text-slate-500 font-bold">Exit Load</span>
                  <span className="text-[10px] font-bold text-slate-800 text-right max-w-[120px]">{aiData?.exitLoad || fund.exitLoad}</span>
                </div>
             </div>
          </div>

          {/* Tax Impact Card */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
             <h4 className="text-sm font-black text-blue-800 uppercase mb-3 flex items-center gap-2">
               <Scale className="w-4 h-4" />
               Tax Implications
             </h4>
             <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
               {aiData?.taxSummary || "Taxation depends on the fund's asset allocation. Equity funds (65%+ equity) attract 12.5% LTCG after 1.25L exemption. Debt funds follow income tax slabs."}
             </p>
          </div>

          {/* Red Flags Card */}
          {(aiData?.redFlags?.length > 0 || fund.redFlags.length > 0) && (
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
              <h4 className="text-sm font-black text-red-800 uppercase mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Risk Watch (Red Flags)
              </h4>
              <div className="space-y-2">
                 {(aiData?.redFlags || fund.redFlags).map((flag: string, i: number) => (
                   <div key={i} className="flex gap-2 items-start">
                     <span className="text-red-500">🚩</span>
                     <p className="text-[10px] font-bold text-red-700">{flag}</p>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* Goal Fit */}
          <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg">
             <h4 className="text-sm font-black uppercase mb-3 flex items-center gap-2">
               <Target className="w-4 h-4" />
               Investor Fit
             </h4>
             <p className="text-xs font-medium text-indigo-100 leading-relaxed">
               Best suited for {fund.category.includes('Debt') ? 'Low-risk capital preservation' : 'Long-term wealth creation'}. 
               Suggested holding period: <span className="text-white font-black">{fund.category.includes('Small') ? '7+' : '3+'} Years</span>.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundDetailView;
