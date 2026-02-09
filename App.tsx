
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { UserInputs, MutualFund, RiskProfile, InvestmentHorizon, GoalType } from './types';
import { MOCK_FUNDS, CATEGORY_GUIDANCE } from './constants';
import { getPortfolioAdvice } from './services/geminiService';
import { fetchLiveFundData } from './services/mfDataService';
import FundScoreCard from './components/FundScoreCard';
import SIPCalculator from './components/SIPCalculator';
import ComparisonTool from './components/ComparisonTool';
import GoalPlanner from './components/GoalPlanner';
import TaxGuide from './components/TaxGuide';
import FundSearch from './components/FundSearch';
import { 
  TrendingUp, 
  ShieldCheck, 
  Target, 
  BarChart3, 
  AlertTriangle, 
  BookOpen, 
  Calculator,
  PieChart as PieChartIcon,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  Zap,
  Flag,
  RefreshCw,
  Clock,
  ArrowLeft,
  Search as SearchIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const SYNC_INTERVAL_MS = 15 * 60 * 1000;

const App: React.FC = () => {
  const [inputs, setInputs] = useState<UserInputs>({
    sipAmount: 10000,
    lumpSum: 0,
    horizon: '5 Years',
    riskProfile: 'Medium',
    goalType: 'Wealth Creation'
  });

  const [funds, setFunds] = useState<MutualFund[]>(MOCK_FUNDS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());
  const [aiAdvice, setAiAdvice] = useState<string>('Analyzing market patterns...');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'compare' | 'calc' | 'learn' | 'explore'>('dashboard');
  const [selectedDetailedFund, setSelectedDetailedFund] = useState<MutualFund | null>(null);
  
  const syncTimerRef = useRef<number | null>(null);

  const syncLiveData = useCallback(async () => {
    setIsSyncing(true);
    const updatedFunds = await Promise.all(funds.map(async (fund) => {
      const liveData = await fetchLiveFundData(fund.schemeCode);
      if (liveData) {
        return {
          ...fund,
          currentNav: liveData.currentNav,
          lastUpdated: liveData.lastUpdated,
          returns: {
            ...fund.returns,
            '1y': liveData.returns1y,
            '3y': liveData.returns3y || fund.returns['3y'],
          }
        };
      }
      return fund;
    }));
    setFunds(updatedFunds);
    setLastSyncTime(new Date().toLocaleTimeString());
    setIsSyncing(false);
  }, [funds]);

  useEffect(() => {
    syncLiveData();
    syncTimerRef.current = window.setInterval(syncLiveData, SYNC_INTERVAL_MS);
    return () => { if (syncTimerRef.current) clearInterval(syncTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectSearchedFund = async (schemeCode: number) => {
    setIsSyncing(true);
    // 1. Try to find in existing funds
    const existing = funds.find(f => f.schemeCode === schemeCode.toString());
    if (existing) {
      setSelectedDetailedFund(existing);
      setIsSyncing(false);
      return;
    }

    // 2. Otherwise fetch from API
    const live = await fetchLiveFundData(schemeCode);
    if (live) {
      const newFund: MutualFund = {
        id: `search-${schemeCode}`,
        schemeCode: schemeCode.toString(),
        name: live.meta.scheme_name,
        category: live.meta.scheme_category,
        risk: 'Medium', // Placeholder
        expenseRatio: 0, // Not available from basic API
        exitLoad: 'Refer to Scheme Documents',
        aum: 'N/A',
        aumValue: 0,
        benchmarkName: 'Nifty TRI',
        currentNav: live.currentNav,
        lastUpdated: live.lastUpdated,
        returns: {
          '1y': live.returns1y,
          '3y': live.returns3y,
          '5y': 0,
          '10y': 0,
          'rolling': 0
        },
        benchmarkReturns: { '5y': 0 },
        manager: { name: 'Expert Manager', experience: 10, rating: 4, tenureYears: 5 },
        holdings: [],
        riskRatios: { sharpe: 0, alpha: 0, beta: 0, sortino: 0, standardDeviation: 0 },
        score: { total: 0, returns: 0, expense: 0, manager: 0, volatility: 0, aum: 0, drawdown: 0, quality: 0 },
        description: `${live.meta.scheme_name} managed by ${live.meta.fund_house}.`,
        redFlags: []
      };
      setSelectedDetailedFund(newFund);
    }
    setIsSyncing(false);
  };

  const recommendedFunds = useMemo(() => {
    let filtered = funds.filter(f => {
      if (inputs.riskProfile === 'Low') return f.risk === 'Low' || f.category === 'Index Fund';
      if (inputs.riskProfile === 'High') return f.risk === 'High' || f.risk === 'Medium';
      return true;
    });
    if (inputs.horizon === '1 Year') filtered = filtered.filter(f => f.category === 'Debt / Liquid');
    else if (inputs.horizon === '3 Years') filtered = filtered.filter(f => ['Large Cap', 'Index Fund', 'Debt / Liquid'].includes(f.category));
    return filtered.sort((a, b) => b.score.total - a.score.total).slice(0, 3);
  }, [inputs, funds]);

  const fetchAdvice = useCallback(async () => {
    setAiAdvice('Regenerating insights...');
    const advice = await getPortfolioAdvice(inputs, recommendedFunds);
    setAiAdvice(advice);
  }, [inputs, recommendedFunds]);

  useEffect(() => {
    fetchAdvice();
  }, [recommendedFunds, fetchAdvice]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'];
  const allocationData = recommendedFunds.map((f, i) => ({
    name: f.category,
    value: Math.floor(100 / recommendedFunds.length),
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              NiveshGuru
            </h1>
          </div>
          
          <nav className="hidden md:flex gap-8">
            <button onClick={() => setActiveTab('dashboard')} className={`text-sm font-medium ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>Dashboard</button>
            <button onClick={() => setActiveTab('explore')} className={`text-sm font-medium ${activeTab === 'explore' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>Search Funds</button>
            <button onClick={() => setActiveTab('compare')} className={`text-sm font-medium ${activeTab === 'compare' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>Comparison</button>
            <button onClick={() => setActiveTab('calc')} className={`text-sm font-medium ${activeTab === 'calc' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>Calculators</button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end text-[10px] font-bold text-slate-400">
               <div className="flex items-center gap-1">
                 <Clock className="w-3 h-3" />
                 SYNC: {lastSyncTime}
               </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Plan Your Wealth
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Monthly SIP (₹)</label>
                  <input 
                    type="number" 
                    value={inputs.sipAmount}
                    onChange={(e) => setInputs({...inputs, sipAmount: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Years</label>
                    <select 
                      value={inputs.horizon}
                      onChange={(e) => setInputs({...inputs, horizon: e.target.value as InvestmentHorizon})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    >
                      <option>1 Year</option>
                      <option>3 Years</option>
                      <option>5 Years</option>
                      <option>10+ Years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Risk</label>
                    <select 
                      value={inputs.riskProfile}
                      onChange={(e) => setInputs({...inputs, riskProfile: e.target.value as RiskProfile})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={fetchAdvice}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Optimize Portfolio
                </button>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-20 h-20" /></div>
               <div className="flex items-center gap-2 mb-4">
                <div className="p-1 bg-indigo-500/20 rounded">
                  <BookOpen className="w-5 h-5 text-indigo-300" />
                </div>
                <h3 className="font-bold">Live AI Insights</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic relative z-10">
                "{aiAdvice}"
              </p>
            </div>

            {activeTab === 'dashboard' && <TaxGuide />}
          </aside>

          <div className="lg:col-span-8 space-y-8">
            
            {activeTab === 'explore' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="text-center mb-10">
                   <h2 className="text-3xl font-black text-slate-800 mb-2 flex items-center justify-center gap-3">
                     <SearchIcon className="w-8 h-8 text-indigo-600" />
                     Global Fund Search
                   </h2>
                   <p className="text-slate-500">Access real-time NAV and analytics for all AMFI-registered mutual funds in India.</p>
                </div>
                
                <FundSearch onSelectFund={handleSelectSearchedFund} />

                {selectedDetailedFund && (
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 animate-in zoom-in-95 duration-300">
                    <button onClick={() => setSelectedDetailedFund(null)} className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform">
                      <ArrowLeft className="w-4 h-4" /> Back to Search
                    </button>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                       <div>
                         <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full uppercase mb-4 inline-block">
                           {selectedDetailedFund.category}
                         </span>
                         <h3 className="text-2xl font-black text-slate-800">{selectedDetailedFund.name}</h3>
                         <p className="text-slate-400 font-medium text-sm mt-1">Scheme Code: {selectedDetailedFund.schemeCode}</p>
                       </div>
                       <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-right min-w-[150px]">
                         <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Current NAV</p>
                         <p className="text-3xl font-black text-indigo-600">₹{selectedDetailedFund.currentNav}</p>
                         <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">AS OF {selectedDetailedFund.lastUpdated}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                       <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
                         <p className="text-[10px] font-black text-green-700 uppercase mb-2">1Y Return (CAGR)</p>
                         <p className="text-2xl font-black text-green-600">{selectedDetailedFund.returns['1y']}%</p>
                       </div>
                       <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                         <p className="text-[10px] font-black text-indigo-700 uppercase mb-2">3Y Return (CAGR)</p>
                         <p className="text-2xl font-black text-indigo-600">{selectedDetailedFund.returns['3y'] > 0 ? selectedDetailedFund.returns['3y'] + '%' : 'N/A'}</p>
                       </div>
                       <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Risk Rating</p>
                         <p className="text-2xl font-black text-slate-800 capitalize">{selectedDetailedFund.risk}</p>
                       </div>
                    </div>

                    <div className="p-6 bg-slate-900 rounded-2xl text-white">
                       <h4 className="font-bold flex items-center gap-2 mb-4">
                         <Sparkles className="w-4 h-4 text-indigo-400" />
                         AI Strategic Analysis
                       </h4>
                       <p className="text-sm text-slate-300 leading-relaxed italic">
                         This fund primarily invests in the {selectedDetailedFund.category} space. Its 1-year performance of {selectedDetailedFund.returns['1y']}% suggests a {selectedDetailedFund.returns['1y'] > 15 ? 'strong momentum' : 'steady growth'} phase. 
                         Investors should note that {selectedDetailedFund.category.includes('Small') ? 'small-cap' : 'this'} funds carry higher volatility and require a minimum horizon of 5-7 years for profit maximization.
                       </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-indigo-600" />
                      Live Allocation
                    </h2>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={allocationData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                            {allocationData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {recommendedFunds.map((f, i) => (
                        <div key={f.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                            <span className="text-slate-600 font-medium truncate">{f.name}</span>
                          </div>
                          <span className="font-bold text-slate-800">{allocationData[i].value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 px-2 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      Live Recommendations
                    </h2>
                    {recommendedFunds.map(fund => (
                      <div key={fund.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-300 transition-all">
                        <div className="flex justify-between mb-2">
                          <span className="px-2 py-0.5 bg-indigo-50 text-[9px] font-bold text-indigo-600 rounded uppercase">
                            NAV: ₹{fund.currentNav || '...'}
                          </span>
                          <span className="text-xs font-bold text-slate-400">Score: {fund.score.total}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm mb-3">{fund.name}</h3>
                        <div className="flex gap-4">
                          <div><p className="text-[10px] text-slate-400 uppercase font-bold">1Y Return</p><p className="text-sm font-black text-green-600">{fund.returns['1y']}%</p></div>
                          <div><p className="text-[10px] text-slate-400 uppercase font-bold">Alpha</p><p className="text-sm font-black text-indigo-600">+{fund.riskRatios.alpha}</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'calc' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <SIPCalculator />
                 <GoalPlanner />
              </div>
            )}

            {activeTab === 'compare' && <ComparisonTool funds={funds} />}

            {activeTab === 'learn' && <TaxGuide />}

            <div className="p-4 bg-slate-100 rounded-xl flex items-center gap-3">
              <AlertTriangle className="text-slate-400 w-5 h-5 flex-shrink-0" />
              <p className="text-[10px] text-slate-500 font-medium italic">
                Data synced from AMFI via MFAPI.in. Refresh occurs every 15 minutes. NiveshGuru is an educational tool.
              </p>
            </div>
          </div>
        </div>
      </main>

      <button onClick={syncLiveData} className={`fixed bottom-6 right-6 p-4 ${isSyncing ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-full shadow-2xl transition-all flex items-center gap-2 group`}>
        <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-[200px] transition-all duration-500 whitespace-nowrap text-sm font-bold pr-2">
          {isSyncing ? 'Syncing...' : 'Sync Live Data'}
        </span>
      </button>
    </div>
  );
};

export default App;
