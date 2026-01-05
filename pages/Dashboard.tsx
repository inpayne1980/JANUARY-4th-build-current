
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircleIcon, 
  LinkIcon, 
  ChartBarIcon, 
  BoltIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ArrowUpRightIcon,
  CurrencyDollarIcon,
  MicrophoneIcon,
  StopIcon,
  CalculatorIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  FireIcon,
  XMarkIcon,
  RocketLaunchIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline';
import { User } from '../types';
import { transcribeAudio } from '../services/geminiService';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!localStorage.getItem(`onboarding_complete_${user.id}`)) {
      setShowOnboarding(true);
    }
  }, [user.id]);

  const completeOnboarding = () => {
    localStorage.setItem(`onboarding_complete_${user.id}`, 'true');
    setShowOnboarding(false);
  };

  const performance = useMemo(() => {
    const totalClicks = 428;
    const convRate = 0.02;
    const avgOrderValue = 50;
    const potentialSales = totalClicks * convRate * avgOrderValue;
    const cost = 25;
    const roi = Math.round(((potentialSales - cost) / cost) * 100);
    
    return { totalClicks, potentialSales, roi, cost };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setTranscription("Synthesizing creative insight...");
          const text = await transcribeAudio(base64);
          setTranscription(text);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Recording failed", e);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="pb-24 max-w-7xl mx-auto px-4 md:px-0">
      {/* Smart Onboarding Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[150] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="bg-white max-w-2xl w-full rounded-[3.5rem] shadow-2xl border border-white overflow-hidden relative">
              <div className="absolute top-6 right-6">
                <button onClick={completeOnboarding} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-12 md:p-16">
                 <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-200">
                    <SparklesIcon className="w-8 h-8 animate-pulse" />
                 </div>
                 <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Welcome to Vendo 1.0</h2>
                 <p className="text-slate-500 font-bold text-lg mb-10">Your all-in-one UGC and Traffic Hub. Here's how to scale:</p>
                 
                 <div className="space-y-6 mb-12">
                    <OnboardingStep 
                      icon={<RocketLaunchIcon className="w-6 h-6" />} 
                      title="AI UGC Studio" 
                      desc="Generate 4K viral ad scripts and videos in seconds using Gemini 3." 
                    />
                    <OnboardingStep 
                      icon={<LinkIcon className="w-6 h-6" />} 
                      title="Traffic Hub" 
                      desc="A living link-in-bio page that syncs your socials and tracks every click." 
                    />
                    <OnboardingStep 
                      icon={<PresentationChartBarIcon className="w-6 h-6" />} 
                      title="ROI Analytics" 
                      desc="See exactly where your money is made with deep platform attribution." 
                    />
                 </div>

                 <button 
                  onClick={completeOnboarding}
                  className="w-full py-6 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-sm"
                 >
                   Start Growing My Business
                 </button>
              </div>
           </div>
        </div>
      )}

      <header className="mb-16 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                <BoltIcon className="w-6 h-6" />
             </div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Creator Studio</h1>
             {user.subscription === 'pro' && (
               <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                  <CheckBadgeIcon className="w-4 h-4" />
                  Pro Active
               </div>
             )}
          </div>
          <div className="flex items-center gap-6">
            <p className="text-slate-500 font-bold text-lg leading-none">Welcome back, <span className="text-slate-900">{user.username}</span></p>
            {user.privacySettings?.autoDeleteAfter24Months && (
              <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                <ShieldCheckIcon className="w-4 h-4" />
                Data Protected
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                 <CurrencyDollarIcon className="w-6 h-6" />
              </div>
              <div className="pr-8">
                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Est. Conversion</p>
                 <h3 className="text-xl font-black text-slate-900">+${performance.potentialSales.toLocaleString()} <span className="text-emerald-500 text-sm ml-1">+14%</span></h3>
              </div>
              <button onClick={() => navigate('/stats')} className="p-3 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl transition-all">
                 <ArrowUpRightIcon className="w-5 h-5" />
              </button>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <ActionCard 
          icon={<PlusCircleIcon className="w-8 h-8" />} 
          title="Create AI Ad" 
          description="Render 4K cinematic UGC videos for your next launch." 
          color="indigo" 
          onClick={() => navigate('/create-ad')} 
          badge="4 Credits" 
        />
        <ActionCard 
          icon={<LinkIcon className="w-8 h-8" />} 
          title="Vibe Hub" 
          description="Manage your bio link and sync social platform favicons." 
          color="purple" 
          onClick={() => navigate('/links')} 
          badge="Live Hub" 
        />
        <ActionCard 
          icon={<ChartBarIcon className="w-8 h-8" />} 
          title="ROI Tracker" 
          description="Deep attribution insights for every social traffic source." 
          color="pink" 
          onClick={() => navigate('/stats')} 
          badge="Real-time" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-slate-900 p-10 md:p-12 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-[5000ms]">
                <MicrophoneIcon className="w-64 h-64 text-white" />
             </div>
             
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                   <div>
                      <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        Quick Ad Dictation
                      </h2>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Spoken concept to ad script in 2 seconds</p>
                   </div>
                   {!isRecording ? (
                     <button onClick={startRecording} className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-black text-xs rounded-2xl uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 group/btn">
                        <MicrophoneIcon className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                        Record Idea
                     </button>
                   ) : (
                     <button onClick={stopRecording} className="flex items-center gap-2 px-8 py-4 bg-rose-600 text-white font-black text-xs rounded-2xl uppercase tracking-widest animate-pulse shadow-xl shadow-rose-600/20">
                        <StopIcon className="w-5 h-5" />
                        Stop Recording
                     </button>
                   )}
                </div>

                {transcription ? (
                   <div className="p-8 bg-white/5 border border-white/10 rounded-3xl animate-in slide-in-from-top-4 duration-500 group/trans">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Dictated Creative Concept</span>
                        <button onClick={() => setTranscription(null)} className="text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest">Clear</button>
                      </div>
                      <p className="text-lg font-bold text-slate-200 leading-relaxed italic">"{transcription}"</p>
                      <div className="mt-6 flex gap-3">
                         <button onClick={() => navigate('/create-ad')} className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all">Create Ad from This</button>
                      </div>
                   </div>
                ) : (
                   <div className="p-10 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-4"><MicrophoneIcon className="w-8 h-8" /></div>
                      <p className="text-slate-500 font-bold italic">Tap record and speak your next viral hook idea.</p>
                   </div>
                )}
             </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <SparklesIcon className="w-6 h-6 text-amber-500" />
                Optimization Pulse
              </h2>
              <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Clear Logs</button>
            </div>
            <InsightItem 
              type="success" 
              title="Page Auto-Optimized" 
              message="Sunday Audit: Your 'Gumroad Shop' link is currently 2.4x more likely to convert. We've promoted it to the top position." 
              time="4m ago" 
            />
            <InsightItem 
              type="info" 
              title="Traffic Signal" 
              message="New click detected from TikTok. Referral Source: Ad #7 'Protein Glow Hook'. Tracking active." 
              time="2h ago" 
            />
          </div>
        </div>

        <div className="lg:col-span-4">
           <div className="bg-indigo-600 rounded-[3rem] p-10 text-white sticky top-8 overflow-hidden shadow-2xl shadow-indigo-100 border border-indigo-500">
              <FireIcon className="w-40 h-40 absolute -top-10 -right-10 opacity-10 animate-pulse" />
              <div className="flex items-center gap-3 mb-8">
                <CalculatorIcon className="w-6 h-6 text-indigo-200" />
                <h3 className="text-2xl font-black tracking-tight">Value Forecast</h3>
              </div>
              
              <div className="space-y-6 mb-10">
                <div className="p-6 bg-white/10 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Current ROI Yield</p>
                    <div className="px-2 py-1 bg-emerald-500 text-white text-[8px] font-black rounded uppercase">Verified</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-indigo-100 font-bold text-sm">Trial Clicks</span>
                      <span className="text-2xl font-black">{performance.totalClicks}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-indigo-100 font-bold text-sm">Potential Sales</span>
                      <span className="text-2xl font-black text-emerald-300">${performance.potentialSales.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-2">
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Vendo Net Yield</p>
                    <h4 className="text-5xl font-black text-white tracking-tighter">{performance.roi}%</h4>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-emerald-400 flex items-center justify-center text-indigo-900 shadow-xl shadow-emerald-400/30">
                    <ArrowTrendingUpIcon className="w-8 h-8" />
                  </div>
                </div>

                <p className="font-bold text-indigo-100 text-xs leading-relaxed italic opacity-80">
                  "At $25/month, Vendo is paying for itself 42x over. Don't leave money on the table."
                </p>
              </div>

              <button 
                onClick={() => navigate('/settings')} 
                className="w-full py-5 bg-white text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/40 uppercase text-xs tracking-widest active:scale-95"
              >
                Keep Scaling Pro
              </button>
              <div className="mt-6 flex items-center justify-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200/60">Subscription renews in 4 days</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const OnboardingStep: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="flex gap-6 items-start">
    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-lg font-black text-slate-900 leading-tight">{title}</h4>
      <p className="text-sm font-bold text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const ActionCard: React.FC<{ icon: React.ReactNode, title: string, description: string, color: 'indigo' | 'purple' | 'pink', onClick: () => void, badge: string }> = ({ icon, title, description, color, onClick, badge }) => {
  const styles = { indigo: 'bg-indigo-600 shadow-indigo-100', purple: 'bg-purple-600 shadow-purple-100', pink: 'bg-pink-600 shadow-pink-100' }[color];
  const ring = { indigo: 'hover:ring-indigo-100', purple: 'hover:ring-purple-100', pink: 'hover:ring-pink-100' }[color];
  
  return (
    <button onClick={onClick} className={`group bg-white p-10 rounded-[3rem] border border-slate-100 text-left transition-all duration-500 transform hover:-translate-y-3 relative overflow-hidden shadow-sm hover:shadow-2xl ring-0 hover:ring-[12px] ${ring}`}>
      <div className="absolute top-8 right-8 px-4 py-1.5 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shadow-inner">{badge}</div>
      <div className={`w-16 h-16 ${styles} rounded-2xl flex items-center justify-center text-white mb-10 group-hover:scale-110 transition-all duration-500 shadow-xl shadow-opacity-30`}>{icon}</div>
      <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
    </button>
  );
};

const InsightItem: React.FC<{ type: 'success' | 'info' | 'milestone', title: string, message: string, time: string }> = ({ type, title, message, time }) => {
  const config = { 
    success: { bg: 'bg-emerald-50/50', text: 'text-emerald-700', border: 'border-emerald-100', icon: 'bg-emerald-500' }, 
    info: { bg: 'bg-indigo-50/50', text: 'text-indigo-700', border: 'border-indigo-100', icon: 'bg-indigo-500' }, 
    milestone: { bg: 'bg-amber-50/50', text: 'text-amber-700', border: 'border-amber-100', icon: 'bg-amber-500' } 
  }[type];
  
  return (
    <div className={`p-8 rounded-[2.5rem] border ${config.border} ${config.bg} flex gap-8 items-start group hover:scale-[1.01] transition-transform shadow-sm`}>
      <div className={`w-3 h-3 rounded-full ${config.icon} mt-2.5 shrink-0 shadow-lg shadow-black/10`}></div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <h4 className={`font-black uppercase tracking-[0.2em] text-[10px] ${config.text}`}>{title}</h4>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{time}</span>
        </div>
        <p className={`text-base font-bold leading-relaxed ${config.text} opacity-80`}>{message}</p>
      </div>
    </div>
  );
};

export default Dashboard;
