"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Youtube, Mail, Sparkles, Loader2, Copy, Printer, 
  BrainCircuit, Search, Inbox, SendHorizontal, File, 
  Trash2, RefreshCw, Link as LinkIcon, ChevronRight, PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DOMPurify from 'dompurify';

type TabType = 'youtube' | 'email';

export default function IntelligenceHub() {
  const [activeTab, setActiveTab] = useState<TabType>('youtube');
  const [activeMailbox, setActiveMailbox] = useState("inbox");
  
  // YouTube State
  const [ytUrl, setYtUrl] = useState('');
  const [ytData, setYtData] = useState<any>(null);

  // Email State
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  // AI/Loading State
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // --- 1. Connection & Data Fetching ---
  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (activeTab === 'email' && isConnected) {
      const labelMap: Record<string, string> = {
        'inbox': 'INBOX', 'sent': 'SENT', 'drafts': 'DRAFT', 'trash': 'TRASH'
      };
      fetchEmails(labelMap[activeMailbox] || 'INBOX');
    }
  }, [activeTab, activeMailbox, isConnected]);

  const checkConnection = async () => {
    try {
      const res = await fetch('/api/gmail/status');
      const data = await res.json();
      setIsConnected(data.isConnected);
    } catch (err) { console.error(err); }
  };

  const fetchEmails = async (label = 'INBOX') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/emails?label=${label}`);
      const data = await res.json();
      setEmails(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const handleConnect = async () => {
    const res = await fetch('/api/gmail/auth');
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  // --- 2. Neural Analysis (The AI Logic) ---
  const handleAnalyze = async (content?: string, subject?: string) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      if (activeTab === 'youtube') {
        const videoId = ytUrl.split('v=')[1]?.split('&')[0] || ytUrl.split('/').pop();
        const res = await fetch(`/api/transcript?videoId=${videoId}`);
        const result = await res.json();
        setYtData(result);
        setAiAnalysis(result.content);
      } else {
        // Send email body to your custom summary API
        const res = await fetch('/api/email-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: content, subject: subject })
        });
        const result = await res.json();
        setAiAnalysis(result.content);
      }
    } catch (err) {
      console.error("Analysis Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#15151b] text-white font-sans p-6 md:p-12 selection:bg-[#FC90AF]/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#FC90AF]/10 rounded-lg">
                    <BrainCircuit size={20} className="text-[#FC90AF]" />
                </div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Neural Intelligence Hub</p>
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Intelligence <span className="text-[#FC90AF]">Center</span></h1>
          </div>

          <div className="flex bg-[#1f1f2e] p-1.5 rounded-2xl border border-white/5">
            {(['youtube', 'email'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setAiAnalysis(null); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? "bg-[#FC90AF] text-black shadow-[0_0_15px_rgba(252,144,175,0.3)]" : "text-gray-500 hover:text-white"
                }`}
              >
                {tab === 'youtube' ? <Youtube size={14} /> : <Mail size={14} />}
                {tab}
              </button>
            ))}
          </div>
        </header>

        {/* --- YOUTUBE VIEW --- */}
        {activeTab === 'youtube' && (
          <section className="space-y-8">
            <div className="bg-[#1f1f2e] p-2 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row gap-2">
              <input 
                className="flex-1 pl-8 pr-6 py-6 bg-transparent outline-none text-sm font-bold placeholder:text-gray-700"
                placeholder="Paste YouTube link for neural extraction..."
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
              />
              <Button onClick={() => handleAnalyze()} disabled={isAnalyzing} className="md:w-64 py-8 bg-[#FC90AF] text-black font-black uppercase text-[11px] rounded-[1.8rem]">
                {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" size={16} />}
                Process Video
              </Button>
            </div>
            {ytData && <YoutubeResults data={ytData} analysis={aiAnalysis} />}
          </section>
        )}

        {/* --- EMAIL VIEW --- */}
        {activeTab === 'email' && (
          <div className="grid lg:grid-cols-12 gap-8 h-[750px]">
            {/* 1. Sidebar Folders */}
            <div className="lg:col-span-2 space-y-2">
                <Button onClick={handleConnect} variant="ghost" className="w-full justify-start text-[10px] font-black uppercase text-gray-500 hover:text-[#FC90AF]">
                    <RefreshCw size={14} className="mr-2" /> Reconnect
                </Button>
                {[
                    { id: 'inbox', icon: Inbox, label: 'Inbox' },
                    { id: 'sent', icon: SendHorizontal, label: 'Sent' },
                    { id: 'drafts', icon: File, label: 'Drafts' },
                    { id: 'trash', icon: Trash2, label: 'Trash' },
                ].map(box => (
                    <button 
                        key={box.id}
                        onClick={() => setActiveMailbox(box.id)}
                        className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all ${activeMailbox === box.id ? "bg-[#FC90AF]/10 text-[#FC90AF]" : "text-gray-500 hover:bg-white/5"}`}
                    >
                        <box.icon size={16} />
                        <span className="text-[11px] font-bold uppercase tracking-tight">{box.label}</span>
                    </button>
                ))}
            </div>

            {/* 2. Email List */}
            <div className="lg:col-span-3 bg-[#1f1f2e]/50 border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden">
                <div className="p-5 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-600">Active Stream</div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-gray-800" /></div>
                    ) : !isConnected ? (
                        <div className="p-4 text-center"><Button onClick={handleConnect} className="bg-[#FC90AF] text-black text-[10px] font-black">Link Gmail</Button></div>
                    ) : (
                        emails.map(email => (
                            <div 
                                key={email.id}
                                onClick={() => { setSelectedEmail(email); setAiAnalysis(null); }}
                                className={`p-4 rounded-2xl cursor-pointer border transition-all ${selectedEmail?.id === email.id ? "bg-[#FC90AF]/10 border-[#FC90AF]/20" : "bg-[#1f1f2e] border-transparent hover:border-white/5"}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] font-black text-[#FC90AF] uppercase truncate w-24">{email.sender.split('<')[0]}</span>
                                    <span className="text-[8px] text-gray-700 font-bold">{email.time.split(',')[0]}</span>
                                </div>
                                <h4 className="text-[11px] font-black uppercase line-clamp-1 leading-tight">{email.subject}</h4>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 3. Detailed Reader & AI Summary */}
            <div className="lg:col-span-7 flex flex-col gap-6 overflow-hidden">
                <AnimatePresence mode="wait">
                    {selectedEmail ? (
                        <motion.div key={selectedEmail.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col gap-6 overflow-hidden">
                            {/* Header & Body Container */}
                            <div className="bg-[#1f1f2e] p-8 rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden">
                                <div className="flex justify-between items-start mb-6 shrink-0">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase text-[#FC90AF] tracking-widest">Selected Message</span>
                                        <h2 className="text-xl font-black italic uppercase tracking-tighter leading-tight">{selectedEmail.subject}</h2>
                                    </div>
                                    <Button 
                                        onClick={() => handleAnalyze(selectedEmail.body, selectedEmail.subject)} 
                                        disabled={isAnalyzing}
                                        className="bg-[#FC90AF] text-black text-[10px] font-black uppercase h-10 px-6 rounded-xl shrink-0"
                                    >
                                        {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles size={14} className="mr-2"/>}
                                        Analyze
                                    </Button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto text-xs text-gray-400 leading-relaxed font-medium bg-[#15151b]/40 p-6 rounded-[1.8rem] border border-white/5 custom-scrollbar shadow-inner" 
                                     dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedEmail.body || selectedEmail.preview) }} />
                            </div>

                            {/* AI Summary Panel */}
                            {aiAnalysis && (
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-br from-[#FC90AF]/10 to-[#1f1f2e] p-8 rounded-[2.5rem] border border-[#FC90AF]/20 shadow-xl">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles size={16} className="text-[#FC90AF]" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC90AF]">Neural Summary</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-200 leading-relaxed italic">"{aiAnalysis}"</p>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="flex-1 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-700">
                             <Mail size={40} className="mb-4 opacity-10" />
                             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Select an email for neural reflection</span>
                        </div>
                    )}
                </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function YoutubeResults({ data, analysis }: { data: any, analysis: string | null }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 bg-[#1f1f2e] p-6 rounded-[2.5rem] border border-white/5 h-fit">
                <div className="relative rounded-2xl overflow-hidden mb-4 aspect-video shadow-2xl">
                    <img src={data.displayThumb} className="w-full h-full object-cover" alt="Video Thumb" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#15151b] via-transparent to-transparent" />
                </div>
                <h3 className="text-lg font-black uppercase italic tracking-tighter leading-tight">{data.title}</h3>
                <div className="flex gap-2 mt-4">
                    <span className="text-[8px] font-black uppercase bg-white/5 px-3 py-1 rounded text-gray-500">Video Extraction</span>
                </div>
            </div>
            <div className="lg:col-span-8 bg-[#1f1f2e] p-10 rounded-[2.5rem] border border-white/5 relative shadow-2xl">
                <div className="absolute -top-3 left-10 bg-[#FC90AF] text-black px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Verified Synopsis</div>
                <div className="text-gray-400 text-sm font-medium leading-relaxed whitespace-pre-wrap">{analysis}</div>
            </div>
        </motion.div>
    );
}