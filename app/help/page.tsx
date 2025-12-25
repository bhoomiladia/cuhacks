"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, ChevronRight, ChevronLeft, Home, Mail, 
  Users, CheckSquare, HelpCircle, BookOpen, MessageSquare, 
  Zap, Shield, Globe, Send, Star, Plus, X, ArrowUpRight,
  Headset, Sparkles, Terminal, Command
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function HelpPage() {
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  
  const scrollRef = useRef<HTMLDivElement>(null)

  const faqs = [
    { q: "How do I sync my external APIs?", a: "Navigate to the 'Integrations' tab, click 'Register Agent', and paste your secure API key. Kairo handles the handshake automatically using our encrypted vault." },
    { q: "Is my data used for training?", a: "Absolutely not. Kairo operates on a 'Zero-Retention' policy. Your data is processed in a temporary neural sandbox and purged immediately after execution." },
    { q: "Can I create custom Agent behaviors?", a: "Yes. Use the 'Neural Override' button in the Agent Center to adjust reasoning depth, temperature, and specific tool-use constraints." },
    { q: "What happens if an Agent fails?", a: "The 'Verifier' agent automatically catches execution errors and attempts a 'Self-Correction' loop. If that fails, you receive a priority notification." },
  ]

  // Auto-scroll for chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [isChatOpen])

  return (
    <div className="flex h-screen bg-[#15151b] overflow-hidden text-white font-sans selection:bg-[#FC90AF]/30">
      
      {/* 1. LEFT GLOBAL SIDEBAR */}
      <nav className={`h-full flex flex-col py-8 gap-8 border-r border-white/5 bg-[#23232f] transition-all duration-300 ${isSidebarOpen ? "w-56 px-4" : "w-20 items-center"}`}>
        <div className="flex items-center justify-between">
          <button className="text-4xl font-bold tracking-tighter uppercase p-2 text-white imbue-bold italic">K</button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:bg-white/5 p-1 rounded-lg">
            {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
        <div className="flex flex-col gap-3 mt-6">
          {[
            { icon: Home, label: "Dashboard", href: "/dashboard" },
            { icon: Mail, label: "Emails", href: "/emails" },
            { icon: Users, label: "Agents", href: "/integrations" },
            { icon: HelpCircle, label: "Help Center", href: "/help", active: true },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${item.active ? "bg-[#FC90AF]/10 text-[#FC90AF]" : "hover:bg-white/5 text-gray-300"}`}>
              <item.icon size={18} />
              {isSidebarOpen && <span className="text-sm font-black tracking-tight">{item.label}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#15151b]">
        
        {/* HERO SECTION */}
        <section className="p-16 pb-24 border-b border-white/5 bg-gradient-to-b from-[#23232f]/50 to-transparent relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-7xl font-black italic uppercase tracking-tighter mb-8 leading-none">
                Kairo <span className="text-[#FC90AF]">Support</span>
              </h1>
              <div className="relative max-w-2xl mx-auto group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#FC90AF] transition-colors" size={20} />
                <input 
                  placeholder="Ask anything about the Kairo Protocol..." 
                  className="w-full bg-[#15151b] border border-white/10 rounded-[2.5rem] py-6 pl-16 pr-8 text-sm focus:outline-none focus:border-[#FC90AF]/50 shadow-2xl transition-all"
                />
              </div>
            </motion.div>
          </div>
          {/* Background Decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 pointer-events-none">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#FC90AF] via-transparent to-transparent blur-3xl" />
          </div>
        </section>

        <div className="max-w-6xl mx-auto p-16 space-y-32">
          
          {/* HOW IT WORKS (THE FLOW) */}
          <section>
            <div className="flex items-center gap-6 mb-16">
              <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-600">Protocol Flow</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { step: "01", title: "Interpret", desc: "Our Interpreter agent transforms raw human intent into structured neural nodes.", icon: Command },
                { step: "02", title: "Sequence", desc: "The Planner agent maps out dependencies and creates an execution graph.", icon: Terminal },
                { step: "03", title: "Fulfill", desc: "Executors interact with your secure integrations to complete the sequence.", icon: Zap },
              ].map((item, i) => (
                <div key={i} className="group p-10 rounded-[3rem] bg-[#1f1f2e] border border-white/5 hover:border-[#FC90AF]/30 transition-all">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-5xl font-black italic text-white/5 group-hover:text-[#FC90AF]/20 transition-colors tracking-tighter">{item.step}</span>
                    <div className="p-4 rounded-2xl bg-[#15151b] border border-white/10 group-hover:scale-110 transition-transform">
                       <item.icon className="text-[#FC90AF]" size={24} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed font-bold">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ ACCORDION */}
          <section className="grid lg:grid-cols-2 gap-24 items-start">
            <div>
              <div className="p-3 bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-2xl w-fit mb-6">
                 <BookOpen size={20} className="text-[#a855f7]" />
              </div>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-8 leading-none">Global <br/> <span className="text-[#a855f7]">Documentation</span></h2>
              <p className="text-gray-500 text-sm mb-10 leading-relaxed max-w-sm font-bold uppercase tracking-wider">Explore the deep mechanics of Kairo's multi-agent orchestration.</p>
              <Button className="bg-white/5 border border-white/10 text-white rounded-2xl h-16 px-10 font-black uppercase text-xs tracking-widest hover:bg-white/10">Enter Archives</Button>
            </div>
            
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-white/5 bg-[#1f1f2e]/30 rounded-3xl overflow-hidden mb-4 transition-all hover:bg-[#1f1f2e]/50">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-8 text-left"
                  >
                    <span className="font-black uppercase italic tracking-tight text-sm pr-4">{faq.q}</span>
                    <div className={`p-2 rounded-full border border-white/10 transition-transform duration-500 ${activeFaq === i ? 'rotate-45 bg-[#FC90AF] border-none' : ''}`}>
                      <Plus size={16} className={activeFaq === i ? 'text-black' : 'text-gray-500'} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="px-8 pb-8 text-sm text-gray-500 leading-relaxed font-bold border-t border-white/5 pt-6">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>

          {/* RECOMMENDATION & FEEDBACK */}
          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FC90AF]/20 to-[#a855f7]/20 blur-[120px] rounded-full opacity-30" />
            <div className="relative bg-[#1f1f2e]/80 backdrop-blur-3xl rounded-[4rem] p-16 border border-white/10 flex flex-col lg:flex-row gap-16 items-center">
              <div className="flex-1">
                 <Badge className="bg-[#FC90AF]/10 text-[#FC90AF] border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Open Source Thinking</Badge>
                 <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-6 leading-tight">Send <br/> <span className="text-[#FC90AF]">Proposals</span></h2>
                 <p className="text-gray-400 text-sm font-bold uppercase tracking-wide leading-relaxed mb-8">Your architecture recommendations shape the future of Kairo. Submit your vision for new agents or tool integrations.</p>
                 <div className="flex -space-x-4">
                    {[1,2,3,4,5].map(i => (
                      <Avatar key={i} className="w-12 h-12 border-4 border-[#1f1f2e] shadow-xl">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                        <AvatarFallback>K</AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="w-12 h-12 rounded-full bg-[#FC90AF] border-4 border-[#1f1f2e] flex items-center justify-center text-black text-[10px] font-black italic">+80</div>
                 </div>
              </div>
              
              <div className="w-full lg:w-[450px] space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2">Area of Interest</label>
                    <select className="w-full bg-[#15151b] border border-white/10 rounded-2xl p-5 text-xs font-bold outline-none focus:border-[#FC90AF]/50 appearance-none text-gray-300">
                      <option>Core Agent Intelligence</option>
                      <option>UI/UX Refinement</option>
                      <option>Integration Expansion</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2">Message</label>
                    <textarea 
                      placeholder="Share your technical vision..." 
                      className="w-full bg-[#15151b] border border-white/10 rounded-2xl p-6 text-xs font-bold outline-none focus:border-[#FC90AF]/50 h-40 resize-none placeholder:text-gray-700"
                    />
                 </div>
                 <Button className="w-full bg-[#FC90AF] text-black h-16 rounded-2xl font-black uppercase text-xs tracking-widest hover:shadow-[0_0_30px_rgba(252,144,175,0.3)] transition-all">
                    Transmit Recommendation
                 </Button>
              </div>
            </div>
          </section>

        </div>

        <footer className="p-20 border-t border-white/5 text-center bg-[#15151b]">
          <div className="text-3xl font-black italic uppercase tracking-tighter mb-4 opacity-20">Kairo OS</div>
          <p className="text-[10px] font-black uppercase tracking-[0.8em] text-gray-800">Neural Network Assistance • Version 2.4.0</p>
        </footer>
      </main>

      {/* 3. RIGHT PANEL (QUICK STATS) */}
      <aside className="w-80 bg-[#15151b] border-l border-white/5 p-10 hidden xl:flex flex-col gap-10">
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mb-6">Status</h3>
          <div className="space-y-4">
             {[
               { label: "Neural Engine", status: "Online", color: "#4ade80" },
               { label: "API Gateway", status: "Online", color: "#4ade80" },
               { label: "Sandbox Env", status: "12ms Delay", color: "#FC90AF" },
             ].map((s, i) => (
               <div key={i} className="flex items-center justify-between p-4 bg-[#1f1f2e] rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">{s.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-[9px] font-black uppercase" style={{ color: s.color }}>{s.status}</span>
                  </div>
               </div>
             ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-[#a855f7]/10 to-transparent p-8 rounded-[2.5rem] border border-white/5">
           <Star size={24} className="text-[#a855f7] mb-4" />
           <h4 className="text-sm font-black uppercase italic tracking-tighter mb-2">Priority Cluster</h4>
           <p className="text-[10px] text-gray-500 font-bold leading-relaxed mb-6">Enterprise tiers get dedicated Interpreter nodes for 0.2s latency response times.</p>
           <Button variant="outline" className="w-full border-[#a855f7]/30 text-[#a855f7] rounded-xl h-10 text-[10px] font-black uppercase tracking-widest hover:bg-[#a855f7] hover:text-white transition-all">Upgrade</Button>
        </section>
      </aside>

      {/* 4. FLOATING LIVE CHAT SYSTEM */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-4">
         <AnimatePresence>
            {isChatOpen && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="w-96 h-[550px] bg-[#23232f] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
               >
                  <header className="p-6 bg-[#15151b] border-b border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#FC90AF]/10 flex items-center justify-center text-[#FC90AF] border border-[#FC90AF]/20">
                           <Sparkles size={18} />
                        </div>
                        <div>
                           <h4 className="text-xs font-black uppercase italic tracking-tighter">Kairo Assistant</h4>
                           <p className="text-[9px] text-[#4ade80] font-black uppercase tracking-widest">Always Online</p>
                        </div>
                     </div>
                     <button onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-white"><X size={18}/></button>
                  </header>

                  <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
                     <div className="flex gap-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex-shrink-0 flex items-center justify-center"><HelpCircle size={14} className="text-gray-500"/></div>
                        <div className="bg-white/5 p-4 rounded-3xl rounded-tl-none border border-white/5">
                           <p className="text-xs text-gray-300 leading-relaxed font-bold italic">"Initiating connection... How can I assist with your Neural Workflow today?"</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-6 border-t border-white/5 bg-[#15151b]">
                     <div className="relative">
                        <input 
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder="Type a command..." 
                          className="w-full bg-[#1f1f2e] border border-white/10 rounded-2xl py-4 pl-5 pr-12 text-xs font-bold outline-none focus:border-[#FC90AF]/50"
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FC90AF] hover:scale-110 transition-transform">
                           <Send size={18} />
                        </button>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         <motion.button 
           whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
           onClick={() => setIsChatOpen(!isChatOpen)}
           className="w-20 h-20 rounded-[2rem] bg-[#FC90AF] text-black shadow-2xl shadow-[#FC90AF]/20 flex items-center justify-center group relative overflow-hidden"
         >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Headset size={28} className="relative z-10" />
         </motion.button>
      </div>

    </div>
  )
}