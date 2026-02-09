
import React, { useState, useEffect } from 'react';
import { Search, Loader2, ArrowUpRight, TrendingUp } from 'lucide-react';
import { searchFunds, MFSearchItem } from '../services/mfDataService';

interface FundSearchProps {
  onSelectFund: (schemeCode: number) => void;
}

const FundSearch: React.FC<FundSearchProps> = ({ onSelectFund }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MFSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 3) {
        setIsLoading(true);
        const searchResults = await searchFunds(query);
        setResults(searchResults.slice(0, 8)); // Limit to top 8
        setIsLoading(false);
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className={`flex items-center gap-3 bg-white border-2 rounded-2xl px-4 py-3 transition-all duration-300 ${isFocused ? 'border-indigo-500 shadow-lg ring-4 ring-indigo-50/50' : 'border-slate-100'}`}>
        {isLoading ? <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /> : <Search className="w-5 h-5 text-slate-400" />}
        <input
          type="text"
          placeholder="Search 10,000+ Indian Mutual Funds (e.g. SBI, HDFC, Quant)..."
          className="bg-transparent border-none outline-none w-full text-slate-800 font-medium placeholder:text-slate-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
      </div>

      {isFocused && (results.length > 0 || query.length >= 3) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
          {isLoading && results.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
               <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-indigo-500" />
               <p className="text-sm font-medium">Scanning AMFI Database...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto">
              {results.map((item) => (
                <button
                  key={item.schemeCode}
                  onClick={() => onSelectFund(item.schemeCode)}
                  className="w-full text-left px-5 py-4 hover:bg-slate-50 flex items-center justify-between group border-b border-slate-50 last:border-0"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-bold text-slate-800 truncate text-sm group-hover:text-indigo-600 transition-colors">
                      {item.schemeName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                      Scheme Code: {item.schemeCode}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </button>
              ))}
            </div>
          ) : query.length >= 3 && !isLoading ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm font-medium">No funds found matching "{query}"</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default FundSearch;
