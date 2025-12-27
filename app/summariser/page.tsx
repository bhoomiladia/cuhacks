"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Youtube, Mail, Sparkles, Loader2, BrainCircuit, Inbox, 
  SendHorizontal, File, Trash2, RefreshCw, History, MessageSquare, Send
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
  const [ytHistory, setYtHistory] = useState<any[]>([]);

  // Email State
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  // AI/Loading State
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // --- 1. Persisted History & Connection ---
  useEffect(() => {
    const saved = localStorage.getItem('neural_yt_history');
    if (saved) setYtHistory(JSON.parse(saved));
    checkConnection();
  }, []);

  // Fix: Explicitly calling fetchEmails when tab or mailbox changes
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

  // --- 2. Neural Analysis ---
  const handleAnalyze = async (content?: string, subject?: string) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      if (activeTab === 'youtube') {
        const videoId = ytUrl.split('v=')[1]?.split('&')[0] || ytUrl.split('/').pop();
        const res = await fetch(`/api/transcript?videoId=${videoId}`);
        
        if (!res.ok) throw new Error("Neural reset/500");
        
        const result = await res.json();
        setYtData(result);
        setAiAnalysis(result.content);

        // Save to History
        const newHistory = [{
          videoId,
          title: result.title,
          thumb: result.displayThumb,
          timestamp: new Date().getTime()
        }, ...ytHistory.filter(h => h.videoId !== videoId)].slice(0, 8);
        
        setYtHistory(newHistory);
        localStorage.setItem('neural_yt_history', JSON.stringify(newHistory));
      } else {
        const res = await fetch('/api/email-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: content, subject: subject })
        });
        const result = await res.json();
        setAiAnalysis(result.content);
      }
    } catch (err) {
      setAiAnalysis("❌ NEURAL ERROR: Transcript too long or restricted. Try a shorter video.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#15151b] text-white font-sans p-6 md:p-12 selection:bg-[#FC90AF]/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
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

        {activeTab === 'youtube' && (
          <section className="space-y-8">
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-[#1f1f2e] p-2 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row gap-2">
                  <input 
                    className="flex-1 pl-8 pr-6 py-6 bg-transparent outline-none text-sm font-bold placeholder:text-gray-700"
                    placeholder="Paste YouTube link..."
                    value={ytUrl}
                    onChange={(e) => setYtUrl(e.target.value)}
                  />
                  <Button onClick={() => handleAnalyze()} disabled={isAnalyzing} className="md:w-64 py-8 bg-[#FC90AF] text-black font-black uppercase text-[11px] rounded-[1.8rem]">
                    {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" size={16} />}
                    Process Video
                  </Button>
                </div>
                {ytData && <YoutubeResults data={ytData} analysis={aiAnalysis} />}
              </div>

              {/* HISTORY LIST */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2 text-gray-500">
                  <History size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Recent Neural Scans</span>
                </div>
                <div className="space-y-2">
                  {ytHistory.map((item) => (
                    <div 
                      key={item.videoId}
                      onClick={() => setYtUrl(`https://www.youtube.com/watch?v=${item.videoId}`)}
                      className="bg-[#1f1f2e]/40 border border-white/5 p-3 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-[#FC90AF]/40 transition-all group"
                    >
                      <img src={item.thumb} className="w-12 h-8 rounded object-cover grayscale group-hover:grayscale-0 transition-all" />
                      <p className="text-[10px] font-bold truncate text-gray-400 group-hover:text-white">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- EMAIL VIEW (UNCHANGED PER REQUEST) --- */}
        {activeTab === 'email' && (
          <div className="grid lg:grid-cols-12 gap-8 h-[750px]">
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

            <div className="lg:col-span-7 flex flex-col gap-6 overflow-hidden">
                <AnimatePresence mode="wait">
                    {selectedEmail ? (
                        <motion.div key={selectedEmail.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col gap-6 overflow-hidden">
                            <div className="bg-[#1f1f2e] p-8 rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden">
                                <div className="flex justify-between items-start mb-6 shrink-0">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase text-[#FC90AF] tracking-widest">Selected Message</span>
                                        <h2 className="text-xl font-black italic uppercase tracking-tighter leading-tight">{selectedEmail.subject}</h2>
                                    </div>
                                    <Button onClick={() => handleAnalyze(selectedEmail.body, selectedEmail.subject)} disabled={isAnalyzing} className="bg-[#FC90AF] text-black text-[10px] font-black uppercase h-10 px-6 rounded-xl shrink-0">
                                        {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles size={14} className="mr-2"/>} Analyze
                                    </Button>
                                </div>
                                <div className="flex-1 overflow-y-auto text-xs text-gray-400 leading-relaxed font-medium bg-[#15151b]/40 p-6 rounded-[1.8rem] border border-white/5 custom-scrollbar shadow-inner" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedEmail.body || selectedEmail.preview) }} />
                            </div>
                            {aiAnalysis && (
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-br from-[#FC90AF]/10 to-[#1f1f2e] p-8 rounded-[2.5rem] border border-[#FC90AF]/20 shadow-xl">
                                    <div className="flex items-center gap-2 mb-4"><Sparkles size={16} className="text-[#FC90AF]" /><span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FC90AF]">Neural Summary</span></div>
                                    <p className="text-sm font-bold text-gray-200 leading-relaxed italic">"{aiAnalysis}"</p>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="flex-1 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-700">
                             <Mail size={40} className="mb-4 opacity-10" /><span className="text-[10px] font-black uppercase tracking-[0.3em]">Select an email for neural reflection</span>
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

function YoutubeResults({ data, analysis }: { data: any, analysis: string | null }) {
    const [q, setQ] = useState('');
    const [answers, setAnswers] = useState<{q: string, a: string}[]>([]);
    const [isAsking, setIsAsking] = useState(false);

    const askFollowUp = async () => {
      if (!q.trim()) return;
      setIsAsking(true);
      try {
        const res = await fetch('/api/transcript', {
          method: 'POST',
          body: JSON.stringify({ question: q, transcript: data.rawTranscript })
        });
        const result = await res.json();
        setAnswers([...answers, { q, a: result.answer }]);
        setQ('');
      } catch (err) { console.error(err); } finally { setIsAsking(false); }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 bg-[#1f1f2e] p-6 rounded-[2.5rem] border border-white/5 h-fit">
                  <div className="relative rounded-2xl overflow-hidden mb-4 aspect-video shadow-2xl">
                      <img src={data.displayThumb} className="w-full h-full object-cover" alt="Video Thumb" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#15151b] via-transparent to-transparent" />
                  </div>
                  <h3 className="text-lg font-black uppercase italic tracking-tighter leading-tight">{data.title}</h3>
              </div>
              <div className="lg:col-span-8 bg-[#1f1f2e] p-10 rounded-[2.5rem] border border-white/5 relative shadow-2xl">
                  <div className="absolute -top-3 left-10 bg-[#FC90AF] text-black px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Verified Synopsis</div>
                  <div className="text-gray-400 text-sm font-medium leading-relaxed whitespace-pre-wrap">{analysis}</div>
              </div>
            </div>

            {/* Follow up UI */}
            <div className="bg-[#1f1f2e]/50 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={16} className="text-[#FC90AF]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Deep Inquiry</span>
              </div>
              {answers.map((item, idx) => (
                <div key={idx} className="space-y-2 border-l-2 border-[#FC90AF]/30 pl-4 py-2">
                  <p className="text-[10px] font-black uppercase text-[#FC90AF]">Q: {item.q}</p>
                  <p className="text-sm text-gray-300 italic">{item.a}</p>
                </div>
              ))}
              <div className="flex gap-2 bg-[#15151b] p-2 rounded-2xl border border-white/5">
                <input 
                  className="flex-1 bg-transparent outline-none px-4 text-xs font-bold" 
                  placeholder="Ask a follow-up question about this video..." 
                  value={q} 
                  onChange={e => setQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && askFollowUp()}
                />
                <Button onClick={askFollowUp} disabled={isAsking} className="bg-[#FC90AF] text-black px-4 h-10 rounded-xl">
                  {isAsking ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                </Button>
              </div>
            </div>
        </motion.div>
    );
}