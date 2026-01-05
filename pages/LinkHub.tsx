
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LinkIcon, 
  TrashIcon, 
  SquaresPlusIcon,
  ChartBarIcon,
  PhoneIcon,
  AtSymbolIcon,
  SparklesIcon,
  VideoCameraIcon,
  ShieldExclamationIcon,
  ArrowPathIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  GlobeAltIcon,
  QrCodeIcon,
  ArrowDownTrayIcon,
  ArrowsRightLeftIcon,
  ShareIcon,
  BoltIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ListBulletIcon,
  Squares2X2Icon,
  PresentationChartBarIcon,
  BookmarkSquareIcon,
  DevicePhoneMobileIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { User, LinkBlock } from '../types';
import { checkContentSafety } from '../services/geminiService';

interface LinkHubProps {
  user: User;
}

type HubMode = 'performance' | 'grouped' | 'manual';

const SOCIAL_PLATFORMS = [
  { name: 'tiktok.com', label: 'TikTok' },
  { name: 'instagram.com', label: 'Instagram' },
  { name: 'twitter.com', label: 'X (Twitter)' },
  { name: 'x.com', label: 'X' },
  { name: 'youtube.com', label: 'YouTube' },
  { name: 'linkedin.com', label: 'LinkedIn' },
  { name: 'facebook.com', label: 'Facebook' },
  { name: 'twitch.tv', label: 'Twitch' },
  { name: 'discord.gg', label: 'Discord' },
  { name: 'snapchat.com', label: 'Snapchat' },
  { name: 'threads.net', label: 'Threads' }
];

const SHOP_PLATFORMS = [
  { name: 'gumroad.com', label: 'Gumroad' },
  { name: 'stripe.com', label: 'Stripe' },
  { name: 'shopify.com', label: 'Shopify' },
  { name: 'etsy.com', label: 'Etsy' },
  { name: 'amazon.com', label: 'Amazon' },
  { name: 'stan.store', label: 'Stan Store' },
  { name: 'whop.com', label: 'Whop' },
  { name: 'buymeacoffee.com', label: 'Buy Me A Coffee' }
];

const LinkHub: React.FC<LinkHubProps> = ({ user }) => {
  const [links, setLinks] = useState<LinkBlock[]>([]);
  const [hubMode, setHubMode] = useState<HubMode>('performance');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [blockType, setBlockType] = useState<LinkBlock['type']>('custom');
  const [isCheckingSafety, setIsCheckingSafety] = useState(false);
  const [isSyncingQR, setIsSyncingQR] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`vendo_links_${user.id}`);
    if (saved) {
      setLinks(JSON.parse(saved));
    } else {
      setLinks([
        { id: '1', title: 'Gumroad Shop', url: 'https://gumroad.com/creator', clicks: 1240, type: 'shop' },
        { id: '2', title: 'TikTok Daily', url: 'https://tiktok.com/@creator', clicks: 890, type: 'social' },
        { id: '3', title: 'Share My Profile', url: `https://vendo.page/${user.username}`, clicks: 42, type: 'share' }
      ]);
    }
  }, [user.id, user.username]);

  useEffect(() => {
    localStorage.setItem(`vendo_links_${user.id}`, JSON.stringify(links));
  }, [links, user.id]);

  const processedLinks = useMemo(() => {
    let result = [...links];
    
    if (hubMode === 'performance') {
      result.sort((a, b) => {
        if (a.type === 'hero' && b.type !== 'hero') return -1;
        if (b.type === 'hero' && a.type !== 'hero') return 1;
        return b.clicks - a.clicks;
      });
    } else if (hubMode === 'grouped') {
      const typeOrder: Record<string, number> = {
        'hero': 0,
        'share': 1,
        'shop': 2,
        'social': 3,
        'contact': 4,
        'custom': 5
      };
      result.sort((a, b) => (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99));
    }
    
    return result;
  }, [links, hubMode]);

  const topLinkId = processedLinks[0]?.id;

  const detectType = (url: string): LinkBlock['type'] => {
    const lowUrl = url.toLowerCase();
    if (lowUrl.startsWith('tel:') || lowUrl.startsWith('mailto:')) return 'contact';
    if (SOCIAL_PLATFORMS.some(platform => lowUrl.includes(platform.name))) return 'social';
    if (SHOP_PLATFORMS.some(platform => lowUrl.includes(platform.name))) return 'shop';
    return 'custom';
  };

  const getFavicon = (url: string, type: string) => {
    if (type === 'share') return null;
    if (!url) return null;
    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith('tel:') || trimmed.startsWith('mailto:')) return null;
    
    try {
      let formatted = trimmed;
      if (!formatted.startsWith('http')) {
        formatted = 'https://' + formatted;
      }
      const urlObj = new URL(formatted);
      const domain = urlObj.hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
      return null;
    }
  };

  const profileUrl = `https://vendo.page/${user.username}`;
  
  const qrUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileUrl)}&bgcolor=FFFFFF&color=0F172A&margin=2`;
  }, [profileUrl]);

  const triggerQRSync = () => {
    setIsSyncingQR(true);
    setTimeout(() => setIsSyncingQR(false), 800);
  };

  const addLink = async () => {
    if ((newTitle && newUrl) || blockType === 'share') {
      setIsCheckingSafety(true);
      let formattedUrl = blockType === 'share' ? profileUrl : newUrl.trim();
      let title = blockType === 'share' ? 'Share My Vendo Profile' : newTitle;
      
      if (blockType !== 'share') {
        if (/^\+?[\d\s-]{7,}$/.test(formattedUrl)) {
          formattedUrl = `tel:${formattedUrl.replace(/\s+/g, '')}`;
        } else if (!formattedUrl.startsWith('http') && !formattedUrl.startsWith('tel:') && !formattedUrl.startsWith('mailto:')) {
          formattedUrl = `https://${formattedUrl}`;
        }
      }

      const isNsfw = blockType === 'share' ? false : await checkContentSafety(formattedUrl, title);
      const type = blockType;
      
      const newLink: LinkBlock = { 
        id: Date.now().toString(), 
        title, 
        url: formattedUrl, 
        clicks: 0, 
        type: type === 'share' ? 'share' : (type === 'hero' ? 'hero' : detectType(formattedUrl)),
        isNsfw,
        isUnblurred: false
      };
      
      setLinks([...links, newLink]);
      setNewTitle('');
      setNewUrl('');
      setBlockType('custom');
      setIsAdding(false);
      setIsCheckingSafety(false);
      triggerQRSync();
    }
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
    triggerQRSync();
  };

  const moveLink = (id: string, direction: 'up' | 'down') => {
    const index = links.findIndex(l => l.id === id);
    if (index === -1) return;
    
    const newLinks = [...links];
    if (direction === 'up' && index > 0) {
      [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
    } else if (direction === 'down' && index < newLinks.length - 1) {
      [newLinks[index + 1], newLinks[index]] = [newLinks[index], newLinks[index + 1]];
    }
    
    setLinks(newLinks);
    setHubMode('manual');
    triggerQRSync();
  };

  const renderCategoryIcon = (link: LinkBlock) => {
    if (link.type === 'hero') return <VideoCameraIcon className="w-6 h-6" />;
    if (link.type === 'share') return <ShareIcon className="w-6 h-6" />;
    if (link.type === 'contact') return link.url.startsWith('tel:') ? <PhoneIcon className="w-6 h-6" /> : <AtSymbolIcon className="w-6 h-6" />;
    if (link.type === 'social') return <UserGroupIcon className="w-6 h-6" />;
    if (link.type === 'shop') return <ShoppingBagIcon className="w-6 h-6" />;
    return <LinkIcon className="w-6 h-6" />;
  };

  const parseVideoEmbed = (url: string) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const id = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('/').pop();
        return `https://www.youtube.com/embed/${id}`;
      }
      return url;
    } catch { return url; }
  };

  const groupedLinks = useMemo(() => {
    const groups: Record<string, LinkBlock[]> = {};
    processedLinks.forEach(link => {
      if (!groups[link.type]) groups[link.type] = [];
      groups[link.type].push(link);
    });
    return groups;
  }, [processedLinks]);

  const handleBookmark = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.username} on Vendo`,
        url: profileUrl
      }).catch(console.error);
    } else {
      setShowSaveModal(true);
    }
  };

  const pixelActiveCount = (user.trackingPixels?.facebookPixelId ? 1 : 0) + (user.trackingPixels?.googleAnalyticsId ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4">
      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white max-w-sm w-full rounded-[3rem] p-10 shadow-2xl border border-white text-center">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <DevicePhoneMobileIcon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Save to Home Screen</h3>
              <p className="text-slate-500 font-medium mb-8">Tap the "Share" icon in your browser and select <span className="text-slate-900 font-black">"Add to Home Screen"</span> to keep your Vendo Hub accessible anywhere.</p>
              <button onClick={() => setShowSaveModal(false)} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl">Got it!</button>
           </div>
        </div>
      )}

      <header className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Traffic Hub</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your Live Bio: <span className="text-indigo-600">{profileUrl}</span></p>
            {pixelActiveCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[8px] font-black uppercase tracking-widest">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 {pixelActiveCount} Tracking Pixel{pixelActiveCount > 1 ? 's' : ''} Live
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={handleBookmark} className="p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            <BookmarkSquareIcon className="w-6 h-6" />
          </button>
          <button onClick={() => setIsAdding(true)} className="flex-1 sm:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95">
            <SquaresPlusIcon className="w-5 h-5" /> Add New Block
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-7 space-y-8">
           
           {/* Hub Organization Controls */}
           <div className="bg-white p-2 border border-slate-100 rounded-3xl shadow-sm flex items-center gap-2">
              <button 
                onClick={() => setHubMode('performance')}
                className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${hubMode === 'performance' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <PresentationChartBarIcon className="w-4 h-4" />
                Performance
              </button>
              <button 
                onClick={() => setHubMode('grouped')}
                className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${hubMode === 'grouped' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <Squares2X2Icon className="w-4 h-4" />
                Grouped
              </button>
              <button 
                onClick={() => setHubMode('manual')}
                className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${hubMode === 'manual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <ListBulletIcon className="w-4 h-4" />
                Manual
              </button>
           </div>

           {isAdding && (
             <div className="p-8 md:p-10 bg-white border border-indigo-100 rounded-[2.5rem] shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
               <div className="flex items-center justify-between">
                 <h2 className="text-xl font-black text-slate-900">Configure Block</h2>
                 <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                   <SparklesIcon className="w-5 h-5" />
                 </div>
               </div>
               
               <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setBlockType('custom')}
                    className={`py-4 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 transition-all ${blockType === 'custom' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                  >
                    Standard Link
                  </button>
                  <button 
                    onClick={() => setBlockType('hero')}
                    className={`py-4 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 transition-all ${blockType === 'hero' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                  >
                    Hero Video
                  </button>
                  <button 
                    onClick={() => setBlockType('share')}
                    className={`py-4 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 transition-all ${blockType === 'share' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                  >
                    Share Profile
                  </button>
               </div>
               
               {blockType !== 'share' ? (
                 <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Title Label</label>
                      <input placeholder="e.g. My Secret Shop" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Destination URL</label>
                      <div className="relative">
                        <input 
                          placeholder="Paste social or shop URL..." 
                          className={`w-full ${getFavicon(newUrl, blockType) ? 'pl-14' : 'pl-6'} pr-6 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300`} 
                          value={newUrl} 
                          onChange={(e) => setNewUrl(e.target.value)} 
                        />
                        {getFavicon(newUrl, blockType) && (
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden animate-in fade-in zoom-in-75 ring-1 ring-slate-100">
                            <img src={getFavicon(newUrl, blockType)!} alt="Favicon Preview" className="w-5 h-5 object-contain" />
                          </div>
                        )}
                      </div>
                    </div>
                 </div>
               ) : (
                 <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                       <ShareIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                       <p className="text-sm font-black text-slate-900">Share My Vendo Profile</p>
                       <p className="text-[10px] font-bold text-slate-500 italic">This block generates a 'Share' button with your profile QR code.</p>
                    </div>
                 </div>
               )}
               
               <div className="flex flex-col sm:flex-row gap-4 pt-4">
                 <button onClick={addLink} disabled={isCheckingSafety} className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                   {isCheckingSafety ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Create Block'}
                 </button>
                 <button onClick={() => setIsAdding(false)} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Cancel</button>
               </div>
             </div>
           )}

           <div className="space-y-4">
             {hubMode === 'grouped' ? (
               Object.entries(groupedLinks).map(([type, typeLinks]) => (
                 <div key={type} className="space-y-4">
                    <div className="flex items-center gap-2 px-6 py-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{type}S</span>
                       <div className="flex-1 h-px bg-slate-100"></div>
                    </div>
                    {(typeLinks as LinkBlock[]).map(link => (
                      <LinkBlockItem 
                        key={link.id} 
                        link={link} 
                        isTop={link.id === topLinkId}
                        onRemove={removeLink}
                        onMoveUp={() => moveLink(link.id, 'up')}
                        onMoveDown={() => moveLink(link.id, 'down')}
                        renderCategoryIcon={renderCategoryIcon}
                        getFavicon={getFavicon}
                      />
                    ))}
                 </div>
               ))
             ) : (
               processedLinks.map((link) => (
                 <LinkBlockItem 
                    key={link.id} 
                    link={link} 
                    isTop={link.id === topLinkId}
                    onRemove={removeLink}
                    onMoveUp={() => moveLink(link.id, 'up')}
                    onMoveDown={() => moveLink(link.id, 'down')}
                    renderCategoryIcon={renderCategoryIcon}
                    getFavicon={getFavicon}
                 />
               ))
             )}
           </div>
        </div>

        <div className="lg:col-span-5 space-y-10 lg:sticky lg:top-8 flex flex-col items-center">
           {/* Dynamic QR Gateway */}
           <div className="w-full max-w-[340px] bg-slate-900 p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden group/qr border border-slate-800">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                  <QrCodeIcon className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Gateway QR</h3>
                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">Auto-Sync Enabled</p>
                </div>
              </div>

              <div className="relative aspect-square bg-white rounded-[2.5rem] p-8 flex items-center justify-center overflow-hidden shadow-inner">
                 <img 
                    src={qrUrl} 
                    alt="Vendo Gateway QR" 
                    className={`w-full h-full object-contain transition-all duration-500 ${isSyncingQR ? 'blur-md scale-90 opacity-40' : 'opacity-100 scale-100'}`} 
                 />
                 
                 {isSyncingQR && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in duration-300">
                      <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center shadow-2xl">
                         <ArrowsRightLeftIcon className="w-6 h-6 text-indigo-500 animate-spin" />
                      </div>
                      <p className="mt-4 text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Updating...</p>
                   </div>
                 )}
                 
                 <div className="absolute bottom-4 right-4 opacity-0 group-hover/qr:opacity-100 transition-opacity">
                    <a 
                      href={qrUrl} 
                      download={`vendo-qr-${user.username}.png`}
                      className="p-3 bg-slate-900 text-white rounded-xl shadow-xl hover:bg-black transition-all flex items-center justify-center ring-4 ring-white"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </a>
                 </div>
              </div>

              <div className="mt-8 text-center space-y-2">
                <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{user.username.toUpperCase()}'S HUB</p>
                <p className="text-[9px] font-bold text-slate-500 leading-relaxed max-w-[180px] mx-auto">This code updates in real-time as you modify your blocks.</p>
              </div>
              
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <BoltIcon className="w-48 h-48 text-indigo-500" />
              </div>
           </div>

           {/* Mobile Preview */}
           <div className="w-[320px] md:w-[340px] h-[640px] md:h-[680px] bg-slate-900 rounded-[4rem] p-4 border-[10px] border-slate-800 shadow-2xl overflow-hidden ring-4 ring-slate-900/10 scale-[0.9] origin-top">
              <div className="w-full h-full bg-white rounded-[3rem] overflow-hidden flex flex-col relative">
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-100 rounded-full flex items-center justify-center z-50">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mr-2"></div>
                   <div className="w-8 h-1 bg-slate-200 rounded-full"></div>
                 </div>

                 <div className="flex-1 overflow-y-auto no-scrollbar pt-12 pb-8 px-6">
                   <div className="w-20 h-20 bg-indigo-600 rounded-full mx-auto mb-4 border-4 border-white shadow-xl flex items-center justify-center text-white font-black text-2xl">
                     {user.username.charAt(0).toUpperCase()}
                   </div>
                   <h4 className="text-center font-black text-slate-900 tracking-tight mb-8">@{user.username}</h4>

                   <div className="space-y-4">
                     {processedLinks.map(link => {
                       const isTop = link.id === topLinkId;
                       const favicon = getFavicon(link.url, link.type);
                       
                       if (link.type === 'hero') {
                         return (
                           <div key={link.id} className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-2 border-indigo-100 bg-black group">
                              <iframe 
                                src={parseVideoEmbed(link.url)} 
                                title={link.title}
                                className={`w-full h-full transition-all duration-700 ${link.isNsfw && !link.isUnblurred ? 'blur-[40px] scale-110' : ''}`}
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture"
                              />
                              <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-[8px] font-black rounded-lg uppercase tracking-widest border border-white/20">
                                  {link.title}
                                </span>
                              </div>
                           </div>
                         );
                       }

                       if (link.type === 'share') {
                         return (
                           <div 
                             key={link.id} 
                             className="relative py-4 px-6 rounded-2xl bg-slate-900 text-white text-[10px] font-black text-center shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all cursor-pointer overflow-hidden group/btn"
                           >
                             <div className="absolute inset-0 bg-indigo-600/20 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500"></div>
                             <ShareIcon className="w-4 h-4 text-indigo-400 relative z-10" />
                             <span className="relative z-10">{link.title}</span>
                             <div className="absolute right-3 opacity-20"><QrCodeIcon className="w-6 h-6" /></div>
                           </div>
                         );
                       }

                       return (
                         <div 
                           key={link.id} 
                           className={`relative py-4 px-6 rounded-2xl text-[10px] font-black text-center shadow-md transition-all flex items-center justify-center gap-3 ${isTop ? 'bg-indigo-50 text-indigo-900 border-2 border-indigo-200' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'}`}
                         >
                           {favicon && (
                             <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-slate-100">
                               <img src={favicon} className="w-5 h-5 object-contain" alt="" />
                             </div>
                           )}
                           <span className="truncate">{link.title}</span>
                         </div>
                       );
                     })}
                   </div>
                 </div>

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

interface LinkBlockItemProps {
  link: LinkBlock;
  isTop: boolean;
  onRemove: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  renderCategoryIcon: (link: LinkBlock) => React.ReactNode;
  getFavicon: (url: string, type: string) => string | null;
}

const LinkBlockItem: React.FC<LinkBlockItemProps> = ({ link, isTop, onRemove, onMoveUp, onMoveDown, renderCategoryIcon, getFavicon }) => {
  const favicon = getFavicon(link.url, link.type);
  
  return (
    <div className={`p-6 md:p-8 rounded-[2.5rem] border flex items-center gap-6 group transition-all ${link.type === 'hero' ? 'bg-indigo-50/30 border-indigo-200' : isTop ? 'bg-white border-indigo-200 shadow-xl' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 ${link.type === 'hero' ? 'bg-indigo-600 text-white shadow-lg' : link.type === 'share' ? 'bg-slate-900 text-white' : isTop ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
        {renderCategoryIcon(link)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
           {favicon && (
             <div className="w-10 h-10 rounded-xl bg-white shadow-sm ring-1 ring-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
               <img src={favicon} alt="" className="w-6 h-6 object-contain" />
             </div>
           )}
           <div className="min-w-0">
             <h3 className="text-lg font-black text-slate-900 truncate tracking-tight">{link.title}</h3>
             <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 truncate mt-0.5">
               <ChartBarIcon className="w-3.5 h-3.5" />
               {link.clicks.toLocaleString()} Clicks
               <span className="mx-1">•</span>
               <span className="text-slate-300 normal-case font-medium">{link.url.replace(/^https?:\/\//, '')}</span>
             </p>
           </div>
        </div>
      </div>
      <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-all">
        <div className="flex flex-col gap-1">
           <button onClick={onMoveUp} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
              <ChevronUpIcon className="w-4 h-4" />
           </button>
           <button onClick={onMoveDown} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
              <ChevronDownIcon className="w-4 h-4" />
           </button>
        </div>
        <button onClick={() => onRemove(link.id)} className="p-3 bg-white border border-slate-100 text-slate-300 hover:text-rose-600 rounded-xl transition-all shadow-sm active:scale-95">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default LinkHub;
