
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
  refineAdScript,
  generateThumbnail,
  generateVideo,
  SocialCaptions
} from '../services/geminiService';
import { User } from '../types';
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
  Square3Stack3DIcon,
  LightBulbIcon,
  Square2StackIcon,
  BoltIcon,
  ClipboardDocumentCheckIcon,
  BeakerIcon,
  IdentificationIcon,
  PresentationChartLineIcon,
  DocumentArrowDownIcon
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

  return (
    <div className="relative w-full aspect-[9/16] group bg-slate-900 rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        crossOrigin="anonymous"
        className="w-full h-full object-cover cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onClick={togglePlay}
        loop
        playsInline
      />
      {!isPlaying && (
        <div onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-all hover:bg-black/40">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center text-white scale-100 hover:scale-110 transition-transform shadow-2xl">
            <PlayIcon className="w-10 h-10 ml-1.5" />
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="relative w-full mb-6 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]" style={{ width: `${progress}%` }}></div>
          <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={togglePlay} className="text-white hover:text-indigo-400 transition-colors">
              {isPlaying ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7" />}
            </button>
            <button onClick={toggleMute} className="text-white hover:text-indigo-400 transition-colors">
              {isMuted ? <SpeakerXMarkIcon className="w-7 h-7" /> : <SpeakerWaveIcon className="w-7 h-7" />}
            </button>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-indigo-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-500/30">Native 4K</div>
             <div className="text-[10px] font-black text-white/60 uppercase tracking-widest tabular-nums">
                {videoRef.current ? Math.floor(videoRef.current.currentTime) : 0}s / {Math.floor(duration)}s
             </div>
          </div>
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
  const [renderedThumbUrl, setRenderedThumbUrl] = useState<string | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<string | null>(null);
  const [socialCaptions, setSocialCaptions] = useState<SocialCaptions | null>(null);
  const [activeCaptionTab, setActiveCaptionTab] = useState<'tiktok' | 'instagram' | 'youtube'>('tiktok');
  
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) { logEndRef.current.scrollIntoView({ behavior: 'smooth' }); }
  }, [renderLogs]);

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
    } catch (e) { console.error(e); } 
    finally { setIsMagicFilling(false); }
  };

  const handleGenerateScripts = async () => {
    setIsGenerating(true);
    try {
      const ads = await generateAdScripts(formData.productName, formData.description, formData.tone, [
        "OMG you NEED to see this protein blend, it's a total game changer!",
        "Busy moms, listen up: this is how I stay energetic all day."
      ]);
      setResults(ads);
      setStep(2);
    } catch (e) { console.error(e); } 
    finally { setIsGenerating(false); }
  };

  const handleRenderAd = async () => {
    if (selectedAdIdx === null) return;
    setRenderProgress(1);
    setRenderStatus('Initializing Gemini Veo...');
    setRenderLogs(['[SYSTEM] Authenticating with Production Hub...', '[SYSTEM] Allocating 4K GPU Nodes...']);
    
    try {
      const selectedAd = results[selectedAdIdx];
      const logInterval = setInterval(() => {
        const fakeLogs = [
          "Synthesizing lighting environment...",
          "Mapping skin textures to actor persona...",
          "Syncing neural lip-motion with script data...",
          "Applying cinematic color grading (9:16)...",
          "Generating social distribution pack..."
        ];
        const log = fakeLogs[Math.floor(Math.random() * fakeLogs.length)];
        setRenderLogs(prev => [...prev, `[RENDER] ${log}`]);
        setRenderProgress(prev => Math.min(prev + 1, 98));
      }, 2500);

      // Parallelize asset generation
      const [videoUrl, thumbUrl, captions] = await Promise.all([
        generateVideo(selectedAd.script),
        generateThumbnail(formData.productName, selectedAd.hook),
        generateSocialCaptions(selectedAd.script)
      ]);

      clearInterval(logInterval);
      
      setRenderProgress(100);
      setRenderStatus('Production Complete');
      setRenderedVideoUrl(videoUrl);
      setRenderedThumbUrl(thumbUrl);
      setSocialCaptions(captions);
      
      setTimeout(() => setStep(3), 1200);
    } catch (e) {
      console.error(e);
      setRenderProgress(0);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setImageAnalysis("Processing visual context...");
      try {
        const analysis = await analyzeImage(base64);
        setImageAnalysis(analysis);
        setFormData(prev => ({ ...prev, description: prev.description + "\n\n[Visual Insight]: " + analysis }));
      } catch (e) { console.error(e); }
    };
    reader.readAsDataURL(file);
  };

  const downloadScript = () => {
    if (selectedAdIdx === null) return;
    const ad = results[selectedAdIdx];
    const content = `PRODUCT: ${formData.productName}\nHOOK: ${ad.hook}\nSCRIPT:\n${ad.script}\n\nDIRECTOR NOTES: ${ad.memoryNote}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.productName.replace(/\s+/g, '_')}_script.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto pb-32">
      {/* Immersive Step Navigation */}
      <div className="flex items-center justify-between mb-16 bg-white/50 backdrop-blur-xl p-4 rounded-3xl border border-slate-200 sticky top-4 z-40 shadow-xl shadow-slate-100/50">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
              <VideoCameraIcon className="w-6 h-6" />
           </div>
           <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">AI Studio <span className="text-indigo-600 font-bold ml-1">v1.0</span></h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Creator Account: @{user.username}</p>
           </div>
        </div>
        
        <div className="flex items-center gap-8 pr-4">
           <StepIndicator num={1} active={step >= 1} label="Creative Brief" />
           <div className="w-8 h-px bg-slate-200" />
           <StepIndicator num={2} active={step >= 2} label="Hook Select" />
           <div className="w-8 h-px bg-slate-200" />
           <StepIndicator num={3} active={step >= 3} label="Asset Pack" />
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-10 md:p-14 rounded-[4rem] border border-slate-100 shadow-2xl shadow-indigo-100/20">
               <div className="flex items-center justify-between mb-12">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Production Brief</h2>
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 text-[9px] font-black uppercase tracking-widest">
                     <BoltIcon className="w-3.5 h-3.5" />
                     Gemini 3 Pro Active
                  </div>
               </div>

               <div className="space-y-10">
                  <div className="relative group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Magic Auto-Fill (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="Paste Product URL (Amazon, Gumroad, Shopify...)" 
                      value={magicUrl}
                      onChange={(e) => setMagicUrl(e.target.value)}
                      className="w-full pl-8 pr-40 py-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:bg-white focus:ring-[12px] focus:ring-indigo-100/50 font-bold transition-all text-sm placeholder:text-slate-300"
                    />
                    <button 
                      onClick={handleMagicFill}
                      disabled={isMagicFilling}
                      className="absolute right-3 top-3 bottom-3 px-8 bg-slate-900 hover:bg-black text-white font-black text-[11px] rounded-[1.5rem] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                      {isMagicFilling ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Scrape Data'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Product Persona</label>
                        <input 
                          placeholder="e.g. HydroGlow Serum" 
                          className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-8 focus:ring-indigo-100/50 outline-none transition-all"
                          value={formData.productName}
                          onChange={(e) => setFormData({...formData, productName: e.target.value})}
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Ad Vibe</label>
                        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                           {['Energetic', 'Relatable', 'Luxe'].map(t => (
                             <button 
                               key={t}
                               onClick={() => setFormData({...formData, tone: t})}
                               className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.tone === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                             >
                               {t}
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Core Script Goals</label>
                     <textarea 
                        rows={4}
                        placeholder="What problem does this solve? What's the main hook?"
                        className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl font-bold focus:ring-8 focus:ring-indigo-100/50 outline-none transition-all resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                     />
                  </div>

                  <button 
                    onClick={handleGenerateScripts} 
                    disabled={isGenerating || !formData.productName}
                    className="w-full py-7 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-3xl transition-all shadow-2xl shadow-indigo-200 text-lg flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? <ArrowPathIcon className="w-7 h-7 animate-spin" /> : (
                      <>
                        <SparklesIcon className="w-7 h-7 text-white animate-pulse" />
                        Synthesize Creator Hooks
                      </>
                    )}
                  </button>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <PresentationChartLineIcon className="w-5 h-5" />
                   </div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Creative Intelligence</h3>
                </div>
                
                <FeatureSmall 
                  icon={<CpuChipIcon className="w-5 h-5" />} 
                  label="Performance Memory" 
                  desc="Gemini is analyzing your 3 past viral hooks for style replication." 
                />
                <FeatureSmall 
                  icon={<IdentificationIcon className="w-5 h-5" />} 
                  label="Context Engine" 
                  desc={imageAnalysis || groundingLinks.length > 0 ? "Sources locked and analyzed." : "Upload photos or paste URLs to feed the AI."} 
                  active={!!(imageAnalysis || groundingLinks.length > 0)}
                />

                <div className="pt-4">
                  <label className="cursor-pointer group block">
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    <div className="w-full py-5 bg-slate-50 hover:bg-slate-900 hover:text-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center transition-all group-hover:border-slate-900">
                       <PhotoIcon className="w-6 h-6 mb-2" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Inject Visual Reference</span>
                    </div>
                  </label>
                </div>
             </div>
             
             <div className="bg-indigo-600 rounded-[3rem] p-8 text-white shadow-2xl shadow-indigo-200 border border-indigo-500 overflow-hidden relative">
                <BeakerIcon className="w-32 h-32 absolute -bottom-8 -right-8 opacity-10" />
                <h4 className="text-xl font-black mb-4">4K Production Credits</h4>
                <p className="text-indigo-100 text-xs font-bold leading-relaxed mb-6">Your account is currently in Pro mode. 4 cinematic renders are available this billing cycle.</p>
                <div className="w-full h-2 bg-indigo-900/40 rounded-full overflow-hidden">
                   <div className="w-3/4 h-full bg-white shadow-[0_0_10px_white]"></div>
                </div>
                <div className="mt-4 text-center">
                   <span className="text-[9px] font-black uppercase tracking-widest text-indigo-200">3 of 4 Credits Remaining</span>
                </div>
             </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="text-center max-w-2xl mx-auto">
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Select Your Winning Hook</h2>
             <p className="text-slate-500 font-bold text-lg leading-relaxed">Our AI generated 3 unique storyboards. Choose the one that fits your brand aesthetic best.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {results.map((ad, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedAdIdx(idx)} 
                className={`relative cursor-pointer rounded-[3.5rem] overflow-hidden border-4 transition-all duration-500 group ${selectedAdIdx === idx ? 'border-indigo-600 scale-[1.05] shadow-[0_48px_96px_-24px_rgba(99,102,241,0.3)]' : 'border-white hover:border-slate-200 shadow-2xl shadow-slate-200/50'}`}
              >
                <div className="aspect-[9/16] bg-slate-900 relative">
                  <img src={`https://picsum.photos/seed/${idx + 1500}/400/700`} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[6s]" alt="Storyboard" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                  
                  <div className="absolute top-8 left-8 right-8 flex justify-between items-start">
                     <div className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-[9px] font-black text-white uppercase tracking-widest">Hook #{idx + 1}</div>
                     {idx === 0 && (
                       <div className="px-4 py-2 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/40 flex items-center gap-2">
                         <SparklesIcon className="w-3.5 h-3.5" />
                         AI Favorite
                       </div>
                     )}
                  </div>

                  <div className="absolute bottom-10 left-10 right-10">
                    <p className="text-white font-black text-2xl leading-tight tracking-tight mb-4">"{ad.hook}"</p>
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Persona: {ad.avatarName}</span>
                    </div>
                  </div>
                  
                  {selectedAdIdx === idx && (
                    <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in zoom-in duration-300">
                       <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl ring-8 ring-indigo-600/20">
                          <CheckCircleIcon className="w-12 h-12" />
                       </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedAdIdx !== null && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-top-12 duration-700">
               <div className="bg-white p-12 md:p-16 rounded-[4rem] border border-slate-100 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-12">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                           <ClipboardDocumentCheckIcon className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-slate-900 tracking-tight">Production Script</h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimized for 9:16 Retention</p>
                        </div>
                     </div>
                     <button className="p-4 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-colors">
                        <Square2StackIcon className="w-6 h-6" />
                     </button>
                  </div>

                  <p className="text-3xl font-bold text-slate-800 leading-tight italic mb-12">
                     "{results[selectedAdIdx].script}"
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                     <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">AI Director's Note</h4>
                        <p className="text-xs font-bold text-slate-600 leading-relaxed italic">{results[selectedAdIdx].memoryNote}</p>
                     </div>
                     <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Visual Rendering Map</h4>
                        <p className="text-xs font-bold text-slate-600 leading-relaxed italic">{results[selectedAdIdx].visualPrompt}</p>
                     </div>
                  </div>

                  <button 
                    onClick={handleRenderAd} 
                    className="w-full py-8 bg-slate-900 hover:bg-black text-white font-black text-xl rounded-[2rem] transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 group overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <SparklesIcon className="w-7 h-7 text-amber-400 group-hover:scale-110 transition-transform" />
                    Commence 4K Cloud Render
                  </button>
               </div>
            </div>
          )}
        </div>
      )}

      {renderProgress > 0 && step === 2 && (
        <div className="fixed inset-0 z-[200] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-12 animate-in fade-in duration-700">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
             <div className="text-center lg:text-left space-y-12">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl">
                   <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_15px_rgba(99,102,241,1)]"></div>
                   Hyper-Threaded Render Active
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">{renderStatus}</h2>
                <div className="space-y-6">
                   <div className="flex justify-between items-end mb-2">
                      <span className="text-6xl font-black text-white tabular-nums tracking-tighter">{renderProgress}%</span>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Finalizing Modality Sync</span>
                   </div>
                   <div className="h-4 bg-white/10 rounded-full overflow-hidden p-1">
                      <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_40px_rgba(99,102,241,1)] transition-all duration-700 relative" style={{ width: `${renderProgress}%` }}>
                         <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
                      </div>
                   </div>
                </div>
                <p className="text-slate-500 font-bold text-lg leading-relaxed max-w-md">Our neural engine is synthesizing cinematic assets, applying 4K color science, and mapping script data to high-fidelity actor performance.</p>
             </div>
             
             <div className="bg-black/50 border border-white/10 rounded-[3rem] p-10 font-mono text-[12px] text-emerald-500/70 h-[450px] overflow-hidden flex flex-col shadow-[0_64px_128px_-24px_rgba(0,0,0,1)] relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                   <CommandLineIcon className="w-5 h-5 text-slate-500" />
                   <span className="font-black text-slate-500 uppercase tracking-[0.3em] text-[10px]">Production Node Terminal v1.2</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pb-20">
                  {renderLogs.map((log, i) => (
                    <div key={i} className="animate-in slide-in-from-left-4 duration-500 flex items-start gap-4">
                       <span className="text-white/20 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                       <span className={log.includes('[SYSTEM]') ? 'text-indigo-400 font-bold' : ''}>{log}</span>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
             </div>
          </div>
        </div>
      )}

      {step === 3 && renderedVideoUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start animate-in zoom-in-95 duration-1000">
          <div className="lg:col-span-5 space-y-8">
             <VideoPlayer src={renderedVideoUrl} />
             
             <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <ChartPieIcon className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retention Forecast</h4>
                      <p className="text-sm font-black text-slate-900">92% Engagement Potential</p>
                   </div>
                </div>
                <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200">View Data</button>
             </div>
          </div>

          <div className="lg:col-span-7 space-y-12">
            <div className="bg-white p-12 md:p-16 rounded-[4rem] border border-slate-100 shadow-2xl">
              <div className="flex items-center gap-6 mb-12">
                 <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner">
                    <CloudArrowUpIcon className="w-8 h-8" />
                 </div>
                 <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Master Asset Pack</h2>
                    <p className="text-slate-500 font-bold text-lg">High-fidelity production complete and synced.</p>
                 </div>
              </div>

              {/* Asset Download Center */}
              <div className="mb-12 space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Download Center</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <a 
                      href={renderedVideoUrl} 
                      download={`${formData.productName.replace(/\s+/g, '_')}_master.mp4`}
                      className="flex items-center justify-between p-6 bg-slate-900 rounded-[2rem] group hover:bg-black transition-all"
                   >
                      <div className="flex items-center gap-4">
                         <VideoCameraIcon className="w-6 h-6 text-indigo-400" />
                         <div className="text-left">
                            <p className="text-white font-black text-sm">Video Master</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">4K MP4 Asset</p>
                         </div>
                      </div>
                      <ArrowDownTrayIcon className="w-5 h-5 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                   </a>

                   {renderedThumbUrl && (
                     <a 
                        href={renderedThumbUrl} 
                        download={`${formData.productName.replace(/\s+/g, '_')}_thumb.png`}
                        className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] group hover:border-indigo-600 transition-all shadow-sm"
                     >
                        <div className="flex items-center gap-4">
                           <PhotoIcon className="w-6 h-6 text-indigo-600" />
                           <div className="text-left">
                              <p className="text-slate-900 font-black text-sm">Thumbnail Pack</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">High-Res PNG</p>
                           </div>
                        </div>
                        <ArrowDownTrayIcon className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                     </a>
                   )}

                   <button 
                      onClick={downloadScript}
                      className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] group hover:border-indigo-600 transition-all shadow-sm"
                   >
                      <div className="flex items-center gap-4">
                         <DocumentArrowDownIcon className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                         <div className="text-left">
                            <p className="text-slate-900 font-black text-sm">Production Brief</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Script.txt file</p>
                         </div>
                      </div>
                      <ArrowDownTrayIcon className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                   </button>
                </div>
              </div>

              {socialCaptions && (
                <div className="space-y-8 mb-12 bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <SparklesIcon className="w-6 h-6 text-amber-500" />
                      <h4 className="font-black text-slate-900 text-xs uppercase tracking-[0.2em]">Distribution Copy Deck</h4>
                    </div>
                    <div className="flex gap-1.5 bg-slate-200 p-1.5 rounded-2xl">
                      {(['tiktok', 'instagram', 'youtube'] as const).map((platform) => (
                        <button 
                          key={platform}
                          onClick={() => setActiveCaptionTab(platform)}
                          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCaptionTab === platform ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4 min-h-[180px] animate-in slide-in-from-right-8 duration-500" key={activeCaptionTab}>
                    {socialCaptions[activeCaptionTab].map((cap, i) => (
                      <div key={i} className="group relative bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-600/30 transition-all shadow-sm">
                        <p className="text-sm font-bold text-slate-600 leading-relaxed pr-16">{cap}</p>
                        <button 
                          onClick={() => navigator.clipboard.writeText(cap)}
                          className="absolute right-4 bottom-4 p-3 bg-slate-900 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity active:scale-90 shadow-lg"
                        >
                          <Square2StackIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {socialCaptions.hashtags.map((tag, i) => (
                      <span key={i} className="px-4 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={() => { setStep(1); setRenderedVideoUrl(null); setRenderedThumbUrl(null); setSelectedAdIdx(null); setSocialCaptions(null); }} 
                className="w-full py-7 bg-white text-slate-400 font-black rounded-3xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 border border-slate-100 shadow-xl shadow-slate-100/50"
              >
                <ArrowUturnLeftIcon className="w-4 h-4" />
                Start New Session
              </button>
            </div>
            
            <div className="flex items-center gap-8 px-12">
               <div className="flex-1 h-px bg-slate-200"></div>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">End of Operation</p>
               <div className="flex-1 h-px bg-slate-200"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StepIndicator: React.FC<{ num: number, active: boolean, label: string }> = ({ num, active, label }) => (
  <div className={`flex items-center gap-3 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-30 scale-95'}`}>
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
      {num}
    </div>
    <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
  </div>
);

const FeatureSmall: React.FC<{ icon: React.ReactNode, label: string, desc: string, active?: boolean }> = ({ icon, label, desc, active }) => (
  <div className={`flex gap-5 items-start transition-all ${active ? 'opacity-100' : 'opacity-60'}`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
      {icon}
    </div>
    <div>
      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">{label}</h4>
      <p className="text-[10px] font-bold text-slate-400 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default CreateAd;
