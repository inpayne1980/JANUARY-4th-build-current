
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LinkIcon, 
  TrashIcon, 
  SquaresPlusIcon,
  ChartBarIcon,
  PhoneIcon,
  AtSymbolIcon,
  GlobeAltIcon,
  // Added missing SparklesIcon import
  SparklesIcon
} from '@heroicons/react/24/outline';
import { User, LinkBlock } from '../types';

interface LinkHubProps {
  user: User;
}

// Expanded list of platforms to ensure "social" type detection is robust
const SOCIAL_PLATFORMS = [
  { name: 'tiktok.com', label: 'TikTok' },
  { name: 'instagram.com', label: 'Instagram' },
  { name: 'twitter.com', label: 'Twitter' },
  { name: 'x.com', label: 'X (Twitter)' },
  { name: 'youtube.com', label: 'YouTube' },
  { name: 'linkedin.com', label: 'LinkedIn' },
  { name: 'facebook.com', label: 'Facebook' },
  { name: 'github.com', label: 'GitHub' },
  { name: 'twitch.tv', label: 'Twitch' },
  { name: 'onlyfans.com', label: 'OnlyFans' },
  { name: 'patreon.com', label: 'Patreon' },
  { name: 'discord.gg', label: 'Discord' },
  { name: 'snapchat.com', label: 'Snapchat' },
  { name: 'reddit.com', label: 'Reddit' },
  { name: 'pinterest.com', label: 'Pinterest' },
];

const SHOP_PLATFORMS = ['gumroad.com', 'stripe.com', 'shopify.com', 'etsy.com', 'amazon.com', 'lemonqueezy.com'];

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
        { id: '2', title: 'TikTok Feed', url: 'https://tiktok.com/@sarah', clicks: 890, type: 'social' },
        { id: '3', title: 'Text Me', url: 'tel:+1234567890', clicks: 42, type: 'contact' }
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

  const detectType = (url: string): LinkBlock['type'] => {
    const lowUrl = url.toLowerCase();
    if (lowUrl.startsWith('tel:')) return 'contact';
    if (lowUrl.startsWith('mailto:')) return 'contact';
    if (SOCIAL_PLATFORMS.some(platform => lowUrl.includes(platform.name))) return 'social';
    if (SHOP_PLATFORMS.some(platform => lowUrl.includes(platform))) return 'shop';
    return 'custom';
  };

  const getFavicon = (url: string) => {
    if (!url || url.startsWith('tel:') || url.startsWith('mailto:')) return null;
    try {
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      const domain = new URL(cleanUrl).hostname;
      // Google's favicon service is the most robust for "whatever" domain is entered
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
      return null;
    }
  };

  const addLink = () => {
    if (newTitle && newUrl) {
      let formattedUrl = newUrl.trim();
      // Auto-format phone numbers if they don't have protocol but look like one
      if (/^\+?[\d\s-]{7,}$/.test(formattedUrl)) {
        formattedUrl = `tel:${formattedUrl.replace(/\s+/g, '')}`;
      } else if (!formattedUrl.startsWith('http') && !formattedUrl.startsWith('tel:') && !formattedUrl.startsWith('mailto:')) {
        formattedUrl = `https://${formattedUrl}`;
      }

      const type = detectType(formattedUrl);
      const newLink: LinkBlock = { 
        id: Date.now().toString(), 
        title: newTitle, 
        url: formattedUrl, 
        clicks: 0, 
        type 
      };
      setLinks([...links, newLink]);
      setNewTitle('');
      setNewUrl('');
      setIsAdding(false);
    }
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const renderIcon = (link: LinkBlock) => {
    if (link.type === 'contact') {
      return link.url.startsWith('tel:') ? <PhoneIcon className="w-6 h-6" /> : <AtSymbolIcon className="w-6 h-6" />;
    }
    
    const favicon = getFavicon(link.url);
    if (favicon) {
      return <img src={favicon} alt="" className="w-8 h-8 rounded-lg shadow-sm bg-white" onError={(e) => {
        // Fallback to generic icon if image fails to load
        (e.target as HTMLImageElement).style.display = 'none';
      }} />;
    }
    
    if (link.type === 'shop') return <GlobeAltIcon className="w-6 h-6" />;
    return <LinkIcon className="w-6 h-6" />;
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4">
      <header className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Traffic Hub</h1>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Your Bio Page: <span className="text-indigo-600">vendo.page/{user.username}</span></p>
        </div>
        <button onClick={() => setIsAdding(true)} className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95">
          <SquaresPlusIcon className="w-5 h-5" /> Add New Block
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Editor Side */}
        <div className="lg:col-span-7 space-y-8">
           {isAdding && (
             <div className="p-8 md:p-10 bg-white border border-indigo-100 rounded-[2.5rem] shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
               <div className="flex items-center justify-between">
                 <h2 className="text-xl font-black text-slate-900">New Content Block</h2>
                 <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                   <SparklesIcon className="w-5 h-5" />
                 </div>
               </div>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Label Name</label>
                   <input 
                     placeholder="e.g. My Secret Content" 
                     className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300" 
                     value={newTitle} 
                     onChange={(e) => setNewTitle(e.target.value)} 
                   />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Destination URL or Phone</label>
                   <div className="relative">
                     <input 
                       placeholder="onlyfans.com/me, +123..., or any link" 
                       className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300" 
                       value={newUrl} 
                       onChange={(e) => setNewUrl(e.target.value)} 
                     />
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                       <LinkIcon className="w-4 h-4 text-slate-300" />
                       <PhoneIcon className="w-4 h-4 text-slate-300" />
                     </div>
                   </div>
                   <p className="mt-2 text-[9px] font-bold text-slate-400 italic">Pro-tip: Adding a social link automatically fetches the brand icon.</p>
                 </div>
               </div>
               
               <div className="flex flex-col sm:flex-row gap-4 pt-4">
                 <button onClick={addLink} className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
                   Create Block
                 </button>
                 <button onClick={() => setIsAdding(false)} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors">
                   Discard
                 </button>
               </div>
             </div>
           )}

           <div className="space-y-4">
             {links.length === 0 && !isAdding && (
               <div className="p-20 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                   <LinkIcon className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 mb-2">No blocks yet</h3>
                 <p className="text-slate-400 font-medium">Add your first link or phone number to start driving traffic.</p>
               </div>
             )}
             
             {links.map((link) => {
               const isTop = link.id === topLinkId;
               return (
                 <div key={link.id} className={`p-6 md:p-8 rounded-[2rem] border flex items-center gap-6 group transition-all animate-in slide-in-from-bottom-2 ${isTop ? 'bg-white border-indigo-200 shadow-xl ring-1 ring-indigo-50' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-lg'}`}>
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 ${isTop ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:shadow-inner'}`}>
                     {renderIcon(link)}
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-black text-slate-900 truncate">{link.title}</h3>
                        {link.type === 'contact' && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-emerald-100 shrink-0">Contact</span>}
                        {link.type === 'social' && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-indigo-100 shrink-0">Social</span>}
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 truncate">
                       <ChartBarIcon className="w-3.5 h-3.5" />
                       {link.clicks.toLocaleString()} Interactions
                       <span className="mx-1">•</span>
                       <span className="text-slate-300 normal-case font-medium">{link.url.replace(/^https?:\/\//, '')}</span>
                     </p>
                   </div>
                   <div className="flex items-center gap-2">
                     <button onClick={() => removeLink(link.id)} className="p-3 bg-white border border-slate-100 text-slate-300 hover:text-rose-600 hover:border-rose-100 rounded-xl md:opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                       <TrashIcon className="w-5 h-5" />
                     </button>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>

        {/* Mobile Preview Sticky Side */}
        <div className="lg:col-span-5 flex justify-center lg:sticky lg:top-8">
           <div className="w-[320px] md:w-[340px] h-[640px] md:h-[680px] bg-slate-900 rounded-[4rem] p-4 border-[10px] border-slate-800 shadow-2xl overflow-hidden">
              <div className="w-full h-full bg-white rounded-[3rem] overflow-hidden flex flex-col pt-12 relative">
                 {/* Top Notch Area */}
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mr-2"></div>
                   <div className="w-8 h-1 bg-slate-200 rounded-full"></div>
                 </div>

                 {/* Bio Profile Header */}
                 <div className="w-20 h-20 bg-indigo-600 rounded-full mx-auto mb-4 border-4 border-white shadow-xl flex items-center justify-center text-white font-black text-2xl animate-in zoom-in-50 duration-500">
                   {user.username.charAt(0).toUpperCase()}
                 </div>
                 <h4 className="text-center font-black text-slate-900 tracking-tight">@{user.username}</h4>
                 <div className="flex justify-center mt-2 mb-8">
                   <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[8px] font-black text-slate-400 uppercase tracking-[0.1em]">Traffic Engine Partner</span>
                 </div>

                 {/* Links List */}
                 <div className="px-6 space-y-3 overflow-y-auto no-scrollbar flex-1 pb-8">
                   {links.map(link => {
                     const isTop = link.id === topLinkId;
                     const favicon = getFavicon(link.url);
                     return (
                       <div 
                         key={link.id} 
                         className={`relative py-4 px-6 rounded-2xl text-[10px] font-black text-center shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-1 ${isTop ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'}`}
                       >
                         {favicon && !link.url.startsWith('tel:') && !link.url.startsWith('mailto:') && (
                           <img 
                             src={favicon} 
                             className="w-4 h-4 rounded-sm bg-white" 
                             alt="" 
                             onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                           />
                         )}
                         {link.url.startsWith('tel:') && <PhoneIcon className="w-3.5 h-3.5" />}
                         {link.url.startsWith('mailto:') && <AtSymbolIcon className="w-3.5 h-3.5" />}
                         {link.title}
                       </div>
                     );
                   })}
                 </div>

                 {/* Footer branding */}
                 <div className="p-6 text-center bg-slate-50/50">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-[8px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 shadow-sm">
                      <SparklesIcon className="w-3 h-3 text-indigo-400" />
                      Built with Vendo
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LinkHub;
