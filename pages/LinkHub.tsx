import React, { useState, useEffect, useMemo } from 'react';
import { 
  LinkIcon, 
  TrashIcon, 
  PencilIcon, 
  EyeIcon, 
  QrCodeIcon,
  SquaresPlusIcon,
  DevicePhoneMobileIcon,
  ShareIcon,
  BoltIcon,
  SparklesIcon,
  ArrowUpIcon,
  MapPinIcon,
  FireIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { User, LinkBlock } from '../types';
import { findLocalCreatorEvents } from '../services/geminiService';

interface LinkHubProps {
  user: User;
}

const LinkHub: React.FC<LinkHubProps> = ({ user }) => {
  const [links, setLinks] = useState<LinkBlock[]>([
    { id: '1', title: 'Gumroad Shop', url: 'https://gumroad.com/sarah', clicks: 1240, type: 'shop' },
    { id: '2', title: 'Latest Protein Ad', url: 'https://vendo.page/sarah/ad-1', clicks: 42, type: 'ad' },
    { id: '3', title: 'Media Kit (PDF)', url: 'https://dropbox.com/s/xyz', clicks: 89, type: 'custom' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [localEvents, setLocalEvents] = useState<{ text: string, links: any[] } | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [recentActivity, setRecentActivity] = useState<string | null>(null);

  // Identify the top performer dynamically
  const topLinkId = useMemo(() => {
    return [...links].sort((a, b) => b.clicks - a.clicks)[0]?.id;
  }, [links]);

  // Simulation: Real-Time Traffic Heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      // 30% chance of a new click every 10 seconds for the simulation
      if (Math.random() > 0.7) {
        setLinks(prev => prev.map(link => {
          if (link.id === topLinkId) {
            const increment = Math.floor(Math.random() * 3) + 1;
            setRecentActivity(`+${increment} new clicks on ${link.title}`);
            setTimeout(() => setRecentActivity(null), 3000);
            return { ...link, clicks: link.clicks + increment };
          }
          return link;
        }));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [topLinkId]);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoadingEvents(true);
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const events = await findLocalCreatorEvents(pos.coords.latitude, pos.coords.longitude);
        setLocalEvents(events);
        setIsLoadingEvents(false);
      }, () => setIsLoadingEvents(false));
    };
    fetchEvents();
  }, []);

  const handleSmartSort = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const sorted = [...links].sort((a, b) => b.clicks - a.clicks);
      setLinks(sorted);
      setIsOptimizing(false);
    }, 1500);
  };

  const addLink = () => {
    if (newTitle && newUrl) {
      setLinks([...links, { id: Date.now().toString(), title: newTitle, url: newUrl, clicks: 0, type: 'custom' }]);
      setNewTitle('');
      setNewUrl('');
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 relative">
      {/* Real-time Activity Toast */}
      {recentActivity && (
        <div className="fixed top-8 right-8 z-[60] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 animate-in slide-in-from-right-8 duration-500">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="text-xs font-black uppercase tracking-widest">{recentActivity}</span>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Traffic Hub</h1>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-[0.3em] text-[10px]">Live: <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">vendo.page/{user.username}</span></p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleSmartSort} className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${isOptimizing ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-slate-900 text-white hover:bg-black shadow-2xl shadow-indigo-100'}`}><SparklesIcon className="w-5 h-5" />{isOptimizing ? 'Optimizing...' : 'Smart-Sort Engine'}</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7 space-y-10">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative">
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-black text-slate-900 flex items-center gap-3"><SquaresPlusIcon className="w-6 h-6 text-indigo-600" />Content Blocks</h2>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Social Proof Active</span>
               </div>
             </div>
             
             <button onClick={() => setIsAdding(!isAdding)} className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center gap-4 font-black text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300 group"><LinkIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />Add Interactive Block</button>
             
             {isAdding && (
               <div className="mt-8 p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6 animate-in slide-in-from-top-6 duration-500">
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Label</label>
                   <input placeholder="e.g. Shop the Protein Glow" className="w-full px-8 py-5 rounded-2xl border border-slate-200 outline-none focus:ring-[6px] focus:ring-indigo-100 font-bold" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">URL</label>
                   <input placeholder="https://..." className="w-full px-8 py-5 rounded-2xl border border-slate-200 outline-none focus:ring-[6px] focus:ring-indigo-100 font-bold" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                 </div>
                 <div className="flex gap-4 pt-4">
                   <button onClick={addLink} className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-indigo-100 text-lg">Deploy Block</button>
                   <button onClick={() => setIsAdding(false)} className="px-10 bg-white text-slate-400 font-black border border-slate-200 rounded-2xl hover:bg-slate-50">Discard</button>
                 </div>
               </div>
             )}

             <div className="mt-12 space-y-6">
               {links.map((link) => {
                 const isTop = link.id === topLinkId;
                 return (
                   <div key={link.id} className={`p-8 rounded-[2rem] border transition-all duration-500 flex items-center gap-6 group relative overflow-hidden ${isTop ? 'bg-white border-indigo-200 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] ring-1 ring-indigo-50' : 'bg-slate-50/50 border-slate-100 hover:bg-white'}`}>
                     
                     {isTop && (
                       <div className="absolute top-0 right-0 flex">
                         <div className="px-4 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-2xl flex items-center gap-2">
                           <FireIcon className="w-3.5 h-3.5" />
                           Trending Now
                         </div>
                         <div className="px-3 py-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border-l border-white/10">
                           <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                           Live
                         </div>
                       </div>
                     )}

                     <div className={`w-16 h-16 rounded-2xl shadow-sm border flex items-center justify-center transition-colors ${isTop ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-white border-slate-100 text-slate-300'}`}>
                       <LinkIcon className="w-7 h-7" />
                     </div>

                     <div className="flex-1 min-w-0">
                       <h3 className={`text-lg font-black truncate ${isTop ? 'text-indigo-900' : 'text-slate-900'}`}>{link.title}</h3>
                       <div className="flex items-center gap-3 mt-1">
                         <p className="text-[10px] font-bold text-slate-400 truncate tracking-tight uppercase">{link.url}</p>
                         <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                         <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${isTop ? 'text-emerald-600' : 'text-indigo-500'}`}>
                           <ChartBarIcon className="w-3 h-3" />
                           <span className="tabular-nums">{link.clicks.toLocaleString()}</span> Clicks
                         </div>
                       </div>
                     </div>

                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                       <button className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"><PencilIcon className="w-5 h-5" /></button>
                       <button className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 rounded-2xl transition-all shadow-sm"><TrashIcon className="w-5 h-5" /></button>
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 text-white border border-slate-800 shadow-2xl overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-10"><MapPinIcon className="w-32 h-32" /></div>
             <div className="flex items-center gap-3 mb-6 relative z-10"><MapPinIcon className="w-6 h-6 text-indigo-400" /><h2 className="text-xl font-black">Local Creator Events</h2></div>
             {isLoadingEvents ? (
               <div className="flex items-center gap-4 animate-pulse"><div className="w-2 h-2 rounded-full bg-indigo-500"></div><p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Scanning Google Maps Grounding...</p></div>
             ) : localEvents ? (
               <div className="space-y-4 relative z-10">
                 <p className="text-sm font-medium text-slate-400 leading-relaxed italic">"{localEvents.text}"</p>
                 <div className="flex flex-wrap gap-3">
                   {localEvents.links.map((chunk: any, i: number) => (
                     chunk.maps && (
                       <a key={i} href={chunk.maps.uri} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                         View on Maps
                       </a>
                     )
                   ))}
                 </div>
               </div>
             ) : (<p className="text-sm font-medium text-slate-400">Share location to see upcoming creator meetups near you.</p>)}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-12 flex flex-col items-center w-full">
            <div className="w-[340px] h-[680px] bg-slate-900 rounded-[4rem] p-4 border-[10px] border-slate-800 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.4)] relative group ring-1 ring-slate-700">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-8 w-44 bg-slate-800 rounded-b-[2rem] z-10 flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-900 rounded-full"></div>
              </div>
              <div className="w-full h-full bg-white rounded-[3rem] overflow-y-auto no-scrollbar pt-16 pb-12 px-8 text-center animate-in fade-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-indigo-50 rounded-full mx-auto mb-6 border-[6px] border-white shadow-xl flex items-center justify-center text-indigo-600 font-black text-3xl">{user.username.charAt(0).toUpperCase()}</div>
                <h4 className="font-black text-slate-900 text-xl tracking-tight">@{user.username}</h4>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-10">Verified UGC Partner</p>
                <div className="space-y-4">
                  {links.map((link) => {
                    const isTop = link.id === topLinkId;
                    return (
                      <div key={link.id} className={`w-full py-5 px-6 rounded-[1.5rem] font-black text-[10px] shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 relative group overflow-hidden ${isTop ? 'bg-slate-900 text-white shadow-slate-200' : 'bg-slate-50 text-slate-700 shadow-slate-100'}`}>
                        {isTop && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        )}
                        {link.title}
                        {isTop && (
                          <span className="text-[9px] text-indigo-400 font-black tabular-nums">({link.clicks.toLocaleString()})</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-20">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200 border border-slate-100">
                    <BoltIcon className="w-6 h-6" />
                  </div>
                  <p className="text-[9px] font-black text-slate-200 mt-3 uppercase tracking-[0.5em]">Powered by Vendo</p>
                </div>
              </div>
            </div>
            <div className="mt-12 flex items-center gap-4 bg-white px-8 py-4 rounded-full border border-slate-200 shadow-xl shadow-indigo-100/20">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Live Traffic Visualizer</span>
              <ArrowUpIcon className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkHub;