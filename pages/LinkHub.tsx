
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LinkIcon, 
  TrashIcon, 
  PencilIcon, 
  QrCodeIcon,
  SquaresPlusIcon,
  SparklesIcon,
  FireIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { User, LinkBlock } from '../types';
import { findLocalCreatorEvents } from '../services/geminiService';

interface LinkHubProps {
  user: User;
}

const LinkHub: React.FC<LinkHubProps> = ({ user }) => {
  const [links, setLinks] = useState<LinkBlock[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // LOAD PERSISTENCE
  useEffect(() => {
    const saved = localStorage.getItem(`vendo_links_${user.id}`);
    if (saved) {
      setLinks(JSON.parse(saved));
    } else {
      setLinks([
        { id: '1', title: 'Gumroad Shop', url: 'https://gumroad.com/sarah', clicks: 1240, type: 'shop' },
        { id: '2', title: 'Latest Video', url: 'https://vendo.page/sarah/v1', clicks: 42, type: 'ad' }
      ]);
    }
  }, [user.id]);

  // SAVE PERSISTENCE
  useEffect(() => {
    if (links.length > 0) {
      localStorage.setItem(`vendo_links_${user.id}`, JSON.stringify(links));
    }
  }, [links, user.id]);

  const topLinkId = useMemo(() => {
    return [...links].sort((a, b) => b.clicks - a.clicks)[0]?.id;
  }, [links]);

  const addLink = () => {
    if (newTitle && newUrl) {
      const newLink: LinkBlock = { id: Date.now().toString(), title: newTitle, url: newUrl, clicks: 0, type: 'custom' };
      setLinks([...links, newLink]);
      setNewTitle('');
      setNewUrl('');
      setIsAdding(false);
    }
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Traffic Hub</h1>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Live Hub URL: vendo.page/{user.username}</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-black">
          <SquaresPlusIcon className="w-5 h-5" /> Add Block
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7 space-y-8">
           {isAdding && (
             <div className="p-10 bg-white border border-indigo-100 rounded-[2.5rem] shadow-xl space-y-6 animate-in zoom-in-95">
               <input placeholder="Block Title" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
               <input placeholder="URL" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
               <div className="flex gap-4">
                 <button onClick={addLink} className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-xl">Add Block</button>
                 <button onClick={() => setIsAdding(false)} className="px-8 text-slate-400 font-bold">Cancel</button>
               </div>
             </div>
           )}

           <div className="space-y-4">
             {links.map((link) => {
               const isTop = link.id === topLinkId;
               return (
                 <div key={link.id} className={`p-8 rounded-[2rem] border flex items-center gap-6 group transition-all ${isTop ? 'bg-white border-indigo-200 shadow-xl' : 'bg-slate-50/50 border-slate-100'}`}>
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isTop ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-300 shadow-sm'}`}>
                     <LinkIcon className="w-6 h-6" />
                   </div>
                   <div className="flex-1">
                     <h3 className="text-lg font-black text-slate-900">{link.title}</h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase mt-1 flex items-center gap-2">
                       <ChartBarIcon className="w-3.5 h-3.5" />
                       {link.clicks.toLocaleString()} Total Clicks
                     </p>
                   </div>
                   <button onClick={() => removeLink(link.id)} className="p-3 bg-white border border-slate-100 text-slate-300 hover:text-rose-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                     <TrashIcon className="w-5 h-5" />
                   </button>
                 </div>
               );
             })}
           </div>
        </div>

        <div className="lg:col-span-5 flex justify-center">
           <div className="w-[340px] h-[680px] bg-slate-900 rounded-[4rem] p-4 border-[10px] border-slate-800 shadow-2xl sticky top-8">
              <div className="w-full h-full bg-white rounded-[3rem] overflow-hidden flex flex-col pt-12">
                 <div className="w-20 h-20 bg-indigo-50 rounded-full mx-auto mb-4 border-4 border-white shadow-lg flex items-center justify-center text-indigo-600 font-black text-2xl">
                   {user.username.charAt(0).toUpperCase()}
                 </div>
                 <h4 className="text-center font-black text-slate-900">@{user.username}</h4>
                 <p className="text-center text-[8px] font-black text-slate-300 uppercase tracking-widest mb-10">UGC Partner</p>
                 <div className="px-8 space-y-4 overflow-y-auto no-scrollbar pb-12">
                   {links.map(link => (
                     <div key={link.id} className={`py-4 px-6 rounded-2xl text-[10px] font-black text-center shadow-md transition-transform hover:scale-105 ${link.id === topLinkId ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                       {link.title}
                     </div>
                   ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LinkHub;
