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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const Editor = ({ initialContent, onChange }: { initialContent: string, onChange: (html: string) => void }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (ref.current) {
        ref.current.innerHTML = initialContent;
    }
  }, []); // Only on mount

  return (
    <div
      ref={ref}
      contentEditable
      className="bg-transparent px-6 py-6 text-sm outline-none h-64 resize-none custom-scrollbar overflow-y-auto"
      onInput={(e) => onChange(e.currentTarget.innerHTML)}
    />
  );
};

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
  const [draftId, setDraftId] = useState(0);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendEmail = async () => {
    if (!composeTo || !composeSubject || !composeBody) return;
    setIsSending(true);
    try {
        const processedAttachments = await Promise.all(
            attachments.map(async (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                         const result = reader.result as string;
                         const base64 = result.split(',')[1];
                         resolve({
                             filename: file.name,
                             content: base64,
                             contentType: file.type
                         });
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            })
        );

        const res = await fetch('/api/emails/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: composeTo,
                subject: composeSubject,
                body: composeBody,
                attachments: processedAttachments
            })
        });
        if (res.ok) {
            setIsComposeOpen(false);
            setComposeTo("");
            setComposeSubject("");
            setComposeBody("");
            setAttachments([]);
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

  const handleDelete = async () => {
    if (!selectedEmail) return;
    try {
      const res = await fetch(`/api/emails/${selectedEmail.id}/trash`, { method: 'POST' });
      if (res.ok) {
        setEmails(prev => prev.filter(e => e.id !== selectedEmail.id));
        setIsMailOpen(false);
        setSelectedEmail(null);
      } else {
        console.error('Failed to delete email');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = () => {
    if (!selectedEmail) return;
    // Attempt to extract email from "Name <email>" format if possible, otherwise use full string
    const sender = selectedEmail.sender || '';
    setComposeTo(sender);
    setComposeSubject(selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`);
    const originalBody = selectedEmail.body || selectedEmail.preview || '';
    const cleanBody = DOMPurify.sanitize(originalBody);
    setComposeBody(`<br><br><br>On ${selectedEmail.time}, ${sender} wrote:<br><blockquote>${cleanBody}</blockquote>`);
    setDraftId(Date.now());
    setIsComposeOpen(true);
  };

  const handleForward = () => {
    if (!selectedEmail) return;
    setComposeTo('');
    setComposeSubject(selectedEmail.subject.startsWith('Fwd:') ? selectedEmail.subject : `Fwd: ${selectedEmail.subject}`);
    const originalBody = selectedEmail.body || selectedEmail.preview || '';
    const cleanBody = DOMPurify.sanitize(originalBody);
    setComposeBody(`<br><br><br>---------- Forwarded message ---------<br>From: ${selectedEmail.sender}<br>Date: ${selectedEmail.time}<br>Subject: ${selectedEmail.subject}<br><br>${cleanBody}`);
    setDraftId(Date.now());
    setIsComposeOpen(true);
  };

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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="h-9 w-9 p-0 border-white/10 bg-white/5 rounded-lg text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-colors"><Trash2 size={16}/></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#23232f] border-white/10 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Email</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          Are you sure you want to delete this email? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white border-none">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
                  <Button onClick={handleReply} className="flex-1 bg-[#FC90AF] text-black rounded-xl h-12 font-black uppercase text-xs tracking-widest">Reply</Button>
                  <Button onClick={handleForward} variant="outline" className="flex-1 border-white/10 bg-white/5 rounded-xl h-12 font-black uppercase text-xs text-gray-400">Forward</Button>
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
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-6 py-2 border-b border-white/5">
                    {attachments.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 bg-[#FC90AF]/10 px-3 py-1 rounded-full text-xs text-[#FC90AF]">
                            <span className="truncate max-w-[150px]">{file.name}</span>
                            <button onClick={() => removeAttachment(index)} className="hover:text-white"><X size={12}/></button>
                        </div>
                    ))}
                </div>
              )}
              <Editor 
                key={draftId}
                initialContent={composeBody}
                onChange={setComposeBody}
              />
            </div>
            <div className="p-6 bg-[#15151b]/50 flex justify-between items-center">
              <Button onClick={handleSendEmail} disabled={isSending} className="bg-[#FC90AF] text-black rounded-xl px-8 font-black uppercase text-[10px]">
                {isSending ? 'Sending...' : 'Send'}
              </Button>
              <input 
                  type="file" 
                  multiple 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange} 
              />
              <button onClick={() => fileInputRef.current?.click()} className="text-gray-600 hover:text-white transition-colors">
                  <Paperclip size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
