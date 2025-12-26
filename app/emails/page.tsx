"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, Mail, Send, ChevronLeft, ChevronRight, Home, 
  Users, Settings, LogOut, CheckSquare, Plus, 
  Inbox, Star, SendHorizontal, File, Trash2, 
  X, Paperclip, Sparkles, Reply, ArrowLeft, Archive, Link as LinkIcon, RefreshCw
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {Sidebar} from "@/components/Sidebar"
import DOMPurify from 'dompurify';

export default function EmailsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true) // Left Global
  const [isMailOpen, setIsMailOpen] = useState(false) // The "Half Open" toggle
  const [activeTab, setActiveTab] = useState("inbox")
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    checkConnection();
    
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
        window.history.replaceState({}, '', '/emails');
        checkConnection();
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
        const labelMap: Record<string, string> = {
            'inbox': 'INBOX',
            'sent': 'SENT',
            'drafts': 'DRAFT',
            'trash': 'TRASH'
        };
        fetchEmails(labelMap[activeTab] || 'INBOX');
    }
  }, [activeTab, isConnected]);

  const checkConnection = async () => {
    try {
        const res = await fetch('/api/gmail/status');
        const data = await res.json();
        setIsConnected(data.isConnected);
        if (!data.isConnected) {
            setIsLoading(false);
        }
    } catch (err) {
        console.error(err);
        setIsLoading(false);
    }
  };

  const fetchEmails = async (label = 'INBOX') => {
    setIsLoading(true);
    try {
        const res = await fetch(`/api/emails?label=${label}`);
        const data = await res.json();
        if (Array.isArray(data)) {
            setEmails(data);
        } else {
            setEmails([]);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
        const res = await fetch('/api/gmail/auth');
        const data = await res.json();
        if (data.url) {
            window.location.href = data.url;
        }
    } catch (err) {
        console.error(err);
    }
  };

  const handleSendEmail = async () => {
    if (!composeTo || !composeSubject || !composeBody) return;
    setIsSending(true);
    try {
        const res = await fetch('/api/emails/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: composeTo,
                subject: composeSubject,
                body: composeBody
            })
        });
        if (res.ok) {
            setIsComposeOpen(false);
            setComposeTo("");
            setComposeSubject("");
            setComposeBody("");
            // Refresh inbox if needed or show success toast
            if (activeTab === 'sent') {
                fetchEmails('SENT');
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsSending(false);
    }
  };

  const handleEmailClick = (email: any) => {
    setSelectedEmail(email)
    setIsMailOpen(true)
  }

  return (
    <div className="flex h-screen bg-[#15151b] overflow-hidden text-white font-sans selection:bg-[#FC90AF]/30">
      
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}/>

      {/* 2. MAIN CONTENT AREA (Flex container for List + Half-Open Reading Pane) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* EMAIL LIST COLUMN */}
        <motion.div 
          animate={{ width: isMailOpen ? "40%" : "100%" }}
          className="h-full flex flex-col bg-[#15151b] border-r border-white/5"
        >
          <header className="p-8 pb-4">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2">
                 <h1 className="text-3xl font-black italic uppercase tracking-tighter">Inbox</h1>
                 <Button onClick={handleConnect} variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:text-white" title="Reconnect Gmail">
                   <RefreshCw size={14} />
                 </Button>
               </div>
               {isMailOpen && <Button onClick={() => setIsMailOpen(false)} variant="ghost" className="text-gray-500 hover:text-white"><X size={18}/></Button>}
            </div>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
              <input placeholder="Search..." className="w-full bg-[#1f1f2e] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#FC90AF]/30" />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <p className="text-gray-500 text-sm">Loading...</p>
                </div>
            ) : !isConnected ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <p className="text-gray-400 text-sm">Connect your Gmail account to view emails.</p>
                    <Button onClick={handleConnect} className="bg-[#FC90AF] text-black font-bold">
                        <LinkIcon className="mr-2 h-4 w-4" /> Connect Account
                    </Button>
                </div>
            ) : emails.length === 0 ? (
                <div className="text-center text-gray-500 mt-10 text-sm">No emails found.</div>
            ) : (
                emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => handleEmailClick(email)}
                    className={`p-5 mb-1 rounded-2xl cursor-pointer transition-all border ${selectedEmail?.id === email.id ? 'bg-[#FC90AF]/10 border-[#FC90AF]/20' : 'hover:bg-white/[0.03] border-transparent'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className={`text-[10px] uppercase tracking-widest ${email.unread ? 'text-[#FC90AF] font-black' : 'text-gray-500 font-bold'}`}>{email.sender}</p>
                      <span className="text-[10px] text-gray-700 font-bold">{email.time}</span>
                    </div>
                    <h4 className={`text-sm truncate ${email.unread ? 'text-white font-bold' : 'text-gray-400'}`}>{email.subject}</h4>
                    {!isMailOpen && <p className="text-[11px] text-gray-600 line-clamp-1 mt-1">{email.preview}</p>}
                  </div>
                ))
            )}
          </div>
        </motion.div>

        {/* HALF-OPEN READING PANE */}
        <AnimatePresence>
          {isMailOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "60%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-full bg-[#23232f] flex flex-col overflow-hidden"
            >
              <header className="px-8 py-5 border-b border-white/5 flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" className="h-9 w-9 p-0 border-white/10 bg-white/5 rounded-lg text-gray-400"><Archive size={16}/></Button>
                  <Button variant="outline" className="h-9 w-9 p-0 border-white/10 bg-white/5 rounded-lg text-gray-400"><Trash2 size={16}/></Button>
                </div>
                <Button className="h-9 bg-[#a855f7] hover:bg-[#9333ea] text-white rounded-lg text-[10px] font-black uppercase px-4 gap-2">
                   <Sparkles size={14}/> Summarize
                </Button>
              </header>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <h2 className="text-3xl font-black mb-6 italic uppercase tracking-tighter leading-tight">
                  {selectedEmail?.subject}
                </h2>
                
                <div className="flex items-center gap-4 mb-8">
                  <Avatar className="w-10 h-10 rounded-xl border border-white/10"><AvatarImage src="https://github.com/shadcn.png" /></Avatar>
                  <div className="flex-1">
                    <p className="font-black text-sm uppercase">{selectedEmail?.sender}</p>
                    <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">{selectedEmail?.time}</p>
                  </div>
                </div>

                <div 
                  className="text-gray-300 leading-relaxed text-sm space-y-6"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedEmail?.body || '') }}
                />
              </div>

              <div className="p-8 border-t border-white/5">
                <div className="flex gap-3">
                  <Button className="flex-1 bg-[#FC90AF] text-black rounded-xl h-12 font-black uppercase text-xs tracking-widest">Reply</Button>
                  <Button variant="outline" className="flex-1 border-white/10 bg-white/5 rounded-xl h-12 font-black uppercase text-xs text-gray-400">Forward</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. RIGHT FOLDERS SIDEBAR */}
      <aside className="w-64 bg-[#15151b] border-l border-white/5 flex flex-col p-6">
        <Button onClick={() => setIsComposeOpen(true)} className="bg-[#FC90AF] hover:bg-[#f985a6] text-black rounded-2xl py-6 mb-8 gap-2 font-black uppercase text-xs tracking-widest shadow-lg shadow-[#FC90AF]/10">
          <Plus size={18} /> Compose
        </Button>

        <div className="space-y-1">
          <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 px-4 font-mono">Mailboxes</h3>
          {[
            { id: "inbox", icon: Inbox, label: "Inbox", count: emails.length || null },
            { id: "sent", icon: SendHorizontal, label: "Sent", count: null },
            { id: "drafts", icon: File, label: "Drafts", count: 2 },
            { id: "trash", icon: Trash2, label: "Trash", count: null },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? "bg-[#FC90AF]/10 text-[#FC90AF]" : "text-gray-400 hover:bg-white/5"}`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </div>
              {item.count && <span className="text-[10px] font-black">{item.count}</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* 4. COMPOSE MODAL */}
      <AnimatePresence>
        {isComposeOpen && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 right-72 w-[450px] bg-[#23232f] rounded-t-[2rem] border-t border-x border-white/10 shadow-2xl z-[100] overflow-hidden"
          >
            <div className="bg-[#15151b] p-4 flex justify-between items-center border-b border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">New Message</span>
              <button onClick={() => setIsComposeOpen(false)} className="text-gray-600 hover:text-white"><X size={18}/></button>
            </div>
            <div className="flex flex-col">
              <input 
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="To" 
                className="bg-transparent border-b border-white/5 px-6 py-4 text-xs outline-none" 
              />
              <input 
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Subject" 
                className="bg-transparent border-b border-white/5 px-6 py-4 text-xs outline-none" 
              />
              <textarea 
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Write message..." 
                className="bg-transparent px-6 py-6 text-sm outline-none h-64 resize-none custom-scrollbar"
              />
            </div>
            <div className="p-6 bg-[#15151b]/50 flex justify-between items-center">
              <Button onClick={handleSendEmail} disabled={isSending} className="bg-[#FC90AF] text-black rounded-xl px-8 font-black uppercase text-[10px]">
                {isSending ? 'Sending...' : 'Send'}
              </Button>
              <Paperclip size={18} className="text-gray-600" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
