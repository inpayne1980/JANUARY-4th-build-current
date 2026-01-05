
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
  ArrowPathIcon,
  EnvelopeIcon,
  CheckBadgeIcon,
  InformationCircleIcon
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
        const result = await generateSuccessInsight(topScript, "TikTok", 428);
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
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing with Traffic Hub</span>
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

      {/* Performance Digest Section */}
      <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-100 border border-slate-800 group/digest">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-transform group-hover/digest:scale-110 duration-1000">
          <EnvelopeIcon className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                <SparklesIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Weekly Success Digest</h2>
                <div className="flex items-center gap-2 mt-1">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">From: Vendo AI Intelligence</p>
                   <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                   <p className="text-indigo-400 font-bold uppercase tracking-widest text-[9px]">Priority Report</p>
                </div>
              </div>
            </div>
            
            {isLoadingInsight ? (
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10 animate-pulse">
                <ArrowPathIcon className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Compiling Data-Points...</span>
              </div>
            ) : (
              <div className="px-6 py-3 bg-indigo-500 text-white rounded-full flex items-center gap-3 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 cursor-default">
                <CheckBadgeIcon className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest tracking-widest">Report Verified</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
             <div className="lg:col-span-8 space-y-8">
               <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 md:p-12 shadow-inner group/card hover:border-white/20 transition-all">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Why This Worked</h3>
                    <InformationCircleIcon className="w-5 h-5 text-white/20" />
                 </div>
                 
                 <div className="space-y-10">
                    <p className="text-3xl font-black text-white leading-tight">
                       {insight?.headline || "Analysis: Hook Alpha-7 Performance Breakdown"}
                    </p>
                    <p className="text-lg font-bold text-slate-400 leading-relaxed -mt-4 italic">
                       {insight?.summaryText || "Waiting for latest click data to normalize..."}
                    </p>
                    
                    {insight ? (
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                         {insight.reasons.map((reason, i) => (
                           <div key={i} className="flex gap-6 items-start p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group/reason">
                             <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover/reason:scale-110 transition-transform">
                                <span className="font-black text-lg">0{i+1}</span>
                             </div>
                             <div className="flex-1">
                               <div className="flex items-center gap-3 mb-1">
                                  <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">{reason.label}</h4>
                                  <div className="flex-1 h-px bg-white/5"></div>
                                  <span className="text-emerald-400 font-black text-xs">{reason.value}</span>
                               </div>
                               <p className="text-base font-bold text-slate-200 leading-relaxed">
                                 {reason.description}
                               </p>
                             </div>
                           </div>
                         ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                         {[1,2,3].map(i => (
                           <div key={i} className="h-24 bg-white/5 rounded-[2rem] w-full animate-pulse border border-white/5"></div>
                         ))}
                      </div>
                    )}
                 </div>

                 <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Subject Asset</h4>
                      <p className="text-xs font-bold text-slate-400 leading-relaxed italic border-l-2 border-indigo-500/30 pl-4 max-w-sm truncate">
                        "{topScript}"
                      </p>
                    </div>
                    <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">View Master →</button>
                 </div>
               </div>
             </div>

             <div className="lg:col-span-4 space-y-8">
               <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-950/40 relative overflow-hidden group/strat">
                  <LightBulbIcon className="w-40 h-40 absolute -bottom-10 -right-10 opacity-10 transition-transform group-hover/strat:scale-110 duration-700" />
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 bg-white/20 rounded-lg">
                       <ChartBarIcon className="w-5 h-5 text-indigo-100" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight">Replication Blueprint</h3>
                  </div>
                  <div className="relative z-10">
                    <p className="text-indigo-50 font-bold text-lg leading-relaxed mb-10">
                      {insight?.replicationStrategy || "Extracting tactical triggers from successful conversion patterns..."}
                    </p>
                    <button className="w-full py-5 bg-white text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-950/20 flex items-center justify-center gap-3 active:scale-95 text-xs tracking-widest uppercase">
                      Clone Winning Hooks
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </div>
               </div>
               
               <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-between group/stats">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Confidence Score</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">94% <span className="text-[10px] font-bold text-slate-500 ml-1">ACCURACY</span></p>
                  </div>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black overflow-hidden ring-2 ring-indigo-500/20">
                        <img src={`https://i.pravatar.cc/100?u=vendo${i}`} className="w-full h-full object-cover grayscale" alt="" />
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Charts */}
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
