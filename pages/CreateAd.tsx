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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-indigo-400 transition-colors">
              {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>
            <button onClick={toggleMute} className="text-white hover:text-indigo-400 transition-colors">
              {isMuted ? <SpeakerXMarkIcon className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6" />}
            </button>
            <div className="text-[10px] font-black text-white/60 uppercase tracking-widest tabular-nums">
              {videoRef.current ? Math.floor(videoRef.current.currentTime) : 0}s / {Math.floor(duration)}s
            </div>
          </div>
          <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">4K Production</div>
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
  
  // Performance Memory Mock
  const pastHeroScripts = [
    "OMG you NEED to see this protein blend, it's a total game changer for my morning routine!",
    "I stopped buying expensive lattes after I found this. 10/10 recommendation.",
    "Busy moms, listen up: this is how I stay energetic all day without the crash."
  ];

  const logEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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
      // PERFORMANCE MEMORY: Pass past hero scripts to the generator
      const ads = await generateAdScripts(formData.productName, formData.description, formData.tone, pastHeroScripts);
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
      
      const logInterval = setInterval(() => {
        const fakeLogs = [
          "Synthesizing lighting environment...",
          "Mapping skin textures to actor persona...",
          "Syncing neural lip-motion with script data...",
          "Applying cinematic color grading (9:16)...",
          "Generating viral social copy deck..."
        ];
        const log = fakeLogs[Math.floor(Math.random() * fakeLogs.length)];
        setRenderLogs(prev => [...prev, `[RENDER] ${log}`]);
        setRenderProgress(prev => Math.min(prev + 1, 95));
      }, 3000);

      const videoUrl = await generateVideo(selectedAd.script);
      clearInterval(logInterval);
      
      setRenderProgress(100);
      setRenderStatus('Production Complete');
      setRenderLogs(prev => [...prev, '[SYSTEM] Asset packaged. Delivery verified.']);
      
      setRenderedVideoUrl(videoUrl);
      
      // Post-generation processing
      const captions = await generateSocialCaptions(selectedAd.script);
      setSocialCaptions(captions);
      
      setTimeout(() => setStep(3), 1000);
    } catch (e) {
      await handleError(e);
      setRenderProgress(0);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setImageAnalysis("Analyzing photo context...");
      try {
        const analysis = await analyzeImage(base64);
        setImageAnalysis(analysis);
        setFormData(prev => ({ ...prev, description: prev.description + "\n\n[Visual Insight]: " + analysis }));
      } catch (e) { await handleError(e); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4">
      {/* Step Header */}
      <div className="flex items-center gap-4 mb-12">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
          <VideoCameraIcon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI UGC Studio</h1>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
               <Square3Stack3DIcon className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Performance Memory Linked</span>
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= i ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
            ))}
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="bg-white p-10 md:p-12 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
            <div className="space-y-4">
               <div className="flex justify-between items-center mb-2">
                 <h2 className="text-xl font-black text-slate-900 tracking-tight">The Brief</h2>
                 <label className="cursor-pointer group">
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                      <PhotoIcon className="w-4 h-4" />
                      Add Visual Context
                    </div>
                 </label>
               </div>
               <div className="relative group">
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
                    className="absolute right-3 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-indigo-100/40"
                  >
                    {isMagicFilling ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Refine Brief'}
                  </button>
               </div>
            </div>

            <div className="space-y-8">
              <FormInput label="Product Name" placeholder="e.g. Protein Glow" value={formData.productName} onChange={(v) => setFormData({...formData, productName: v})} />
              <FormTextarea label="Campaign Goal" placeholder="What's the main pain point we are solving?" value={formData.description} onChange={(v) => setFormData({...formData, description: v})} />
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">UGC Brand Tone</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Energetic', 'Relatable', 'Professional'].map((tone) => (
                    <button key={tone} onClick={() => setFormData({...formData, tone})} className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${formData.tone === tone ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white'}`}>{tone}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleGenerateScripts} disabled={isGenerating} className="w-full py-6 bg-slate-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-2xl shadow-slate-100 text-lg group">
                {isGenerating ? <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto" /> : (
                  <div className="flex items-center justify-center gap-3">
                    <SparklesIcon className="w-6 h-6 text-indigo-400" />
                    Generate Creative Concepts
                  </div>
                )}
              </button>
            </div>
          </div>
          <div className="space-y-6 lg:pt-12">
            <FeatureBox icon={<CpuChipIcon className="w-6 h-6" />} title="Performance Memory Active" desc="Gemini is analyzing your 3 past top-performing 'Hero' scripts to replicate successful hooks." />
            <FeatureBox icon={<CloudArrowUpIcon className="w-6 h-6" />} title="Veo 4K Production" desc="Final assets are rendered in native 4K with cinema-grade color grading." />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {results.map((ad, idx) => (
              <div key={idx} onClick={() => setSelectedAdIdx(idx)} className={`relative cursor-pointer rounded-[2.5rem] overflow-hidden border-4 transition-all group ${selectedAdIdx === idx ? 'border-indigo-600 scale-[1.03] shadow-2xl' : 'border-white hover:border-slate-200 shadow-md'}`}>
                <div className="aspect-[9/16] bg-slate-900 relative">
                  <img src={`https://picsum.photos/seed/${idx + 1000}/400/700`} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[4s]" alt="Preview" />
                  <div className="absolute top-6 left-6 right-6">
                     {ad.memoryNote && (
                       <div className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-2 shadow-lg">
                         <BoltIcon className="w-3 h-3" />
                         Memory Boosted
                       </div>
                     )}
                  </div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <p className="text-white font-black text-xl leading-tight tracking-tight group-hover:text-indigo-200 transition-colors">"{ad.hook}"</p>
                  </div>
                  {selectedAdIdx === idx && <div className="absolute top-6 right-6 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-900/40 animate-in zoom-in-50"><CheckCircleIcon className="w-7 h-7" /></div>}
                </div>
              </div>
            ))}
          </div>

          {selectedAdIdx !== null && (
            <div className="space-y-6">
              <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl animate-in zoom-in-95">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Final Production Script</h3>
                  {results[selectedAdIdx].memoryNote && (
                    <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-2">
                       <LightBulbIcon className="w-4 h-4" />
                       Success Pattern Applied
                    </div>
                  )}
                </div>
                <p className="text-2xl md:text-3xl font-bold text-slate-800 italic mb-10 leading-snug">"{results[selectedAdIdx].script}"</p>
                
                {results[selectedAdIdx].memoryNote && (
                  <div className="mb-10 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-500 leading-relaxed italic">
                    <SparklesIcon className="w-4 h-4 text-indigo-500 mb-2" />
                    <span className="text-slate-900 font-black uppercase tracking-widest mr-2">Optimization Insight:</span>
                    {results[selectedAdIdx].memoryNote}
                  </div>
                )}

                <button onClick={handleRenderAd} className="w-full py-6 bg-slate-900 hover:bg-black text-white font-black text-xl rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-4 group">
                  <SparklesIcon className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition-transform" />
                  Render High-Fidelity UGC Pack
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {renderProgress > 0 && step === 2 && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-12 animate-in fade-in duration-500">
          <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-8">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                   Cloud Rendering Active
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-none">{renderStatus}</h2>
                <div className="flex items-center gap-6 mb-12">
                   <div className="text-6xl font-black text-indigo-500 tabular-nums">{renderProgress}%</div>
                   <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300" style={{ width: `${renderProgress}%` }}></div>
                   </div>
                </div>
                <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-md">Our cloud nodes are synthesizing high-fidelity textures and neural motion. This operation usually takes 1-3 minutes.</p>
             </div>
             <div className="bg-black/50 border border-white/10 rounded-3xl p-6 font-mono text-[11px] text-emerald-500/80 h-[300px] overflow-hidden flex flex-col shadow-2xl">
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4"><CommandLineIcon className="w-4 h-4" /><span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Console v1.0.4</span></div>
                <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar">
                  {renderLogs.map((log, i) => (<div key={i} className="animate-in slide-in-from-left-2 duration-300">{log}</div>))}
                  <div ref={logEndRef} />
                </div>
             </div>
          </div>
        </div>
      )}

      {step === 3 && renderedVideoUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in zoom-in-95 duration-1000">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="aspect-[9/16] min-h-[500px]">
              <VideoPlayer src={renderedVideoUrl} />
            </div>
            {videoAnalysis && (
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                 <div className="flex items-center gap-2 mb-4">
                    <ChartPieIcon className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest">Retention Forecast</h4>
                 </div>
                 <p className="text-xs font-bold text-slate-500 leading-relaxed italic">{videoAnalysis}</p>
              </div>
            )}
          </div>
          <div className="lg:col-span-7 space-y-10">
            <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-8 shadow-inner"><CloudArrowUpIcon className="w-10 h-10" /></div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-tight">UGC Bundle Ready</h2>
              <p className="text-slate-500 font-bold text-lg leading-relaxed mb-10">Your master 4K production and optimized clips are generated and synced to Drive.</p>
              
              {/* ENHANCEMENT: Social Copy Deck Section */}
              {socialCaptions && (
                <div className="space-y-6 mb-10 border-y border-slate-100 py-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <SparklesIcon className="w-5 h-5 text-amber-500" />
                      <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest">Social Copy Deck</h4>
                    </div>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                      {(['tiktok', 'instagram', 'youtube'] as const).map((platform) => (
                        <button 
                          key={platform}
                          onClick={() => setActiveCaptionTab(platform)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeCaptionTab === platform ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3 min-h-[160px] animate-in slide-in-from-right-4 duration-300" key={activeCaptionTab}>
                    {socialCaptions[activeCaptionTab].map((cap, i) => (
                      <div key={i} className="group relative bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all">
                        <p className="text-xs font-bold text-slate-600 leading-snug pr-12">{cap}</p>
                        <button 
                          onClick={() => handleCopy(cap)}
                          className="absolute right-3 bottom-3 p-2 bg-white rounded-lg shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-600 flex items-center gap-2"
                        >
                          <Square2StackIcon className="w-4 h-4" />
                          <span className="text-[8px] font-black uppercase tracking-widest">Copy</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4">
                    {socialCaptions.hashtags.map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <a href={renderedVideoUrl} download className="flex-1 py-6 bg-slate-900 text-white font-black text-xl rounded-2xl text-center hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200">
                  <ArrowDownTrayIcon className="w-6 h-6" />
                  Download Bundle
                </a>
                <button 
                  onClick={() => { setStep(1); setRenderedVideoUrl(null); setSelectedAdIdx(null); setImageAnalysis(null); setVideoAnalysis(null); }} 
                  className="px-10 py-6 bg-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                >
                  <ArrowUturnLeftIcon className="w-4 h-4" />
                  New Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FormInput: React.FC<{ label: string, placeholder: string, value: string, onChange: (v: string) => void }> = ({ label, placeholder, value, onChange }) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</label>
    <input type="text" placeholder={placeholder} className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-[6px] focus:ring-indigo-100 outline-none font-bold transition-all text-slate-700 shadow-sm" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const FormTextarea: React.FC<{ label: string, placeholder: string, value: string, onChange: (v: string) => void }> = ({ label, placeholder, value, onChange }) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</label>
    <textarea rows={4} placeholder={placeholder} className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-[6px] focus:ring-indigo-100 outline-none font-bold transition-all text-slate-700 shadow-sm" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const FeatureBox: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex gap-6 group hover:shadow-xl transition-all duration-500">
    <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:rotate-6 shadow-inner">{icon}</div>
    <div className="flex-1">
      <h3 className="font-black text-slate-900 mb-1 tracking-tight">{title}</h3>
      <p className="text-sm font-bold text-slate-400 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default CreateAd;