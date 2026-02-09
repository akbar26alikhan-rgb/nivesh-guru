
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { UserInputs, MutualFund, RiskProfile, InvestmentHorizon, GoalType } from './types';
import { MOCK_FUNDS, CATEGORY_GUIDANCE } from './constants';
import { getPortfolioAdvice, getDeepFundAnalysis } from './services/geminiService';
import { fetchLiveFundData } from './services/mfDataService';
import FundScoreCard from './components/FundScoreCard';
import SIPCalculator from './components/SIPCalculator';
import ComparisonTool from './components/ComparisonTool';
import GoalPlanner from './components/GoalPlanner';
import TaxGuide from './components/TaxGuide';
import FundSearch from './components/FundSearch';
import FundDetailView from './components/FundDetailView';
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
  Search as SearchIcon,
  Loader2,
  Globe
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
  const [detailedFundAI, setDetailedFundAI] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
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
            ...liveData.returns
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
  }, []);

  const handleSelectSearchedFund = async (schemeCode: number) => {
    setIsDetailLoading(true);
    
    // 1. Fetch live metrics from API
    const live = await fetchLiveFundData(schemeCode);
    if (live) {
      // 2. Fetch deep analysis from Gemini
      const deepAi = await getDeepFundAnalysis(live.meta.scheme_name, live.meta.scheme_category);
      setDetailedFundAI(deepAi);

      // Check if it exists in curated list to merge
      const existing = funds.find(f => f.schemeCode === schemeCode.toString());

      const newFund: MutualFund = {
        id: `search-${schemeCode}`,
        schemeCode: schemeCode.toString(),
        name: live.meta.scheme_name,
        category: live.meta.scheme_category,
        risk: (deepAi?.riskLevel || 'Medium') as RiskProfile,
        expenseRatio: deepAi?.expenseRatio || 0,
        exitLoad: deepAi?.exitLoad || 'Refer to Scheme Documents',
        aum: deepAi?.aum || 'N/A',
        aumValue: 0,
        benchmarkName: deepAi?.benchmark || 'Nifty TRI',
        currentNav: live.currentNav,
        lastUpdated: live.lastUpdated,
        returns: {
          ...live.returns,
          'rolling': deepAi?.rollingConsistency || 0,
          '5y': live.returns['5y'] || deepAi?.estimated5y || 0,
          '10y': live.returns['10y'] || 0
        },
        benchmarkReturns: { '5y': deepAi?.catAvg5y || 0 },
        manager: { 
          name: deepAi?.manager?.name || 'Expert Manager', 
          experience: deepAi?.manager?.exp || 10, 
          rating: 4, 
          tenureYears: 5 
        },
        holdings: [],
        riskRatios: {
          sharpe: deepAi?.riskRatios?.sharpe || 0,
          alpha: deepAi?.riskRatios?.alpha || 0,
          beta: deepAi?.riskRatios?.beta || 0,
          sortino: deepAi?.riskRatios?.sortino || 0,
          standardDeviation: deepAi?.riskRatios?.sd || 0
        },
        score: existing?.score || { total: 0, returns: 0, expense: 0, manager: 0, volatility: 0, aum: 0, drawdown: 0, quality: 0 },
        description: deepAi?.aiStrategy || `${live.meta.scheme_name} managed by ${live.meta.fund_house}.`,
        redFlags: deepAi?.redFlags || []
      };
      setSelectedDetailedFund(newFund);
    }
    setIsDetailLoading(false);
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
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-200">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              NiveshGuru
            </h1>
          </div>
          
          <nav className="hidden md:flex gap-8">
            <button onClick={() => setActiveTab('dashboard')} className={`text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Dashboard</button>
            <button onClick={() => setActiveTab('explore')} className={`text-sm font-bold transition-all ${activeTab === 'explore' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Global Explorer</button>
            <button onClick={() => setActiveTab('compare')} className={`text-sm font-bold transition-all ${activeTab === 'compare' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Comparison</button>
            <button onClick={() => setActiveTab('calc')} className={`text-sm font-bold transition-all ${activeTab === 'calc' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Calculators</button>
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

            {(activeTab === 'dashboard' || activeTab === 'explore') && <TaxGuide />}
          </aside>

          <div className="lg:col-span-8 space-y-8">
            
            {activeTab === 'explore' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {!selectedDetailedFund && !isDetailLoading ? (
                  <>
                    <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm text-center">
                       <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-4">
                         <Globe className="w-8 h-8 text-indigo-600" />
                       </div>
                       <h2 className="text-3xl font-black text-slate-800 mb-2">
                         Global Fund Explorer
                       </h2>
                       <p className="text-slate-500 max-w-xl mx-auto mb-10">
                         Access real-time NAVs and deep-risk analytics for 10,000+ Indian mutual funds. Use filters to refine by strategy, risk, or performance metrics.
                       </p>
                       <FundSearch onSelectFund={handleSelectSearchedFund} />
                    </div>
                  </>
                ) : isDetailLoading ? (
                  <div className="bg-white p-20 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <div className="relative">
                      <Loader2 className="w-20 h-20 text-indigo-600 animate-spin mb-6" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-indigo-600 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Conducting Deep Risk Audit</h3>
                    <p className="text-slate-400 max-w-sm">
                      Retrieving AMFI records, calculating CAGR across horizons, and generating AI-powered alpha/beta estimations...
                    </p>
                  </div>
                ) : (
                  <FundDetailView 
                    fund={selectedDetailedFund!} 
                    aiData={detailedFundAI}
                    onBack={() => {
                      setSelectedDetailedFund(null);
                      setDetailedFundAI(null);
                    }} 
                  />
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
                      <div key={fund.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group" onClick={() => {
                        setActiveTab('explore');
                        handleSelectSearchedFund(parseInt(fund.schemeCode));
                      }}>
                        <div className="flex justify-between mb-2">
                          <span className="px-2 py-0.5 bg-indigo-50 text-[9px] font-bold text-indigo-600 rounded uppercase">
                            NAV: ₹{fund.currentNav || '...'}
                          </span>
                          <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">Score: {fund.score.total}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm mb-3 group-hover:text-indigo-600 transition-colors">{fund.name}</h3>
                        <div className="flex gap-4">
                          <div><p className="text-[10px] text-slate-400 uppercase font-bold">1Y Return</p><p className="text-sm font-black text-green-600">{fund.returns['1y']?.toFixed(2)}%</p></div>
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
                Data synced from AMFI via MFAPI.in. Deep audits powered by Gemini AI. NiveshGuru is an educational tool.
              </p>
            </div>
          </div>
        </div>
      </main>

      <button onClick={syncLiveData} className={`fixed bottom-6 right-6 p-4 ${isSyncing ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-300'} text-white rounded-full transition-all flex items-center gap-2 group z-40`}>
        <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-[200px] transition-all duration-500 whitespace-nowrap text-sm font-bold pr-2">
          {isSyncing ? 'Syncing...' : 'Sync Live Data'}
        </span>
      </button>
    </div>
  );
};

export default App;
