"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Youtube, Mail, Sparkles, Loader2, BrainCircuit, Inbox, 
  SendHorizontal, File, Trash2, RefreshCw, History, MessageSquare, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('neural_yt_history');
    if (saved) setYtHistory(JSON.parse(saved));
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
    setIsLoadingEmails(true);
    try {
      const res = await fetch(`/api/emails?label=${label}`);
      const data = await res.json();
      setEmails(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); } finally { setIsLoadingEmails(false); }
  };

  const handleConnect = async () => {
    const res = await fetch('/api/gmail/auth');
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const handleAnalyze = async (content?: string, subject?: string) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    setYtData(null); 

    try {
      if (activeTab === 'youtube') {
        const videoId = ytUrl.split('v=')[1]?.split('&')[0] || ytUrl.split('/').pop();
        const response = await fetch(`/api/transcript?videoId=${videoId}`);
        
        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamBuffer = ""; 

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          streamBuffer += decoder.decode(value, { stream: true });
          const lines = streamBuffer.split("\n\n");
          streamBuffer = lines.pop() || "";

          for (const line of lines) {
            const cleanLine = line.replace(/^data: /, "").trim();
            if (!cleanLine) continue;

            try {
              const payload = JSON.parse(cleanLine);
              if (payload.done && payload.data) {
                // UPDATE DATA FIRST
                setYtData(payload.data);
                setAiAnalysis(payload.data.content);
                
                const newHistory = [{
                  videoId,
                  title: payload.data.title,
                  thumb: payload.data.displayThumb,
                  timestamp: new Date().getTime()
                }, ...ytHistory.filter(h => h.videoId !== videoId)].slice(0, 8);
                
                setYtHistory(newHistory);
                localStorage.setItem('neural_yt_history', JSON.stringify(newHistory));
                
                // STOP LOADING ONLY AFTER DATA IS SET
                setIsAnalyzing(false);
              }
            } catch (e) {
              console.log("Chunk incomplete...");
            }
          }
        }
      } else {
        const res = await fetch('/api/email-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: content, subject: subject })
        });
        const result = await res.json();
        setAiAnalysis(result.content);
        setYtData({ content: result.content }); 
        setIsAnalyzing(false);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setAiAnalysis("❌ NEURAL ERROR: Processing failed.");
      setIsAnalyzing(false);
    } 
    // Removed the 3000ms timeout from finally as it causes the UI to flicker back to skeleton
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
                onClick={() => { setActiveTab(tab); setAiAnalysis(null); setYtData(null); setIsAnalyzing(false); }}
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

                <AnimatePresence mode="wait">
                  {/* FIXED LOGIC: Show skeleton only if analyzing AND no data yet */}
                  {isAnalyzing && !ytData ? (
                    <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-4 bg-[#1f1f2e] p-6 rounded-[2.5rem] border border-white/5 h-fit space-y-4">
                        <Skeleton className="h-48 w-full rounded-2xl bg-white/10" />
                        <Skeleton className="h-6 w-3/4 bg-white/10" />
                      </div>
                      <div className="lg:col-span-8 bg-[#1f1f2e] p-10 rounded-[2.5rem] border border-white/5 space-y-6">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full bg-[#FC90AF]/20" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px] bg-white/10" />
                            <Skeleton className="h-4 w-[200px] bg-white/10" />
                          </div>
                        </div>
                        <div className="space-y-3 pt-4">
                          <Skeleton className="h-4 w-full bg-white/10" />
                          <Skeleton className="h-4 w-full bg-white/10" />
                          <Skeleton className="h-4 w-[80%] bg-white/10" />
                        </div>
                      </div>
                    </motion.div>
                  ) : ytData ? (
                    <YoutubeResults key="results" data={ytData} analysis={aiAnalysis} />
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2 text-gray-500">
                  <History size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Recent Scans</span>
                </div>
                <div className="space-y-2">
                  {ytHistory.map((item) => (
                    <div 
                      key={item.videoId}
                      onClick={() => setYtUrl(`https://www.youtube.com/watch?v=${item.videoId}`)}
                      className="bg-[#1f1f2e]/40 border border-white/5 p-3 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-[#FC90AF]/40 transition-all group"
                    >
                      <img src={item.thumb} className="w-12 h-8 rounded object-cover grayscale group-hover:grayscale-0" alt="thumb" />
                      <p className="text-[10px] font-bold truncate text-gray-400 group-hover:text-white">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'email' && (
          <div className="grid lg:grid-cols-12 gap-8 h-[750px]">
            <div className="lg:col-span-2 space-y-2">
                <Button onClick={handleConnect} variant="ghost" className="w-full justify-start text-[10px] font-black uppercase text-gray-500 hover:text-[#FC90AF]">
                    <RefreshCw size={14} className="mr-2" /> Reconnect
                </Button>
                {[{ id: 'inbox', icon: Inbox, label: 'Inbox' }, { id: 'sent', icon: SendHorizontal, label: 'Sent' }, { id: 'drafts', icon: File, label: 'Drafts' }, { id: 'trash', icon: Trash2, label: 'Trash' }].map(box => (
                    <button key={box.id} onClick={() => setActiveMailbox(box.id)} className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all ${activeMailbox === box.id ? "bg-[#FC90AF]/10 text-[#FC90AF]" : "text-gray-500 hover:bg-white/5"}`}>
                        <box.icon size={16} />
                        <span className="text-[11px] font-bold uppercase tracking-tight">{box.label}</span>
                    </button>
                ))}
            </div>

            <div className="lg:col-span-3 bg-[#1f1f2e]/50 border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden">
                <div className="p-5 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-600">Active Stream</div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {isLoadingEmails ? (
                        <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-gray-800" /></div>
                    ) : !isConnected ? (
                        <div className="p-4 text-center"><Button onClick={handleConnect} className="bg-[#FC90AF] text-black text-[10px] font-black">Link Gmail</Button></div>
                    ) : (
                        emails.map(email => (
                            <div key={email.id} onClick={() => { setSelectedEmail(email); setAiAnalysis(null); }} className={`p-4 rounded-2xl cursor-pointer border transition-all ${selectedEmail?.id === email.id ? "bg-[#FC90AF]/10 border-[#FC90AF]/20" : "bg-[#1f1f2e] border-transparent hover:border-white/5"}`}>
                                <h4 className="text-[11px] font-black uppercase line-clamp-1">{email.subject}</h4>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-6 overflow-hidden">
                <AnimatePresence mode="wait">
                    {selectedEmail ? (
                        <motion.div key={selectedEmail.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-6 overflow-hidden">
                            <div className="bg-[#1f1f2e] p-8 rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden">
                                <div className="flex justify-between items-start mb-6 shrink-0">
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter">{selectedEmail.subject}</h2>
                                    <Button onClick={() => handleAnalyze(selectedEmail.body, selectedEmail.subject)} disabled={isAnalyzing} className="bg-[#FC90AF] text-black text-[10px] font-black px-6 rounded-xl">
                                        {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles size={14} className="mr-2"/>} Analyze
                                    </Button>
                                </div>
                                <div className="flex-1 overflow-y-auto text-xs text-gray-400 p-6 rounded-[1.8rem] border border-white/5 bg-[#15151b]/40" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedEmail.body || selectedEmail.preview) }} />
                            </div>
                            {aiAnalysis && (
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-br from-[#FC90AF]/10 to-[#1f1f2e] p-8 rounded-[2.5rem] border border-[#FC90AF]/20">
                                    <p className="text-sm font-bold text-gray-200 italic">"{aiAnalysis}"</p>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="flex-1 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-700">
                             <Mail size={40} className="mb-4 opacity-10" />
                             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Select an email</span>
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

    // Manual styling map for Markdown tags
    const MarkdownComponents = {
        h1: ({node, ...props}: any) => <h1 className="text-xl font-black uppercase text-[#FC90AF] mt-6 mb-2 tracking-tighter" {...props} />,
        h2: ({node, ...props}: any) => <h2 className="text-lg font-bold text-[#FC90AF] mt-5 mb-2" {...props} />,
        h3: ({node, ...props}: any) => <h3 className="text-md font-bold text-white mt-4 mb-1" {...props} />,
        p: ({node, ...props}: any) => <p className="text-sm text-gray-300 leading-relaxed mb-4" {...props} />,
        ul: ({node, ...props}: any) => <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300 ml-2" {...props} />,
        ol: ({node, ...props}: any) => <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-300 ml-2" {...props} />,
        li: ({node, ...props}: any) => <li className="text-sm" {...props} />,
        strong: ({node, ...props}: any) => <strong className="font-bold text-white" {...props} />,
        code: ({node, ...props}: any) => <code className="bg-[#15151b] px-1.5 py-0.5 rounded text-[#FC90AF] font-mono text-xs" {...props} />,
        blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-[#FC90AF]/30 pl-4 italic text-gray-400 my-4" {...props} />,
    };

    const askFollowUp = async () => {
      if (!q.trim()) return;
      setIsAsking(true);
      try {
        const res = await fetch('/api/transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
                    <img src={data.displayThumb} className="w-full aspect-video rounded-2xl mb-4 object-cover shadow-2xl" alt="Video thumbnail" />
                    <h3 className="text-lg font-black uppercase italic tracking-tighter leading-tight">{data.title}</h3>
                </div>

                <div className="lg:col-span-8 bg-[#1f1f2e] p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                    {/* <div className="absolute -top-3 left-10 bg-[#FC90AF] text-black px-6 py-1.5 rounded-full text-[9px] font-black uppercase z-10">
                        Neural Summary
                    </div> */}
                    
                    <div className="relative z-0">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]} 
                            components={MarkdownComponents}
                        >
                            {analysis || ""}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>

            {/* Follow-up Section */}
            <div className="bg-[#1f1f2e]/50 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <MessageSquare size={16} className="text-[#FC90AF]" />
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Follow-up inquiry</span>
                </div>

                {answers.map((item, idx) => (
                    <div key={idx} className="space-y-2 border-l-2 border-[#FC90AF]/30 pl-4 mb-6">
                        <p className="text-[10px] font-black uppercase text-[#FC90AF]">Q: {item.q}</p>
                        <ReactMarkdown components={MarkdownComponents}>
                            {item.a}
                        </ReactMarkdown>
                    </div>
                ))}

                <div className="flex gap-2 bg-[#15151b] p-2 rounded-2xl border border-white/5">
                    <input 
                        className="flex-1 bg-transparent px-4 text-xs font-bold outline-none" 
                        placeholder="Ask a question..." 
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