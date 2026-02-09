
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, ArrowUpRight, Filter, X, ChevronDown, ChevronUp, Layers, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';
import { searchFunds, MFSearchItem } from '../services/mfDataService';

interface FundSearchProps {
  onSelectFund: (schemeCode: number) => void;
}

interface FilterState {
  category: string;
  risk: string;
  maxExpense: number;
  minAum: number;
  planType: 'All' | 'Direct' | 'Regular';
}

const CATEGORY_GROUPS = [
  {
    name: 'Equity',
    icon: <TrendingUp className="w-3 h-3" />,
    items: ['All Equity', 'Large Cap', 'Mid Cap', 'Small Cap', 'Flexi Cap', 'Multi Cap', 'ELSS', 'Focused', 'Value', 'Sectoral']
  },
  {
    name: 'Debt',
    icon: <ShieldAlert className="w-3 h-3" />,
    items: ['All Debt', 'Liquid', 'Overnight', 'Ultra Short', 'Low Duration', 'Corporate Bond', 'Gilt', 'Banking & PSU']
  },
  {
    name: 'Hybrid',
    icon: <Layers className="w-3 h-3" />,
    items: ['All Hybrid', 'Balanced Advantage', 'Aggressive Hybrid', 'Arbitrage', 'Multi Asset', 'Conservative Hybrid']
  },
  {
    name: 'Passive/Other',
    icon: <Sparkles className="w-3 h-3" />,
    items: ['Index Fund', 'ETF', 'International', 'Solution Oriented', 'Fund of Funds']
  }
];

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
    minAum: 0,
    planType: 'All'
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
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

  // Enhanced heuristic refinement
  const filteredResults = useMemo(() => {
    let list = results;
    
    // Plan Type Filter
    if (filters.planType !== 'All') {
      const type = filters.planType.toLowerCase();
      list = list.filter(item => item.schemeName.toLowerCase().includes(type));
    }

    // Category Heuristics
    if (filters.category !== 'All') {
      const cat = filters.category.toLowerCase();
      if (cat === 'all equity') {
        list = list.filter(item => 
          ['large', 'mid', 'small', 'flexi', 'multi', 'elss', 'focused', 'value', 'equity', 'growth'].some(kw => 
            item.schemeName.toLowerCase().includes(kw)
          )
        );
      } else if (cat === 'all debt') {
        list = list.filter(item => 
          ['liquid', 'overnight', 'duration', 'bond', 'gilt', 'debt', 'psu'].some(kw => 
            item.schemeName.toLowerCase().includes(kw)
          )
        );
      } else if (cat === 'all hybrid') {
        list = list.filter(item => 
          ['hybrid', 'balanced', 'arbitrage', 'asset', 'allocation'].some(kw => 
            item.schemeName.toLowerCase().includes(kw)
          )
        );
      } else {
        // Specific category match
        list = list.filter(item => item.schemeName.toLowerCase().includes(cat.replace(' cap', '')));
      }
    }
    
    // Risk Level Heuristics
    if (filters.risk === 'Low') {
      list = list.filter(item => 
        ['index', 'liquid', 'overnight', 'gilt', 'debt', 'arbitrage'].some(kw => 
          item.schemeName.toLowerCase().includes(kw)
        )
      );
    } else if (filters.risk === 'High') {
      list = list.filter(item => 
        ['small', 'mid', 'sectoral', 'thematic', 'focused', 'elss'].some(kw => 
          item.schemeName.toLowerCase().includes(kw)
        )
      );
    }

    return list.slice(0, 20);
  }, [results, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'All') count++;
    if (filters.risk !== 'All') count++;
    if (filters.planType !== 'All') count++;
    if (filters.maxExpense < 2.5) count++;
    if (filters.minAum > 0) count++;
    return count;
  }, [filters]);

  return (
    <div className="relative w-full max-w-4xl mx-auto space-y-4">
      {/* Search Bar & Primary Actions */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className={`flex-1 flex items-center gap-3 bg-white border-2 rounded-2xl px-5 py-4 transition-all duration-300 ${isFocused ? 'border-indigo-500 shadow-xl ring-4 ring-indigo-50/50' : 'border-slate-100 shadow-sm'}`}>
          {isLoading ? <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /> : <Search className="w-5 h-5 text-slate-400" />}
          <input
            type="text"
            placeholder="Search any Indian Mutual Fund (AMC, Category, Scheme)..."
            className="bg-transparent border-none outline-none w-full text-slate-800 font-bold placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all border-2 ${showFilters || activeFilterCount > 0 ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'}`}
        >
          <Filter className="w-4 h-4" />
          Filter Engine
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-white text-indigo-600 text-[10px] rounded-full font-black">
              {activeFilterCount}
            </span>
          )}
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl animate-in slide-in-from-top-4 duration-500 z-50 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="font-black text-slate-800 text-lg">Portfolio Refiner</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Refine across 10,000+ schemes</p>
            </div>
            <button 
              onClick={() => setFilters({ category: 'All', risk: 'All', maxExpense: 2.5, minAum: 0, planType: 'All' })}
              className="text-xs font-black text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-all"
            >
              Clear Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Category Grid */}
            <div className="lg:col-span-8 space-y-6">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Category</label>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setFilters({...filters, category: 'All'})}
                    className={`p-3 rounded-xl border-2 text-xs font-bold transition-all text-center ${filters.category === 'All' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-indigo-100'}`}
                  >
                    All Categories
                  </button>
                  {CATEGORY_GROUPS.map(group => (
                    <div key={group.name} className="space-y-2">
                       <div className="flex items-center gap-2 px-1">
                          <span className="p-1 bg-slate-100 rounded text-slate-500">{group.icon}</span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{group.name}</span>
                       </div>
                       <select 
                         value={group.items.includes(filters.category) ? filters.category : ''}
                         onChange={(e) => setFilters({...filters, category: e.target.value})}
                         className={`w-full p-2 text-xs font-bold rounded-xl border-2 transition-all outline-none ${group.items.includes(filters.category) ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-500'}`}
                       >
                         <option value="" disabled>Browse {group.name}</option>
                         {group.items.map(item => (
                           <option key={item} value={item}>{item}</option>
                         ))}
                       </select>
                    </div>
                  ))}
               </div>

               <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-50">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Risk Level</label>
                    <div className="flex gap-2">
                      {RISKS.map(risk => (
                        <button
                          key={risk}
                          onClick={() => setFilters({ ...filters, risk })}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border-2 ${filters.risk === risk ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-indigo-100'}`}
                        >
                          {risk}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Plan Type</label>
                    <div className="flex gap-2">
                      {['All', 'Direct', 'Regular'].map(type => (
                        <button
                          key={type}
                          onClick={() => setFilters({ ...filters, planType: type as any })}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border-2 ${filters.planType === type ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-indigo-100'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
               </div>
            </div>

            {/* Performance Sliders */}
            <div className="lg:col-span-4 space-y-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <div>
                <div className="flex justify-between mb-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Expense Ratio</label>
                  <span className="text-xs font-black text-indigo-600">{filters.maxExpense}%</span>
                </div>
                <input 
                  type="range" min="0.05" max="2.5" step="0.05" value={filters.maxExpense}
                  onChange={(e) => setFilters({ ...filters, maxExpense: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-black mt-2">
                  <span>INDEX (0.05%)</span>
                  <span>ACTIVE (2.5%)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Min AUM (Size)</label>
                  <span className="text-xs font-black text-indigo-600">₹{filters.minAum.toLocaleString()} Cr</span>
                </div>
                <input 
                  type="range" min="0" max="100000" step="1000" value={filters.minAum}
                  onChange={(e) => setFilters({ ...filters, minAum: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-black mt-2">
                  <span>ANY SIZE</span>
                  <span>LARGE AUM (₹1L Cr)</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
                 <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Market Context</p>
                 <p className="text-[11px] text-slate-600 leading-relaxed italic font-medium">
                   Filtering across {results.length || '...'} discovered funds based on your criteria.
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Dropdown */}
      {isFocused && (filteredResults.length > 0 || query.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-50 px-6 py-3 flex justify-between items-center border-b border-slate-100">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
               Search Results ({filteredResults.length})
             </span>
             {isLoading && <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />}
          </div>
          {filteredResults.length > 0 ? (
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              {filteredResults.map((item) => (
                <button
                  key={item.schemeCode}
                  onClick={() => onSelectFund(item.schemeCode)}
                  className="w-full text-left px-6 py-5 hover:bg-indigo-50/70 flex items-center justify-between group border-b border-slate-50 last:border-0 transition-all"
                >
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                      {item.schemeName}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                        Code: {item.schemeCode}
                      </span>
                      {item.schemeName.toLowerCase().includes('direct') ? (
                        <span className="text-[8px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-black uppercase tracking-widest">Direct</span>
                      ) : (
                        <span className="text-[8px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-black uppercase tracking-widest">Regular</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="hidden sm:block text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">View Analysis</p>
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all ml-auto" />
                     </div>
                  </div>
                </button>
              ))}
            </div>
          ) : !isLoading && query.length >= 2 ? (
            <div className="p-12 text-center text-slate-400">
              <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-20 text-indigo-600" />
              <p className="text-sm font-bold text-slate-800">No matching schemes found</p>
              <p className="text-xs font-medium text-slate-400 mt-1 max-w-xs mx-auto">Try adjusting your filters or broadening your search terms (e.g., search for AMC name like 'SBI' or 'HDFC').</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default FundSearch;
