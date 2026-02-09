
import React from 'react';
import { MutualFund } from '../types';

interface ComparisonToolProps {
  funds: MutualFund[];
}

const ComparisonTool: React.FC<ComparisonToolProps> = ({ funds }) => {
  if (funds.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Pro Comparison: Risk & Consistency</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="py-4 pr-6 text-sm font-semibold text-slate-500 min-w-[150px]">Metric</th>
            {funds.map(f => (
              <th key={f.id} className="py-4 px-4 text-sm font-bold text-slate-800 min-w-[180px] text-center">
                {f.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm">
          <tr className="border-b border-slate-50 hover:bg-slate-50/50">
            <td className="py-4 pr-6 font-medium text-slate-600">Category</td>
            {funds.map(f => <td key={f.id} className="py-4 px-4 text-center text-slate-800">{f.category}</td>)}
          </tr>
          <tr className="border-b border-slate-50 bg-indigo-50/30">
            <td className="py-4 pr-6 font-bold text-indigo-600">Alpha (vs Bench)</td>
            {funds.map(f => (
              <td key={f.id} className={`py-4 px-4 text-center font-black ${f.riskRatios.alpha > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {f.riskRatios.alpha > 0 ? '+' : ''}{f.riskRatios.alpha}%
              </td>
            ))}
          </tr>
          <tr className="border-b border-slate-50 hover:bg-slate-50/50">
            <td className="py-4 pr-6 font-medium text-slate-600">Sharpe Ratio</td>
            {funds.map(f => <td key={f.id} className="py-4 px-4 text-center text-slate-800 font-bold">{f.riskRatios.sharpe}</td>)}
          </tr>
          <tr className="border-b border-slate-50 hover:bg-slate-50/50">
            <td className="py-4 pr-6 font-medium text-slate-600">Standard Dev.</td>
            {funds.map(f => <td key={f.id} className="py-4 px-4 text-center text-slate-800">{f.riskRatios.standardDeviation}%</td>)}
          </tr>
          <tr className="border-b border-slate-50 hover:bg-slate-50/50">
            <td className="py-4 pr-6 font-medium text-slate-600">Rolling Consistency</td>
            {funds.map(f => <td key={f.id} className="py-4 px-4 text-center text-slate-800 font-bold">{f.returns.rolling}%</td>)}
          </tr>
          <tr className="border-b border-slate-50 hover:bg-slate-50/50">
            <td className="py-4 pr-6 font-medium text-slate-600">Exit Load</td>
            {funds.map(f => <td key={f.id} className="py-4 px-4 text-center text-[10px] text-slate-500 leading-tight">{f.exitLoad}</td>)}
          </tr>
          <tr className="border-b border-slate-50 hover:bg-slate-50/50">
            <td className="py-4 pr-6 font-medium text-slate-600">Tenure of Manager</td>
            {funds.map(f => <td key={f.id} className="py-4 px-4 text-center text-slate-800">{f.manager.tenureYears} Years</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTool;
