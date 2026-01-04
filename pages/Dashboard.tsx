
import React, { useState, useRef, useMemo } from 'react';
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
  ShieldCheckIcon
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Mocked performance data for ROI calculation
  const performance = useMemo(() => {
    const totalClicks = 428;
    const convRate = 0.02; // 2% industry avg
    const avgOrderValue = 50; // $50 avg
    const potentialSales = totalClicks * convRate * avgOrderValue;
    const cost = 25;
    const roi = Math.round(((potentialSales - cost) / cost) * 100);
    
    return {
      totalClicks,
      potentialSales,
      roi,
      cost
    };
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
          setTranscription("Processing dictation...");
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
    <div className="pb-24 max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hey, {user.username}!</h1>
            {user.subscription === 'pro' && <CheckBadgeIcon className="w-8 h-8 text-indigo-500" />}
          </div>
          <div className="flex items-center gap-4">
            <p className="text-slate-500 font-medium text-lg italic">"Your traffic engine never sleeps."</p>
            {user.privacySettings?.autoDeleteAfter24Months && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[9px] font-black uppercase tracking-widest">
                <ShieldCheckIcon className="w-3.5 h-3.5" />
                Secure Auto-Purge On
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-[2rem] p-6 text-white flex items-center gap-6 shadow-2xl shadow-indigo-200 border border-slate-800">
           <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/40">
              <CurrencyDollarIcon className="w-8 h-8" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-1">Weekly ROI Digest</p>
              <h3 className="text-xl font-black">+{performance.totalClicks} Clicks <span className="text-emerald-400 text-sm ml-2">+${performance.potentialSales.toLocaleString()} Est.</span></h3>
           </div>
           <button onClick={() => navigate('/stats')} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <ArrowUpRightIcon className="w-5 h-5" />
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <ActionCard icon={<PlusCircleIcon className="w-8 h-8" />} title="Create UGC Ad" description="Launch a new product campaign with AI-rendered creators." color="indigo" onClick={() => navigate('/create-ad')} badge="4 Left" />
        <ActionCard icon={<LinkIcon className="w-8 h-8" />} title="Share Page" description="Optimize your bio link and manage your shop blocks." color="purple" onClick={() => navigate('/links')} badge="Live" />
        <ActionCard icon={<ChartBarIcon className="w-8 h-8" />} title="View Stats" description="Deep-dive into click sources and asset performance." color="pink" onClick={() => navigate('/stats')} badge="Real-time" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                   <MicrophoneIcon className="w-6 h-6 text-indigo-600" />
                   Quick Ad Dictation
                </h2>
                <div className="flex gap-2">
                   {!isRecording ? (
                     <button onClick={startRecording} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black text-[10px] rounded-full uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                        <MicrophoneIcon className="w-4 h-4" />
                        Record Idea
                     </button>
                   ) : (
                     <button onClick={stopRecording} className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white font-black text-[10px] rounded-full uppercase tracking-widest animate-pulse">
                        <StopIcon className="w-4 h-4" />
                        Listening...
                     </button>
                   )}
                </div>
             </div>
             {transcription ? (
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl animate-in slide-in-from-top-4 duration-500">
                   <p className="text-sm font-bold text-slate-600 leading-relaxed italic">"{transcription}"</p>
                </div>
             ) : (
                <p className="text-sm font-medium text-slate-400 italic">No recent dictations. Tap record to speak your next ad hook idea.</p>
             )}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-amber-500" />
              Optimization Feed
            </h2>
            <InsightItem type="success" title="Passive Optimization Active" message="Sunday 9AM Analysis: Your 'Protein Glow' ad is outperforming others. We've moved it to your top block." time="Today" />
            <InsightItem type="info" title="First Click Detected" message="🎉 Someone just landed on your shop via TikTok! Vendo is now tracking conversion data." time="2h ago" />
          </div>
        </div>

        <div className="lg:col-span-4">
           <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white sticky top-8 overflow-hidden shadow-2xl shadow-indigo-200 border border-indigo-400">
              <BoltIcon className="w-32 h-32 absolute -top-8 -right-8 opacity-10" />
              <div className="flex items-center gap-2 mb-4">
                <CalculatorIcon className="w-5 h-5 text-indigo-300" />
                <h3 className="text-xl font-black">Value Calculator</h3>
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">Trial Performance</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-indigo-100">Clicks Driven</span>
                      <span>{performance.totalClicks}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-indigo-100">Est. Conversion</span>
                      <span>2%</span>
                    </div>
                    <div className="flex justify-between text-lg font-black pt-2 border-t border-white/5">
                      <span className="text-indigo-50">Potential Sales</span>
                      <span className="text-emerald-300">${performance.potentialSales.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Net Vendo ROI</p>
                    <h4 className="text-3xl font-black text-white">{performance.roi}%</h4>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-400 flex items-center justify-center text-indigo-900 shadow-lg shadow-emerald-400/20">
                    <ArrowTrendingUpIcon className="w-6 h-6" />
                  </div>
                </div>

                <p className="font-bold text-indigo-100 text-[11px] leading-relaxed italic">
                  "At a $25/mo cost, Vendo has already paid for itself multiple times over during your trial."
                </p>
              </div>

              <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-white text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-950/20">Keep Scaling for $25/mo</button>
              <p className="text-center mt-4 text-[9px] font-black uppercase tracking-widest text-indigo-300/60">Trial ends in 4 days</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const ActionCard: React.FC<{ icon: React.ReactNode, title: string, description: string, color: 'indigo' | 'purple' | 'pink', onClick: () => void, badge: string }> = ({ icon, title, description, color, onClick, badge }) => {
  const styles = { indigo: 'bg-indigo-600 shadow-indigo-100', purple: 'bg-purple-600 shadow-purple-100', pink: 'bg-pink-600 shadow-pink-100' }[color];
  return (
    <button onClick={onClick} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 text-left hover:border-indigo-600 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
      <div className="absolute top-6 right-6 px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{badge}</div>
      <div className={`w-14 h-14 ${styles} rounded-[1.2rem] flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-all duration-500 shadow-xl`}>{icon}</div>
      <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium text-sm leading-relaxed">{description}</p>
    </button>
  );
};

const InsightItem: React.FC<{ type: 'success' | 'info' | 'milestone', title: string, message: string, time: string }> = ({ type, title, message, time }) => {
  const config = { success: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: 'bg-emerald-500' }, info: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', icon: 'bg-indigo-500' }, milestone: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: 'bg-amber-500' } }[type];
  return (
    <div className={`p-8 rounded-[2rem] border ${config.border} ${config.bg} flex gap-6 items-start group hover:scale-[1.01] transition-transform`}>
      <div className={`w-2 h-2 rounded-full ${config.icon} mt-2.5 shrink-0 shadow-sm shadow-black/10`}></div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1"><h4 className={`font-black uppercase tracking-widest text-[10px] ${config.text}`}>{title}</h4><span className="text-[10px] font-black text-slate-400 uppercase">{time}</span></div>
        <p className={`text-sm font-bold leading-relaxed ${config.text} opacity-80`}>{message}</p>
      </div>
    </div>
  );
};

const StatusRow: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-3 text-xs font-black text-indigo-50"><CheckBadgeIcon className="w-5 h-5 text-indigo-300" />{label}</div>
);

export default Dashboard;
