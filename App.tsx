
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { 
  PlusCircleIcon, 
  ChartBarIcon, 
  LinkIcon, 
  RocketLaunchIcon,
  BoltIcon,
  ShieldCheckIcon,
  XMarkIcon,
  CreditCardIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateAd from './pages/CreateAd';
import Stats from './pages/Stats';
import LinkHub from './pages/LinkHub';
import Settings from './pages/Settings';
import { User } from './types';

declare global {
  // Define AIStudio interface for window.aistudio
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  
  interface Window {
    // FIX: Removed readonly to match the environment's pre-configured global declaration
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true); // Assume true initially
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('vendo_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // MANDATORY: Check if API key is selected before accessing main app
    const checkApiKey = async () => {
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(selected);
        } catch (e) {
          console.error("Failed to check API key status", e);
        }
      }
    };
    checkApiKey();
  }, []);

  const handleLogin = (email: string) => {
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email,
      username: email.split('@')[0],
      subscription: 'free',
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      privacySettings: {
        autoDeleteAfter24Months: true
      }
    };
    setUser(newUser);
    localStorage.setItem('vendo_user', JSON.stringify(newUser));
    navigate('/dashboard');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('vendo_user', JSON.stringify(updatedUser));
  };

  const handleUpgrade = () => {
    if (user) {
      const upgradedUser: User = { ...user, subscription: 'pro' };
      updateUser(upgradedUser);
      setShowUpgrade(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('vendo_user');
    navigate('/');
  };

  const openApiKeyDialog = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Guideline: Assume the key selection was successful after triggering openSelectKey()
      setHasApiKey(true);
    }
  };

  // VALUE CALCULATOR LOGIC
  const performanceData = useMemo(() => {
    const clicks = 428;
    const sales = clicks * 0.02 * 50;
    const roi = Math.round(((sales - 25) / 25) * 100);
    return { clicks, sales, roi };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 font-sans">
      {/* MANDATORY API KEY SELECTION DIALOG */}
      {!hasApiKey && user && (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full text-center shadow-2xl border border-white">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <BoltIcon className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">API Key Required</h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              To use Gemini 3 models for UGC generation, you must select an API key from a paid GCP project.
            </p>
            <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4" />
                Required for Pro Features
              </p>
              <ul className="text-xs font-bold text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                   High-Fidelity Actor Rendering
                </li>
                <li className="flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                   4K Resolution Assets
                </li>
              </ul>
            </div>
            <button 
              onClick={openApiKeyDialog}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-indigo-200"
            >
              Select API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noreferrer"
              className="mt-6 block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
            >
              Billing Documentation →
            </a>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Landing onLogin={handleLogin} />} />
        {user && (
          <Route path="/*" element={
            <div className="flex h-screen overflow-hidden">
              <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6">
                  <Link to="/dashboard" className="flex items-center gap-2 font-black text-2xl tracking-tighter text-indigo-600">
                    < BoltIcon className="w-8 h-8" />
                    VENDO
                  </Link>
                </div>
                
                <nav className="flex-1 px-4 space-y-1">
                  <SidebarLink to="/dashboard" icon={<RocketLaunchIcon className="w-5 h-5" />} label="Dashboard" />
                  <SidebarLink to="/create-ad" icon={<PlusCircleIcon className="w-5 h-5" />} label="Create UGC Ad" />
                  <SidebarLink to="/links" icon={<LinkIcon className="w-5 h-5" />} label="Share Page" />
                  <SidebarLink to="/stats" icon={<ChartBarIcon className="w-5 h-5" />} label="View Stats" />
                  <SidebarLink to="/settings" icon={<Cog6ToothIcon className="w-5 h-5" />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-slate-100">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      <ShieldCheckIcon className="w-3.5 h-3.5" />
                      Account Status
                    </div>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      {user.subscription === 'pro' ? (
                        <><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Pro Member</>
                      ) : (
                        <><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Free Trial</>
                      )}
                    </p>
                    {user.subscription === 'free' && (
                      <button 
                        onClick={() => setShowUpgrade(true)}
                        className="mt-3 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl transition-all shadow-md shadow-indigo-100 uppercase"
                      >
                        UPGRADE TO PRO ($25)
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="mt-4 w-full text-left px-4 py-2 text-xs text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider"
                  >
                    Logout
                  </button>
                </div>
              </aside>

              <main className="flex-1 overflow-y-auto bg-[#FBFBFF]">
                <div className="max-w-6xl mx-auto p-4 md:p-8">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard user={user} />} />
                    <Route path="/create-ad" element={<CreateAd user={user} />} />
                    <Route path="/links" element={<LinkHub user={user} />} />
                    <Route path="/stats" element={<Stats user={user} />} />
                    <Route path="/settings" element={<Settings user={user} onUpdateUser={updateUser} />} />
                  </Routes>
                </div>
              </main>

              <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-around p-4 z-50">
                <MobileLink to="/dashboard" icon={<RocketLaunchIcon className="w-6 h-6" />} />
                <MobileLink to="/create-ad" icon={<PlusCircleIcon className="w-6 h-6" />} />
                <MobileLink to="/links" icon={<LinkIcon className="w-6 h-6" />} />
                <MobileLink to="/stats" icon={<ChartBarIcon className="w-6 h-6" />} />
                <MobileLink to="/settings" icon={<Cog6ToothIcon className="w-6 h-6" />} />
              </nav>
            </div>
          } />
        )}
      </Routes>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 relative shadow-2xl overflow-hidden border border-white">
            <div className="absolute top-0 right-0 p-6">
              <button onClick={() => setShowUpgrade(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                < BoltIcon className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Unlock Vendo Pro</h2>
              <p className="text-slate-500 font-medium mb-8">4 AI UGC ads per month, advanced ROI tracking, and priority cloud rendering.</p>
              
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 mb-8 text-left">
                 <div className="flex justify-between items-center mb-6">
                   <span className="font-bold text-slate-700">Pro Plan</span>
                   <span className="text-2xl font-black text-indigo-600">$25<span className="text-sm text-slate-400">/mo</span></span>
                 </div>
                 
                 {/* VALUE CALCULATOR BREAKDOWN */}
                 <div className="mb-6 pb-6 border-b border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Your Trial Impact</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-[9px] font-black text-emerald-600 uppercase">Potential Sales</p>
                        <p className="text-lg font-black text-emerald-900">${performanceData.sales.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                        <p className="text-[9px] font-black text-indigo-600 uppercase">Est. ROI</p>
                        <p className="text-lg font-black text-indigo-900">{performanceData.roi}%</p>
                      </div>
                    </div>
                    <p className="mt-3 text-[10px] font-bold text-slate-400 italic">Based on your {performanceData.clicks} trial clicks at a 2% conversion rate.</p>
                 </div>

                 <div className="space-y-3">
                   <FeatureRow label="4 High-Fidelity AI Ads" />
                   <FeatureRow label="Unlimited Link Hub Blocks" />
                   <FeatureRow label="Direct TikTok/IG Publishing" />
                   <FeatureRow label="Cloud Archive Storage" />
                 </div>
              </div>

              <button 
                onClick={handleUpgrade}
                className="w-full py-5 bg-slate-900 hover:bg-black text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
              >
                <CreditCardIcon className="w-6 h-6" />
                Upgrade Now
              </button>
              <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure checkout via Stripe • Cancel anytime</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureRow: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
      < BoltIcon className="w-3 h-3" />
    </div>
    {label}
  </div>
);

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => (
  <Link 
    to={to} 
    className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-indigo-50/50 hover:text-indigo-600 rounded-2xl transition-all font-bold group"
  >
    <div className="group-hover:scale-110 transition-transform">{icon}</div>
    {label}
  </Link>
);

const MobileLink: React.FC<{ to: string, icon: React.ReactNode }> = ({ to, icon }) => (
  <Link to={to} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
    {icon}
  </Link>
);

export default App;
