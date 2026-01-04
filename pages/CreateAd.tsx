
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
  BoltIcon
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

  const takeScreenshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `vendo-screenshot-${Date.now()}.png`;
      link.click();
    }
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
            <button 
              onClick={takeScreenshot} 
              title="Capture Current Frame"
              className="text-white hover:text-emerald-400 transition-colors flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/20"
            >
              <CameraIcon className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Screenshot</span>
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
  const [isSmartDefaultActive, setIsSmartDefaultActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMagicFilling, setIsMagicFilling] = useState(false);
  const [magicUrl, setMagicUrl] = useState('');
  const [groundingLinks, setGroundingLinks] = useState<any[]>([]);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStatus, setRenderStatus] = useState('');
  const [renderLogs, setRenderLogs] = useState<string[]>([]);
  const [results, setResults] = useState<GeneratedAd[]>([]);
  const [selectedAdIdx, setSelectedAdIdx] = useState<number | null>(null);
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<string | null>(null);
  const [videoAnalysis, setVideoAnalysis] = useState<string | null>(null);
  const [baseVideoUrl, setBaseVideoUrl] = useState<string | null>(null);
  const [baseVideoAnalysis, setBaseVideoAnalysis] = useState<string | null>(null);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [socialCaptions, setSocialCaptions] = useState<SocialCaptions | null>(null);
  const [activeCaptionTab, setActiveCaptionTab] = useState<'tiktok' | 'instagram' | 'youtube'>('tiktok');
  
  // Thumbnail states
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const [generatedThumb, setGeneratedThumb] = useState<string | null>(null);

  // Performance Memory Mock
  const pastHeroScripts = [
    "OMG you NEED to see this protein blend, it's a total game changer for my morning routine!",
    "I stopped buying expensive lattes after I found this. 10/10 recommendation.",
    "Busy moms, listen up: this is how I stay energetic all day without the crash."
  ];

  // Refiner states
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  
  const logEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const mockVideoUrl = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

  // ENHANCEMENT: Smart Default for Product Brief
  useEffect(() => {
    if (formData.productName === '' && formData.description === '') {
      const savedTone = localStorage.getItem('vendo_last_tone');
      const mockLinks: LinkBlock[] = [
        { id: '1', title: 'Protein Powder', url: 'https://gumroad.com/sarah/protein', clicks: 1240, type: 'shop' },
        { id: '2', title: 'Yoga Mat', url: 'https://gumroad.com/sarah/yoga', clicks: 42, type: 'shop' },
      ];
      const topLink = [...mockLinks].sort((a, b) => b.clicks - a.clicks)[0];

      if (topLink) {
        setFormData({
          productName: topLink.title,
          description: `Shop this product that got ${topLink.clicks.toLocaleString()} clicks. Focus on making the ${topLink.title} experience relatable for busy people.`,
          tone: savedTone || 'Energetic'
        });
        setIsSmartDefaultActive(true);
      }
    }
  }, []);

  useEffect(() => {
    if (logEndRef.current) { logEndRef.current.scrollIntoView({ behavior: 'smooth' }); }
  }, [renderLogs]);

  const checkApiKey = async () => {
    if (typeof window.aistudio !== 'undefined') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) { await window.aistudio.openSelectKey(); }
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
      setIsSmartDefaultActive(false);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("Requested entity was not found")) {
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsMagicFilling(false);
    }
  };

  const handleRefine = async () => {
    if (selectedAdIdx === null || !refinementPrompt) return;
    setIsRefining(true);
    try {
      const currentScript = results[selectedAdIdx].script;
      const refinedText = await refineAdScript(currentScript, refinementPrompt);
      const updatedResults = [...results];
      updatedResults[selectedAdIdx] = {
        ...updatedResults[selectedAdIdx],
        script: refinedText
      };
      setResults(updatedResults);
      setRefinementPrompt('');
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("Requested entity was not found")) {
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateThumb = async () => {
    if (selectedAdIdx === null) return;
    setIsGeneratingThumb(true);
    try {
      const thumb = await generateThumbnail(formData.productName, results[selectedAdIdx].hook);
      setGeneratedThumb(thumb);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("Requested entity was not found")) {
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsGeneratingThumb(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setImageAnalysis("Analyzing photo...");
      try {
        const analysis = await analyzeImage(base64);
        setImageAnalysis(analysis);
        setFormData(prev => ({ ...prev, description: prev.description + "\n\n[Photo Context]: " + analysis }));
        setIsSmartDefaultActive(false);
      } catch (e: any) {
        console.error(e);
        if (e.message?.includes("Requested entity was not found")) {
          await window.aistudio.openSelectKey();
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (baseVideoUrl) URL.revokeObjectURL(baseVideoUrl);
    setBaseVideoUrl(URL.createObjectURL(file));
    
    setIsAnalyzingVideo(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setBaseVideoAnalysis("Analyzing base video structure...");
      try {
        const analysis = await analyzeBaseVideo(base64);
        setBaseVideoAnalysis(analysis);
        setFormData(prev => ({ 
          ...prev, 
          description: prev.description + "\n\n[Base Footage Insights]: " + analysis 
        }));
        setIsSmartDefaultActive(false);
      } catch (err: any) {
        console.error(err);
        setBaseVideoAnalysis("Analysis unavailable, but video is attached.");
        if (err.message?.includes("Requested entity was not found")) {
          await window.aistudio.openSelectKey();
        }
      } finally {
        setIsAnalyzingVideo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePlayTTS = async () => {
    if (selectedAdIdx === null || isSpeaking) return;
    setIsSpeaking(true);
    const script = results[selectedAdIdx].script;
    try {
      const base64Audio = await generateSpeech(script);
      if (base64Audio) {
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
        
        if (!audioContextRef.current) { audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }); }
        const ctx = audioContextRef.current;
        
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) { channelData[i] = dataInt16[i] / 32768.0; }
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(false);
        source.start();
      } else {
        setIsSpeaking(false);
      }
    } catch (e: any) {
      console.error(e);
      setIsSpeaking(false);
      if (e.message?.includes("Requested entity was not found")) {
        await window.aistudio.openSelectKey();
      }
    }
  };

  const handleGenerateScripts = async () => {
    await checkApiKey();
    setIsGenerating(true);
    setStep(2);
    
    localStorage.setItem('vendo_last_tone', formData.tone);

    try {
      const ads = await generateAdScripts(formData.productName, formData.description, formData.tone, pastHeroScripts);
      setResults(ads);
      setTimeout(() => setIsGenerating(false), 2000);
    } catch (e: any) {
      console.error(e);
      setIsGenerating(false);
      if (e.message?.includes("Requested entity was not found")) {
        await window.aistudio.openSelectKey();
      }
    }
  };

  const handleRenderAd = async () => {
    if (selectedAdIdx === null) return;
    await checkApiKey();
    setRenderProgress(1);
    setRenderStatus('Initializing Cloud GPU...');
    setRenderLogs(['[SYSTEM] Allocating VRAM...', '[SYSTEM] Connection established with Vendo Node-7']);
    
    const stages = [
      { p: 15, s: 'Crafting Dynamic Script...', log: '[MEMORY] Referencing past top-performing hook patterns...' },
      { p: 30, s: 'Selecting Optimal Persona...', log: '[MODEL] Persona matched with 98.4% confidence based on niche CTR history.' },
      { p: 45, s: 'Generating Environment...', log: '[GEN] Lighting: Studio Cinematic. Ambient: 4500K.' },
      { p: 65, s: 'Rendering AI Avatar...', log: '[IMAGE] Calling Gemini 2.5 Flash Image...' },
      { p: 85, s: 'Syncing Voice & Motion...', log: '[AUDIO] Neural voice synthesis synced with lipsync data.' },
      { p: 95, s: 'Post-Processing...', log: '[POST] Color grading for TikTok/IG color spaces...' },
      { p: 100, s: 'Success.', log: '[SYSTEM] UGC Pack ready for deployment.' }
    ];

    let idx = 0;
    const interval = setInterval(async () => {
      if (idx < stages.length) {
        const s = stages[idx];
        setRenderProgress(s.p);
        setRenderStatus(s.s);
        setRenderLogs(prev => [...prev, s.log]);
        if (s.p === 65) {
           try {
             const visualUrl = await generateAdVisual(results[selectedAdIdx].visualPrompt);
             setRenderedImage(visualUrl);
           } catch (e: any) {
             console.error(e);
             if (e.message?.includes("Requested entity was not found")) {
               await window.aistudio.openSelectKey();
             }
           }
        }
        idx++;
      } else {
        clearInterval(interval);
        setTimeout(async () => {
          setStep(3);
          setRenderProgress(0);
          if (renderedImage) {
            setVideoAnalysis("Analyzing retention potential...");
            try {
              const [analysis, captions] = await Promise.all([
                analyzeVideoContent(renderedImage.split(',')[1], results[selectedAdIdx].script),
                generateSocialCaptions(results[selectedAdIdx].script)
              ]);
              setVideoAnalysis(analysis);
              setSocialCaptions(captions);
            } catch (e: any) {
              console.error(e);
              if (e.message?.includes("Requested entity was not found")) {
                await window.aistudio.openSelectKey();
              }
            }
          }
        }, 800);
      }
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
          <VideoCameraIcon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-600">AI UGC Studio</h1>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-pulse">
               <Square3Stack3DIcon className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Brand Voice Synced</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
             <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= i ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                ))}
             </div>
             <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] ml-2">Phase {step}</p>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="bg-white p-10 md:p-12 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">The Product Brief</h2>
                   {isSmartDefaultActive && (
                     <div className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest animate-in slide-in-from-left-2 duration-300">
                        <BoltIcon className="w-3 h-3" />
                        Smart Default
                        <button onClick={() => { setFormData({productName: '', description: '', tone: 'Energetic'}); setIsSmartDefaultActive(false); }} className="hover:text-indigo-200">
                           <XMarkIcon className="w-2.5 h-2.5 ml-1" />
                        </button>
                     </div>
                   )}
                 </div>
                 <div className="flex gap-2">
                    <label className="cursor-pointer group">
                      <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                      <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                        <VideoCameraIcon className="w-4 h-4" />
                        Base Video
                      </div>
                    </label>
                    <label className="cursor-pointer group">
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                        <PhotoIcon className="w-4 h-4" />
                        Add Photo
                      </div>
                    </label>
                 </div>
               </div>

               <div className="relative group">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Paste Product URL (Magic Auto-Fill)" 
                    value={magicUrl}
                    onChange={(e) => setMagicUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleMagicFill()}
                    className="w-full pl-14 pr-32 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-[6px] focus:ring-indigo-100 font-bold transition-all text-sm placeholder:text-slate-400"
                  />
                  <button 
                    onClick={handleMagicFill}
                    disabled={!magicUrl || isMagicFilling}
                    className="absolute right-3 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-black text-[10px] rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-indigo-100/40 flex items-center gap-2"
                  >
                    {isMagicFilling ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                    Brief Me
                  </button>
               </div>

               {/* MANDATORY: Grounding links from Google Search */}
               {groundingLinks.length > 0 && (
                 <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <LinkIcon className="w-3 h-3" />
                     Research Sources
                   </p>
                   <div className="flex flex-wrap gap-2">
                     {groundingLinks.map((chunk, i) => chunk.web && (
                       <a key={i} href={chunk.web.uri} target="_blank" rel="noreferrer" className="px-3 py-1 bg-white border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                         {chunk.web.title || "Source"}
                       </a>
                     ))}
                   </div>
                 </div>
               )}
            </div>
            
            {(imageAnalysis || baseVideoAnalysis) && (
              <div className="space-y-4 animate-in fade-in duration-500">
                {baseVideoAnalysis && (
                  <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-[2rem] text-xs font-medium text-indigo-700 leading-relaxed italic relative">
                    <div className="flex items-center gap-2 mb-2 font-black uppercase tracking-widest text-[8px] text-indigo-400">
                      <SparklesIcon className="w-3.5 h-3.5" />
                      Footage Analysis
                    </div>
                    {baseVideoAnalysis}
                  </div>
                )}
                {imageAnalysis && (
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-[2rem] text-xs font-medium text-slate-700 leading-relaxed italic">
                    <div className="flex items-center gap-2 mb-2 font-black uppercase tracking-widest text-[8px] text-slate-400">
                      <PhotoIcon className="w-3.5 h-3.5" />
                      Visual Context
                    </div>
                    {imageAnalysis}
                  </div>
                )}
              </div>
            )}

            {baseVideoUrl && (
              <div className="rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-sm aspect-video bg-black relative animate-in zoom-in-95 duration-500 ring-1 ring-slate-100">
                <video src={baseVideoUrl} className="w-full h-full object-cover opacity-80" controls muted />
                <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                   Base Asset Attached
                </div>
              </div>
            )}

            <div className="space-y-8">
              <FormInput label="Product Name" placeholder="e.g. Protein Glow" value={formData.productName} onChange={(v) => { setFormData({...formData, productName: v}); setIsSmartDefaultActive(false); }} />
              <FormTextarea label="Target Pain Point" placeholder="Who is this for and why do they need it right now?" value={formData.description} onChange={(v) => { setFormData({...formData, description: v}); setIsSmartDefaultActive(false); }} />
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">UGC Brand Tone</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Energetic', 'Relatable', 'Professional'].map((tone) => (
                    <button key={tone} onClick={() => { setFormData({...formData, tone}); setIsSmartDefaultActive(false); }} className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${formData.tone === tone ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white'}`}>{tone}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleGenerateScripts} disabled={!formData.productName || !formData.description || isGenerating || isAnalyzingVideo} className="w-full py-6 bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white font-black rounded-2xl transition-all shadow-2xl shadow-slate-100 text-lg group flex items-center justify-center gap-3">
                {isGenerating || isAnalyzingVideo ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <SparklesIcon className="w-6 h-6 text-indigo-400" />}
                {isAnalyzingVideo ? 'Analyzing Base Asset...' : isGenerating ? 'Scripting...' : 'Generate Creative Options'}
              </button>
            </div>
          </div>
          <div className="space-y-6 lg:pt-12">
            <FeatureBox icon={<CpuChipIcon className="w-6 h-6" />} title="Performance Memory" desc="AI analyzed 3 hero assets to suggest hooks that previously drove +400 clicks." />
            <FeatureBox icon={<SparklesIcon className="w-6 h-6" />} title="Neural Actor Rendering" desc="Using high-fidelity AI to render personas that look and sound like real creators." />
            <FeatureBox icon={<CloudArrowUpIcon className="w-6 h-6" />} title="Direct Cloud Sync" desc="Automatically deliver 4K assets to your connected cloud storage in seconds." />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {isGenerating ? (
            <div className="bg-white p-24 rounded-[4rem] border border-slate-200 text-center shadow-sm">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 animate-bounce shadow-inner"><SparklesIcon className="w-10 h-10" /></div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Scripting Success...</h2>
              <div className="flex items-center justify-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-[10px]">
                 <LightBulbIcon className="w-4 h-4" />
                 Applying Performance Memory Patterns
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {results.map((ad, idx) => (
                  <div key={idx} onClick={() => setSelectedAdIdx(idx)} className={`relative cursor-pointer rounded-[2.5rem] overflow-hidden border-4 transition-all group ${selectedAdIdx === idx ? 'border-indigo-600 scale-[1.03] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)]' : 'border-white hover:border-slate-200 shadow-md'}`}>
                    <div className="aspect-[9/16] bg-slate-900 relative">
                      <img src={`https://picsum.photos/seed/${idx + 1012}/400/700`} alt="Creator" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[4s]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                      <div className="absolute top-6 left-6 right-6">
                         {ad.memoryNote && (
                           <div className="bg-indigo-600 text-white text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-4 delay-300">
                             <CheckCircleIcon className="w-3 h-3" />
                             {ad.memoryNote}
                           </div>
                         )}
                      </div>
                      <div className="absolute bottom-8 left-8 right-8">
                        <div className="bg-white/10 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full w-fit uppercase tracking-widest mb-3 border border-white/20">{ad.avatarName}</div>
                        <p className="text-white font-black text-xl leading-tight tracking-tight group-hover:text-indigo-200 transition-colors">"{ad.hook}"</p>
                      </div>
                      {selectedAdIdx === idx && <div className="absolute top-6 right-6 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-900/40 animate-in zoom-in-50 duration-300"><CheckCircleIcon className="w-7 h-7" /></div>}
                    </div>
                  </div>
                ))}
              </div>

              {selectedAdIdx !== null && (
                <div className="space-y-6">
                  <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Full Production Script</h3>
                      <div className="flex gap-4">
                        <button onClick={handlePlayTTS} disabled={isSpeaking} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-50 px-4 py-2 rounded-full transition-all">
                          {isSpeaking ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <SpeakerWaveIcon className="w-4 h-4" />}
                          Preview Voice
                        </button>
                        <button onClick={handleGenerateScripts} className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 px-4 py-2 rounded-full transition-all">
                          <ArrowPathIcon className="w-4 h-4" />
                          Shuffle Creative
                        </button>
                      </div>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-slate-800 italic leading-snug mb-12">"{results[selectedAdIdx].script}"</p>
                    
                    <div className="mb-12 border-t border-slate-100 pt-10">
                      <div className="flex items-center gap-2 mb-6">
                        <AdjustmentsHorizontalIcon className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Script Refiner</h4>
                      </div>
                      <div className="relative group">
                        <input 
                          type="text" 
                          placeholder="Nudge your script (e.g., 'Make it funnier', 'Focus on the price')" 
                          value={refinementPrompt}
                          onChange={(e) => setRefinementPrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                          className="w-full px-8 py-5 pr-40 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-[6px] focus:ring-indigo-100 font-bold transition-all text-sm placeholder:text-slate-300"
                        />
                        <button 
                          onClick={handleRefine}
                          disabled={!refinementPrompt || isRefining}
                          className="absolute right-3 top-2 bottom-2 px-6 bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white font-black text-[10px] rounded-xl uppercase tracking-widest transition-all flex items-center gap-2"
                        >
                          {isRefining ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PaperAirplaneIcon className="w-4 h-4" />}
                          Tweak Copy
                        </button>
                      </div>
                    </div>

                    <button onClick={handleRenderAd} className="w-full py-6 bg-slate-900 hover:bg-black text-white font-black text-xl rounded-2xl transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 group">
                      <SparklesIcon className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition-transform" />
                      Render AI UGC Pack
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {renderProgress > 0 && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-500">
          <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-8">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                   Cloud Rendering Active
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-none">{renderStatus}</h2>
                <div className="flex items-center gap-6 mb-12">
                   <div className="text-6xl font-black text-indigo-500 tabular-nums">{renderProgress}%</div>
                   <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-300 ease-out shadow-[0_0_30px_rgba(99,102,241,0.6)]" style={{ width: `${renderProgress}%` }}></div>
                   </div>
                </div>
                <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-md">Our distributed AI nodes are synthesizing your high-fidelity actor and post-processing the visual assets.</p>
             </div>
             <div className="bg-black/50 border border-white/10 rounded-3xl p-6 font-mono text-[11px] text-emerald-500/80 h-[300px] overflow-hidden flex flex-col shadow-2xl">
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4"><CommandLineIcon className="w-4 h-4" /><span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Render Console v1.0.4</span></div>
                <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar">{renderLogs.map((log, i) => (<div key={i} className="animate-in slide-in-from-left-2 duration-300"><span className="opacity-40">[{new Date().toLocaleTimeString([], { hour12: false })}]</span> {log}</div>))}<div ref={logEndRef} /></div>
             </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in zoom-in-95 duration-1000">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="aspect-[9/16] min-h-[500px]">
              <VideoPlayer src={mockVideoUrl} poster={renderedImage || undefined} />
            </div>
            
            {videoAnalysis && (
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex items-center gap-2 mb-4">
                    <ChartPieIcon className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest">Retention Insights</h4>
                 </div>
                 <p className="text-xs font-bold text-slate-500 leading-relaxed italic">{videoAnalysis}</p>
              </div>
            )}

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CameraIcon className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest">Social Thumbnails</h4>
                </div>
                {!generatedThumb && (
                  <button 
                    onClick={handleGenerateThumb}
                    disabled={isGeneratingThumb}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                  >
                    {isGeneratingThumb ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <SparklesIcon className="w-3 h-3" />}
                    Gen Thumbnails
                  </button>
                )}
              </div>
              
              {isGeneratingThumb && (
                <div className="aspect-video bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-3 border border-slate-100 animate-pulse">
                  <CameraIcon className="w-8 h-8 text-slate-200" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Crafting Hook Overlays...</p>
                </div>
              )}

              {generatedThumb && (
                <div className="space-y-4 animate-in zoom-in-95 duration-500">
                  <div className="relative group rounded-2xl overflow-hidden aspect-video shadow-lg ring-1 ring-slate-100">
                    <img src={generatedThumb} alt="Social Thumbnail" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <a href={generatedThumb} download="vendo-thumbnail.png" className="p-3 bg-white text-slate-900 rounded-full shadow-2xl hover:scale-110 transition-transform">
                          <ArrowDownTrayIcon className="w-5 h-5" />
                       </a>
                    </div>
                  </div>
                  <button onClick={() => setGeneratedThumb(null)} className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                    Regenerate Alternative
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-10">
            <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-8 shadow-inner"><CloudArrowUpIcon className="w-10 h-10" /></div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-tight">UGC Bundle Ready</h2>
              <p className="text-slate-500 font-bold text-lg leading-relaxed mb-10">Your master 4K production and optimized clips are generated and synced to Drive.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <AssetPill label="Master Clip (4K)" />
                <AssetPill label="TikTok Short (9:16)" />
              </div>

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
                          className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeCaptionTab === platform ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3 min-h-[160px] animate-in slide-in-from-right-4 duration-300" key={activeCaptionTab}>
                    {socialCaptions[activeCaptionTab].map((cap, i) => (
                      <div key={i} className="group relative bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all">
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="px-2 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-lg">
                              High CTR Pattern
                           </div>
                        </div>
                        <p className="text-sm font-bold text-slate-600 leading-snug pr-12 pt-2">{cap}</p>
                        <button 
                          onClick={() => navigator.clipboard.writeText(cap)}
                          className="absolute right-3 bottom-3 p-2 bg-white rounded-lg shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-600 flex items-center gap-2"
                        >
                          <Square2StackIcon className="w-4 h-4" />
                          <span className="text-[8px] font-black uppercase tracking-widest">Copy</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {socialCaptions.hashtags.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                        <HashtagIcon className="w-3 h-3 opacity-40" />
                        {tag.replace('#', '')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href={mockVideoUrl} 
                  download={`vendo-ugc-video-${Date.now()}.mp4`}
                  className="flex-1 py-6 bg-slate-900 text-white font-black text-xl rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                >
                  <ArrowDownTrayIcon className="w-6 h-6" />
                  Download Bundle
                </a>
                <button 
                  onClick={() => { 
                    setStep(1); 
                    setRenderedImage(null); 
                    setSelectedAdIdx(null); 
                    setImageAnalysis(null); 
                    setVideoAnalysis(null); 
                    if (baseVideoUrl) URL.revokeObjectURL(baseVideoUrl);
                    setBaseVideoUrl(null); 
                    setBaseVideoAnalysis(null); 
                    setIsAnalyzingVideo(false);
                    setFormData({ productName: '', description: '', tone: 'Energetic' });
                    setSocialCaptions(null);
                    setRefinementPrompt('');
                    setGeneratedThumb(null);
                    setGroundingLinks([]);
                  }} 
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
    <div className="flex-1"><h3 className="font-black text-slate-900 mb-1 tracking-tight">{title}</h3><p className="text-sm font-bold text-slate-400 leading-relaxed">{desc}</p></div>
  </div>
);

const AssetPill: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-3 bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-indigo-100 transition-colors group">
    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{label}</span>
  </div>
);

export default CreateAd;
