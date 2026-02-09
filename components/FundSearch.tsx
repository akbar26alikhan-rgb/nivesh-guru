
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, ArrowUpRight, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { searchFunds, MFSearchItem } from '../services/mfDataService';

interface FundSearchProps {
  onSelectFund: (schemeCode: number) => void;
}

interface FilterState {
  category: string;
  risk: string;
  maxExpense: number;
  minAum: number;
}

const CATEGORIES = ['All', 'Small Cap', 'Mid Cap', 'Large Cap', 'Index Fund', 'Flexi Cap', 'Debt', 'Liquid'];
const RISKS = ['All', 'Low', 'Medium', 'High'];

const FundSearch: React.FC<FundSearchProps> = ({ onSelectFund }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MFSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    category: 'All',
    risk: 'All',
    maxExpense: 2.5,
    minAum: 0
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 3) {
        setIsLoading(true);
        const searchResults = await searchFunds(query);
        setResults(searchResults);
        setIsLoading(false);
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Client-side refinement based on name heuristics (since API doesn't provide metadata in search)
  const filteredResults = useMemo(() => {
    let list = results;
    
    if (filters.category !== 'All') {
      const cat = filters.category.toLowerCase();
      list = list.filter(item => item.schemeName.toLowerCase().includes(cat));
    }
    
    // Risk level is harder to guess from name, but we can look for "Low Duration" etc.
    if (filters.risk === 'Low') {
      list = list.filter(item => 
        item.schemeName.toLowerCase().includes('index') || 
        item.schemeName.toLowerCase().includes('liquid') ||
        item.schemeName.toLowerCase().includes('debt')
      );
    } else if (filters.risk === 'High') {
      list = list.filter(item => 
        item.schemeName.toLowerCase().includes('small') || 
        item.schemeName.toLowerCase().includes('mid')
      );
    }

    return list.slice(0, 15); // Show more results when filtering is active
  }, [results, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'All') count++;
    if (filters.risk !== 'All') count++;
    if (filters.maxExpense < 2.5) count++;
    if (filters.minAum > 0) count++;
    return count;
  }, [filters]);

  return (
    <div className="relative w-full max-w-3xl mx-auto space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className={`flex-1 flex items-center gap-3 bg-white border-2 rounded-2xl px-4 py-3 transition-all duration-300 ${isFocused ? 'border-indigo-500 shadow-lg ring-4 ring-indigo-50/50' : 'border-slate-100'}`}>
          {isLoading ? <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /> : <Search className="w-5 h-5 text-slate-400" />}
          <input
            type="text"
            placeholder="Search 10,000+ Indian Mutual Funds..."
            className="bg-transparent border-none outline-none w-full text-slate-800 font-medium placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border-2 ${showFilters || activeFilterCount > 0 ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'}`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-white text-indigo-600 text-[10px] rounded-full">
              {activeFilterCount}
            </span>
          )}
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-slate-800">Refine Search Results</h4>
            <button 
              onClick={() => setFilters({ category: 'All', risk: 'All', maxExpense: 2.5, minAum: 0 })}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Reset All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilters({ ...filters, category: cat })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filters.category === cat ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Risk Tolerance</label>
                <div className="flex flex-wrap gap-2">
                  {RISKS.map(risk => (
                    <button
                      key={risk}
                      onClick={() => setFilters({ ...filters, risk })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filters.risk === risk ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {risk}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Expense Ratio</label>
                  <span className="text-xs font-bold text-indigo-600">{filters.maxExpense}%</span>
                </div>
                <input 
                  type="range" min="0.1" max="2.5" step="0.1" value={filters.maxExpense}
                  onChange={(e) => setFilters({ ...filters, maxExpense: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2">
                  <span>0.1%</span>
                  <span>2.5%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Min AUM (₹ Crores)</label>
                  <span className="text-xs font-bold text-indigo-600">₹{filters.minAum} Cr</span>
                </div>
                <input 
                  type="range" min="0" max="50000" step="500" value={filters.minAum}
                  onChange={(e) => setFilters({ ...filters, minAum: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2">
                  <span>₹0 Cr</span>
                  <span>₹50,000 Cr</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-50 text-[10px] text-slate-400 italic">
            * Note: Expense and AUM filters are applied during deep-analysis after selecting a fund. Name-based heuristics are used for category and risk filtering in search results.
          </div>
        </div>
      )}

      {isFocused && (filteredResults.length > 0 || query.length >= 3) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
          {isLoading && filteredResults.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
               <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-indigo-500" />
               <p className="text-sm font-medium">Scanning Global Database...</p>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto">
              {filteredResults.map((item) => (
                <button
                  key={item.schemeCode}
                  onClick={() => onSelectFund(item.schemeCode)}
                  className="w-full text-left px-5 py-4 hover:bg-indigo-50/50 flex items-center justify-between group border-b border-slate-50 last:border-0"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-bold text-slate-800 truncate text-sm group-hover:text-indigo-600 transition-colors">
                      {item.schemeName}
                    </p>
                    <div className="flex gap-3 mt-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Code: {item.schemeCode}
                      </p>
                      {item.schemeName.toLowerCase().includes('direct') && (
                        <span className="text-[8px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded font-black uppercase">Direct</span>
                      )}
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </button>
              ))}
            </div>
          ) : query.length >= 3 && !isLoading ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm font-medium">No funds found matching your search and filters.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default FundSearch;
