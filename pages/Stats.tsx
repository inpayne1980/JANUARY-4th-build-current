import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { User } from '../types';
import { 
  ArrowTrendingUpIcon, 
  UserGroupIcon, 
  CursorArrowRaysIcon, 
  BanknotesIcon,
  SparklesIcon,
  LightBulbIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import { generateSuccessInsight, SuccessInsight } from '../services/geminiService';

const data = [
  { name: 'Mon', clicks: 400, adClicks: 240 },
  { name: 'Tue', clicks: 300, adClicks: 139 },
  { name: 'Wed', clicks: 200, adClicks: 980 },
  { name: 'Thu', clicks: 278, adClicks: 390 },
  { name: 'Fri', clicks: 189, adClicks: 480 },
  { name: 'Sat', clicks: 239, adClicks: 380 },
  { name: 'Sun', clicks: 349, adClicks: 430 },
];

const sourceData = [
  { name: 'TikTok', value: 2400, color: '#6366f1' },
  { name: 'Instagram', value: 1200, color: '#a855f7' },
  { name: 'YouTube', value: 800, color: '#ec4899' },
  { name: 'Podcast', value: 300, color: '#f59e0b' },
];

interface StatsProps {
  user: User;
}

const Stats: React.FC<StatsProps> = ({ user }) => {
  const [insight, setInsight] = useState<SuccessInsight | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // Mock top script data for analysis
  const topScript = "OMG you NEED to see this protein blend, it's a total game changer for my morning routine!";

  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoadingInsight(true);
      try {
        const result = await generateSuccessInsight(topScript, "TikTok", 2.1);
        setInsight(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingInsight(false);
      }
    };
    fetchInsight();
  }, []);

  return (
    <div className="space-y-10 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time tracking for vendo.page/{user.username}</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing with TikTok API</span>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          icon={<CursorArrowRaysIcon className="w-6 h-6" />}
          label="Total Clicks"
          value="4,289"
          trend="+12% this week"
          color="indigo"
        />
        <StatCard 
          icon={<UserGroupIcon className="w-6 h-6" />}
          label="Uniques"
          value="2,142"
          trend="+5% this week"
          color="purple"
        />
        <StatCard 
          icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
          label="Conv. Rate"
          value="8.4%"
          trend="+1.2% this week"
          color="emerald"
        />
        <StatCard 
          icon={<BanknotesIcon className="w-6 h-6" />}
          label="Est. ROI"
          value="$1.2k"
          trend="Calculated"
          color="amber"
        />
      </div>

      {/* Why This Worked Section */}
      <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 border border-slate-800">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <ChartBarIcon className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/40">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black tracking-tight">Weekly Success Digest</h2>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Analysis for Feb 12 - Feb 19</p>
            </div>
            {isLoadingInsight ? (
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10 animate-pulse">
                <ArrowPathIcon className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">AI Engine Calculating...</span>
              </div>
            ) : (
              <div className="px-6 py-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 flex items-center gap-3">
                <LightBulbIcon className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Insights Ready</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
             <div className="space-y-8">
               <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10">
                 <h3 className="text-xl font-black mb-6 text-indigo-400 flex items-center gap-3">
                    Top Performer: Protein Glow Ad
                 </h3>
                 <p className="text-lg font-medium text-slate-200 leading-relaxed italic border-l-4 border-indigo-500 pl-6 mb-10">
                   "{topScript}"
                 </p>
                 
                 {insight ? (
                   <div className="space-y-6">
                      <div className="font-black text-[10px] uppercase tracking-widest text-slate-500 mb-4">Why This Worked:</div>
                      {insight.reasons.map((reason, i) => (
                        <div key={i} className="flex gap-6 group">
                          <div className="w-16 h-16 bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/10 shrink-0 transition-all group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40">
                             <div className="text-[14px] font-black text-white leading-none">{reason.value}</div>
                             <div className="text-[7px] font-black text-slate-500 uppercase mt-1">Delta</div>
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-white mb-1">{reason.label}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">{reason.description}</p>
                          </div>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="h-48 flex items-center justify-center text-slate-600 font-bold uppercase tracking-widest text-xs">
                     Waiting for AI analysis...
                   </div>
                 )}
               </div>
             </div>

             <div className="space-y-8">
               <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-6 py-2 bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-2xl">Replication Strategy</div>
                  <h3 className="text-2xl font-black mb-6 mt-2">Next Campaign Plan</h3>
                  <p className="text-slate-300 font-medium text-lg leading-relaxed mb-10">
                    {insight?.replicationStrategy || "Loading your custom replication strategy based on this week's data..."}
                  </p>
                  <button className="w-full py-5 bg-white text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-950/20 flex items-center justify-center gap-3 group">
                    Start Similar Campaign
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Platform Fit</div>
                    <div className="text-2xl font-black text-emerald-400">Match</div>
                    <div className="text-[9px] font-bold text-slate-400 mt-1 italic">98% Persona Accuracy</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Viral Sentiment</div>
                    <div className="text-2xl font-black text-indigo-400">Positive</div>
                    <div className="text-[9px] font-bold text-slate-400 mt-1 italic">+14% Engagement vs Avg</div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Traffic Over Time</h3>
            <div className="flex gap-2">
               <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  Total Clicks
               </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-8">Traffic Sources</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical" margin={{ left: -20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 600, fontSize: 14}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={32}>
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, trend: string, color: 'indigo' | 'purple' | 'emerald' | 'amber' }> = ({ icon, label, value, trend, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600'
  }[color];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-indigo-500 transition-colors cursor-default">
      <div className={`w-12 h-12 ${colorClasses} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">{value}</h4>
      <p className={`text-xs font-bold ${color === 'emerald' ? 'text-emerald-600' : 'text-slate-400'}`}>{trend}</p>
    </div>
  );
};

export default Stats;