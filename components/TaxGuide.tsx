
import React from 'react';
import { Landmark, Info } from 'lucide-react';

const TaxGuide: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Landmark className="w-5 h-5 text-slate-600" />
        India Tax Impact (Budget 2024-25)
      </h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Equity Mutual Funds
          </h4>
          <ul className="text-xs text-blue-900/70 space-y-2">
            <li>• <strong>LTCG:</strong> 12.5% on profits exceeding ₹1.25 Lakh per year (Held {'>'} 12 months).</li>
            <li>• <strong>STCG:</strong> Flat 20% on all profits if held for less than 12 months.</li>
          </ul>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <h4 className="font-bold text-slate-800 text-sm mb-2">Debt & Others</h4>
          <ul className="text-xs text-slate-600 space-y-2">
            <li>• <strong>Debt Funds:</strong> Taxed as per your Income Tax Slab (no indexation benefit anymore).</li>
            <li>• <strong>Gold/International:</strong> Taxed as per Income Tax Slab for investments after April 2023.</li>
          </ul>
        </div>

        <div className="text-[10px] text-slate-400 italic">
          Tip: Use the ₹1.25 Lakh exemption wisely by "Harvesting" LTCG annually.
        </div>
      </div>
    </div>
  );
};

export default TaxGuide;
