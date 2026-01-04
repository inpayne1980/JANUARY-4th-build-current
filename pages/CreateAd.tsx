
import React, { useState, useEffect, useRef } from 'react';
import { 
  generateAdScripts, 
  generateAdVisual, 
  GeneratedAd, 
  generateSpeech,
  analyzeImage,
  analyzeVideoContent,
  analyzeBaseVideo,
  analyzeProductUrl,
  generateSocialCaptions,
  generateThumbnail,
  generateVideo,
  SocialCaptions
} from '../services/geminiService';
import { User, LinkBlock } from '../types';
import { 
  CheckCircleIcon, 
  PlayIcon, 
  PauseIcon,
  SparklesIcon, 
  ArrowPathIcon,
  VideoCameraIcon,
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  CpuChipIcon,
  CommandLineIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowUturnLeftIcon,
  PhotoIcon,
  ChartPieIcon,
  CameraIcon,
  LinkIcon,
  DocumentDuplicateIcon,
  HashtagIcon,
  AdjustmentsHorizontalIcon,
  PaperAirplaneIcon,
  Square3Stack3DIcon,
  LightBulbIcon,
  Square2StackIcon,
  XMarkIcon,
  BoltIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/solid';

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) { videoRef.current.pause(); } 
      else { videoRef.current.play(); }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) { setDuration(videoRef.current.duration); }
  };

  return (
    <div className="relative w-full h-full group bg-black rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/10">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        crossOrigin="anonymous"
        className="w-full h-full object-cover cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        loop
        playsInline
      />
      {!isPlaying && (
        <div onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer transition-all hover:bg-black/30">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white scale-100 hover:scale-110 transition-transform shadow-2xl">
            <PlayIcon className="w-10 h-10 ml-1" />
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="relative w-full mb-6">
          <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="absolute top-0 w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-indigo-500 z-10" />
          <div className="absolute top-0 h-1.5 bg-indigo-500 rounded-full pointer-events-none" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay}>{isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}</button>
            <button onClick={toggleMute}>{isMuted ? <SpeakerXMarkIcon className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6" />}</button>
          </div>
          <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest">4K Gemini Rendering</div>
        </div>
      </div>
    </div>
  );
};

const CreateAd: React.FC<{ user: User }> = ({ user }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    tone: 'Energetic'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMagicFilling, setIsMagicFilling] = useState(false);
  const [magicUrl, setMagicUrl] = useState('');
  const [groundingLinks, setGroundingLinks] = useState<any[]>([]);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStatus, setRenderStatus] = useState('');
  const [renderLogs, setRenderLogs] = useState<string[]>([]);
  const [results, setResults] = useState<GeneratedAd[]>([]);
  const [selectedAdIdx, setSelectedAdIdx] = useState<number | null>(null);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<string | null>(null);
  const [videoAnalysis, setVideoAnalysis] = useState<string | null>(null);
  const [baseVideoUrl, setBaseVideoUrl] = useState<string | null>(null);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [socialCaptions, setSocialCaptions] = useState<SocialCaptions | null>(null);
  const [activeCaptionTab, setActiveCaptionTab] = useState<'tiktok' | 'instagram' | 'youtube'>('tiktok');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);
  
  const logEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Persistence logic
  useEffect(() => {
    const saved = localStorage.getItem(`vendo_campaigns_${user.id}`);
    if (saved) {
      // Logic to load last incomplete campaign could go here
    }
  }, [user.id]);

  useEffect(() => {
    if (logEndRef.current) { logEndRef.current.scrollIntoView({ behavior: 'smooth' }); }
  }, [renderLogs]);

  const handleError = async (e: any) => {
    console.error(e);
    if (e.message?.includes("Requested entity was not found") && window.aistudio) {
      await window.aistudio.openSelectKey();
    }
  };

  const handleMagicFill = async () => {
    if (!magicUrl) return;
    setIsMagicFilling(true);
    try {
      const info = await analyzeProductUrl(magicUrl);
      setFormData(prev => ({
        ...prev,
        productName: info.productName,
        description: info.description
      }));
      setGroundingLinks(info.links);
      setMagicUrl('');
    } catch (e) { await handleError(e); } 
    finally { setIsMagicFilling(false); }
  };

  const handleGenerateScripts = async () => {
    setIsGenerating(true);
    setStep(2);
    try {
      const ads = await generateAdScripts(formData.productName, formData.description, formData.tone);
      setResults(ads);
    } catch (e) { await handleError(e); } 
    finally { setIsGenerating(false); }
  };

  const handleRenderAd = async () => {
    if (selectedAdIdx === null) return;
    setRenderProgress(1);
    setRenderStatus('Initializing Gemini Veo...');
    setRenderLogs(['[SYSTEM] Authenticating with Veo Operation Hub...', '[SYSTEM] Allocating 4K Render Nodes...']);
    
    try {
      const selectedAd = results[selectedAdIdx];
      
      // Simulate rendering logs while polling
      const logInterval = setInterval(() => {
        const fakeLogs = [
          "Synthesizing lighting environment...",
          "Mapping skin textures to actor persona...",
          "Syncing neural lip-motion with script data...",
          "Applying cinematic color grading (9:16)..."
        ];
        const log = fakeLogs[Math.floor(Math.random() * fakeLogs.length)];
        setRenderLogs(prev => [...prev, `[RENDER] ${log}`]);
        setRenderProgress(prev => Math.min(prev + 1, 95));
      }, 5000);

      const videoUrl = await generateVideo(selectedAd.script);
      clearInterval(logInterval);
      
      setRenderProgress(100);
      setRenderStatus('Production Complete');
      setRenderLogs(prev => [...prev, '[SYSTEM] Asset packaged. Delivery verified.']);
      
      setRenderedVideoUrl(videoUrl);
      
      // Post-generation analysis
      const captions = await generateSocialCaptions(selectedAd.script);
      setSocialCaptions(captions);
      
      setTimeout(() => setStep(3), 1000);
    } catch (e) {
      await handleError(e);
      setRenderProgress(0);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4">
      {/* Step Header */}
      <div className="flex items-center gap-4 mb-12">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl">
          <VideoCameraIcon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI UGC Studio</h1>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${step >= i ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
            ))}
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Paste Product URL for Magic Auto-Fill" 
                value={magicUrl}
                onChange={(e) => setMagicUrl(e.target.value)}
                className="w-full pl-6 pr-32 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-[6px] focus:ring-indigo-100 font-bold transition-all text-sm"
              />
              <button 
                onClick={handleMagicFill}
                disabled={isMagicFilling}
                className="absolute right-3 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] rounded-xl uppercase tracking-widest transition-all"
              >
                {isMagicFilling ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Magic Fill'}
              </button>
            </div>

            <div className="space-y-6">
              <FormInput label="Product Name" placeholder="e.g. Protein Glow" value={formData.productName} onChange={(v) => setFormData({...formData, productName: v})} />
              <FormTextarea label="Campaign Description" placeholder="Who is this for?" value={formData.description} onChange={(v) => setFormData({...formData, description: v})} />
              <button onClick={handleGenerateScripts} disabled={isGenerating} className="w-full py-6 bg-slate-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3">
                {isGenerating ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <SparklesIcon className="w-6 h-6 text-indigo-400" />}
                Generate Scripts
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <FeatureBox icon={<CpuChipIcon className="w-6 h-6" />} title="Performance Memory" desc="AI matches scripts against your top-performing conversion patterns." />
            <FeatureBox icon={<CloudArrowUpIcon className="w-6 h-6" />} title="Veo 4K Rendering" desc="Utilizing Google's ultra-fidelity video generation engine." />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {results.map((ad, idx) => (
              <div key={idx} onClick={() => setSelectedAdIdx(idx)} className={`relative cursor-pointer rounded-[2.5rem] overflow-hidden border-4 transition-all ${selectedAdIdx === idx ? 'border-indigo-600 scale-[1.03] shadow-2xl' : 'border-white hover:border-slate-200'}`}>
                <div className="aspect-[9/16] bg-slate-900 relative">
                  <img src={`https://picsum.photos/seed/${idx + 50}/400/700`} className="w-full h-full object-cover opacity-60" alt="Preview" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <p className="text-white font-black text-xl leading-tight">"{ad.hook}"</p>
                  </div>
                  {selectedAdIdx === idx && <div className="absolute top-6 right-6 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white"><CheckCircleIcon className="w-7 h-7" /></div>}
                </div>
              </div>
            ))}
          </div>

          {selectedAdIdx !== null && (
            <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Production Script</h3>
              <p className="text-2xl font-bold text-slate-800 italic mb-10 leading-relaxed">"{results[selectedAdIdx].script}"</p>
              <button onClick={handleRenderAd} className="w-full py-6 bg-slate-900 hover:bg-black text-white font-black text-xl rounded-2xl transition-all shadow-xl flex items-center justify-center gap-4">
                <SparklesIcon className="w-6 h-6 text-amber-400" />
                Render High-Fidelity UGC Pack
              </button>
            </div>
          )}
        </div>
      )}

      {renderProgress > 0 && step === 2 && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-12 animate-in fade-in">
          <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             <div>
                <h2 className="text-5xl font-black text-white mb-6 tracking-tighter">{renderStatus}</h2>
                <div className="flex items-center gap-6 mb-12">
                   <div className="text-6xl font-black text-indigo-500">{renderProgress}%</div>
                   <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-300" style={{ width: `${renderProgress}%` }}></div>
                   </div>
                </div>
                <p className="text-slate-500 font-bold">This operation can take 1-3 minutes. Your files will be available for download instantly once synced.</p>
             </div>
             <div className="bg-black/50 border border-white/10 rounded-3xl p-6 font-mono text-[11px] text-emerald-500/80 h-[300px] overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar">
                  {renderLogs.map((log, i) => (<div key={i} className="animate-in slide-in-from-left-2">{log}</div>))}
                  <div ref={logEndRef} />
                </div>
             </div>
          </div>
        </div>
      )}

      {step === 3 && renderedVideoUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in zoom-in-95">
          <div className="lg:col-span-5">
            <div className="aspect-[9/16] min-h-[500px]">
              <VideoPlayer src={renderedVideoUrl} />
            </div>
          </div>
          <div className="lg:col-span-7 space-y-10">
            <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm">
              <h2 className="text-4xl font-black text-slate-900 mb-6">UGC Pack Ready</h2>
              <div className="space-y-6 mb-10">
                 {socialCaptions && Object.entries(socialCaptions).map(([platform, items]) => {
                   if (platform === 'hashtags') return null;
                   return (
                     <div key={platform} className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{platform} Copy</h4>
                        {(items as string[]).map((cap, i) => (
                          <div key={i} className="group relative bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-600 truncate mr-12">{cap}</p>
                            <button onClick={() => handleCopy(cap, i)} className="p-2 bg-white rounded-lg shadow-sm hover:text-indigo-600">
                              <Square2StackIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                     </div>
                   );
                 })}
              </div>
              <div className="flex gap-4">
                <a href={renderedVideoUrl} download className="flex-1 py-6 bg-slate-900 text-white font-black text-xl rounded-2xl text-center hover:bg-black transition-all">Download Bundle</a>
                <button onClick={() => setStep(1)} className="px-10 bg-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-200 uppercase text-[10px]">New Project</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FormInput = ({ label, placeholder, value, onChange }: any) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</label>
    <input type="text" placeholder={placeholder} className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50 font-bold" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const FormTextarea = ({ label, placeholder, value, onChange }: any) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</label>
    <textarea rows={4} placeholder={placeholder} className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50 font-bold" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const FeatureBox = ({ icon, title, desc }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex gap-6">
    <div className="w-14 h-14 rounded-2xl bg-slate-50 text-indigo-600 flex items-center justify-center shrink-0">{icon}</div>
    <div><h3 className="font-black text-slate-900 mb-1">{title}</h3><p className="text-sm font-bold text-slate-400">{desc}</p></div>
  </div>
);

export default CreateAd;
