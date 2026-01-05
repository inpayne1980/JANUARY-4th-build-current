
import React, { useState } from 'react';
import { 
  RocketLaunchIcon, 
  BoltIcon, 
  ChartBarIcon, 
  LinkIcon, 
  SparklesIcon,
  PlayIcon,
  CheckBadgeIcon,
  ShoppingBagIcon,
  FireIcon
} from '@heroicons/react/24/solid';

interface LandingProps {
  onLogin: (email: string) => void;
}

const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) onLogin(email);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-2xl tracking-tighter text-slate-900">
          <BoltIcon className="w-8 h-8 text-indigo-600" />
          VENDO
        </div>
        <div className="hidden md:flex items-center gap-10">
          <a href="#features" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">Features</a>
          <a href="#pricing" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">Pricing</a>
          <button onClick={() => onLogin('demo@vendo.page')} className="text-sm font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">Login</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-4">
            <SparklesIcon className="w-4 h-4" />
            V1.0 UGC ENGINE NOW LIVE
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-6 leading-[0.9]">
            Turn Views <br />
            Into <span className="text-indigo-600">Sales.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-xl mb-12 leading-relaxed font-medium">
            Generate high-fidelity AI ads, optimize your bio links automatically, and track every dollar of ROI. Built for creators who mean business.
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-3 rounded-3xl shadow-[0_32px_64px_-12px_rgba(99,102,241,0.15)] border border-slate-100 flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              required
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold transition-all"
            />
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-5 rounded-2xl transition-all shadow-xl shadow-indigo-200 uppercase text-xs tracking-widest active:scale-95"
            >
              Start Free Trial
            </button>
          </form>
          <div className="mt-8 flex items-center justify-center lg:justify-start gap-8">
             <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-4 border-white shadow-sm" alt="User" />
                ))}
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
               Joined by <span className="text-slate-900">2,500+ creators</span>
             </p>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="relative animate-in zoom-in-95 duration-1000">
           <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-100/50 rounded-full blur-3xl -z-10"></div>
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-100/50 rounded-full blur-3xl -z-10"></div>
           
           <div className="relative mx-auto w-[320px] h-[640px] bg-slate-900 rounded-[3.5rem] p-3 border-[8px] border-slate-800 shadow-2xl overflow-hidden ring-4 ring-slate-900/10">
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
                 <div className="pt-12 px-6 flex-1">
                    <div className="w-16 h-16 bg-indigo-600 rounded-full mx-auto mb-4 border-4 border-white shadow-xl flex items-center justify-center text-white font-black text-xl">S</div>
                    <h4 className="text-center font-black text-slate-900 text-sm tracking-tight mb-6">@sarahcreats</h4>
                    
                    <div className="space-y-3">
                       <MockLink title="My Gumroad Shop" icon="🛍️" active />
                       <div className="aspect-video bg-slate-900 rounded-2xl relative overflow-hidden group">
                          <img src="https://picsum.photos/seed/ugc/400/225" className="w-full h-full object-cover opacity-60" alt="Ad" />
                          <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"><PlayIcon className="w-4 h-4 ml-0.5" /></div>
                          </div>
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/20 backdrop-blur-md text-[8px] font-black text-white rounded uppercase tracking-widest">New Ad Hook</div>
                       </div>
                       <MockLink title="Latest TikTok Feed" icon="🎵" />
                       <MockLink title="Brand Media Kit" icon="📂" />
                    </div>
                 </div>
                 <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Built with Vendo Engine</p>
                 </div>
              </div>
           </div>

           {/* Floating ROI Notification */}
           <div className="absolute -right-8 top-1/4 bg-white p-5 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4 animate-bounce duration-[3000ms]">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                 <ChartBarIcon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Real-time Alert</p>
                 <p className="text-sm font-black text-slate-900">+428 Clicks ($2.1k)</p>
              </div>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-white py-32 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">One Hub. Three Actions. Zero Bloat.</h2>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">Stop juggling 10 different tools. Vendo consolidates your traffic lifecycle into a single workflow.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <FeatureCard 
                icon={<RocketLaunchIcon className="w-8 h-8 text-indigo-500" />}
                title="4 AI UGC Ads / Month"
                description="Our proprietary engine generates high-converting scripts and renders cinematic 4K assets automatically."
              />
              <FeatureCard 
                icon={<LinkIcon className="w-8 h-8 text-purple-500" />}
                title="Dynamic Vibe-Hub"
                description="Automatically fetch favicons and optimize link placements based on real-time performance data."
              />
              <FeatureCard 
                icon={<ChartBarIcon className="w-8 h-8 text-pink-500" />}
                title="Deep ROI Attribution"
                description="See which social platform and which specific ad hook is driving the most revenue for your shop."
              />
           </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-slate-900 py-32 overflow-hidden relative">
        <BoltIcon className="w-96 h-96 text-indigo-500/10 absolute -bottom-24 -right-24" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Scale your creator <br /> business to the next level.</h2>
          <p className="text-slate-400 text-xl font-medium mb-12 max-w-xl mx-auto">Join the new era of performance creators. Get started with your 7-day free trial today.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-12 py-6 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase text-sm tracking-widest shadow-2xl">Start Trial</button>
             <button className="px-12 py-6 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all border border-slate-700 uppercase text-sm tracking-widest">View Demo</button>
          </div>
          <p className="mt-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">$25/month after trial ends • Cancel anytime</p>
        </div>
      </section>
    </div>
  );
};

const MockLink: React.FC<{ title: string, icon: string, active?: boolean }> = ({ title, icon, active }) => (
  <div className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-[9px] font-black transition-all ${active ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-600 border-slate-100'}`}>
     <span>{icon}</span>
     {title}
  </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="group bg-[#FBFBFF] p-10 rounded-[3rem] border border-slate-100 hover:border-indigo-200 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(99,102,241,0.1)]">
    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500 group-hover:bg-indigo-50 group-hover:text-indigo-600">
      {icon}
    </div>
    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
  </div>
);

export default Landing;
