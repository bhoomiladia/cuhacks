"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home, PieChart, Users, Settings, LogOut,
  Mail, ChevronLeft, ChevronRight, 
  Mic, Play, CheckCircle2, CheckSquare,
 Plus, Send, HelpCircle, FileText, Activity
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardPage() {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  const [time, setTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 100)
    return () => clearInterval(timer)
  }, [])

  const formattedDate = time.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })
  const formattedTime = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-[#15151b] overflow-hidden text-white font-sans selection:bg-[#FC90AF]/30">
      
      {/* LEFT SECTION */}
      <div className="flex-1 flex bg-[#23232f] rounded-r-[3rem] z-10 shadow-2xl overflow-hidden relative">
        
        {/* Navigation Sidebar */}
        <nav
  className={`h-full flex flex-col py-8 gap-8 border-r border-white/5 bg-[#23232f] transition-all duration-300 ${
    isSidebarOpen ? "w-56 px-4" : "w-20 items-center"
  }`}
>
  {/* Logo + Toggle */}
  <div className="flex items-center justify-between">
    <div className="w-10 h-10 bg-gradient-to-br from-[#FC90AF] to-[#8F61DB] rounded-xl flex items-center justify-center font-bold text-lg">
      A
    </div>
    {isSidebarOpen && (
      <ChevronLeft
        size={18}
        className="text-gray-400 cursor-pointer"
        onClick={() => setIsSidebarOpen(false)}
      />
    )}
    {!isSidebarOpen && (
      <ChevronRight
        size={18}
        className="text-gray-400 cursor-pointer"
        onClick={() => setIsSidebarOpen(true)}
      />
    )}
  </div>

  {/* Navigation */}
  <div className="flex flex-col gap-3 mt-6">
    {[
      { icon: Home, label: "Dashboard" },
      { icon: CheckCircle2, label: "Tasks" },
      { icon: FileText, label: "Notes" },
      { icon: Mail, label: "Emails" },
      { icon: Activity, label: "Activity Log" },
      { icon: PieChart, label: "Analytics" },
      { icon: Users, label: "Integrations" },
      { icon: HelpCircle, label: "Help / How it works" },
    ].map(({ icon: Icon, label }) => (
      <div
        key={label}
        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer"
      >
        <Icon size={18} />
        {isSidebarOpen && (
          <span className="text-sm text-gray-300">{label}</span>
        )}
      </div>
    ))}
  </div>

  {/* Bottom */}
  <div className="mt-auto flex flex-col gap-4">
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer">
      <Settings size={18} />
      {isSidebarOpen && <span className="text-sm">Settings</span>}
    </div>
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer text-red-400">
      <LogOut size={18} />
      {isSidebarOpen && <span className="text-sm">Logout</span>}
    </div>
  </div>
</nav>


        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto no-scrollbar">
        <div className="mb-2">
  <h1 className="text-3xl font-black">
    Welcome back 👋
  </h1>
  <p className="text-gray-400 text-sm mt-1">
    Your AI agents are ready — give a command to get started.
  </p>
</div>

          {/* Header: Search & Activity Timeline (Feature 7) */}
          <header className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
               <h2 className="text-xl font-bold">Agent Center</h2>
            
            </div>
          </header>

          <div className="flex flex-col gap-8 max-w-5xl mx-auto">
            
            {/* Feature 1 & 2: Command Input Panel */}
            <div className="relative pt-8">
               {/* THE CHARACTER POUT-OUT */}
               <div className="absolute right-8 -top-13 z-20 pointer-events-none">

                 <motion.img 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    src="dashboard-woman.png" 
                    className="w-64 h-auto drop-shadow-2xl translate-y-6"
                 />
               </div>

               <div className="bg-gradient-to-r from-[#fda4bc] to-[#f985a6] rounded-[2.5rem] p-8 relative overflow-hidden">
                  <div className="max-w-md z-10 relative">
                    <h1 className="text-3xl font-black mb-4">Command Center</h1>
                    <div className="bg-white/10 backdrop-blur-xl p-2 rounded-2xl flex items-center border border-white/20">
                       <input 
                         placeholder="Create a task to email the team..." 
                         className="bg-transparent border-none outline-none flex-1 px-4 py-2 placeholder:text-white/60 text-white font-medium"
                       />
                       <button className="p-3 bg-white/20 hover:bg-white/40 rounded-xl transition-all mr-1"><Mic size={18} /></button>
                       <button className="p-3 bg-white rounded-xl text-[#f985a6] hover:scale-105 transition-all"><Send size={18} /></button>
                    </div>
                  </div>
               </div>
            </div>

            {/* Feature 3: Agent Execution Log & 5: Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Execution Log */}
               <div className="bg-[#1f1f2e] rounded-[2rem] p-6 border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold flex items-center gap-2"><Play size={14} className="text-[#a855f7]" /> Agent Execution</h3>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Real-time</span>
                  </div>
                  <div className="space-y-4">
                     {['Planner: Identifying task goals...', 'Interpreter: Parsing natural language...', 'Executor: Sending API request...'].map((log, i) => (
                       <div key={i} className="flex gap-3 text-xs border-l-2 border-[#a855f7]/30 pl-4 py-1">
                          <span className="text-gray-500 font-mono">0{i+1}</span>
                          <p className={i === 2 ? "text-[#a855f7] font-semibold" : "text-gray-400"}>{log}</p>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Quick Capture / Notes */}
               <div className="bg-[#1f1f2e] rounded-[2rem] p-6 border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold flex items-center gap-2"><FileText size={14} className="text-[#FC90AF]" /> Quick Capture</h3>
                    <Plus size={16} className="text-gray-500 cursor-pointer" />
                  </div>
                  <textarea 
                    className="w-full h-24 bg-black/20 rounded-xl p-3 text-xs outline-none border border-white/5 focus:border-[#FC90AF]/50 transition-all resize-none"
                    placeholder="Type a quick note for the AI to remember..."
                  />
               </div>
            </div>
{/* BOX 2: Graph Section */}
<motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full bg-[#1f1f2e] rounded-3xl p-6 min-h-[250px] relative overflow-hidden"
                >
                   <div className="flex justify-between items-start mb-4 relative z-10">
                        <h2 className="font-semibold text-lg">Statistics</h2>
                        <div className="flex gap-4 text-xs">
                        </div>
                   </div>
                   
                   {/* CSS Generated Wave Graph */}
                   <div className="absolute inset-0 top-12 flex items-end px-4 pb-4 opacity-80">
                        {/* Wave 1 */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#8f61db]/20 to-transparent" style={{ clipPath: 'polygon(0 100%, 0 40%, 20% 60%, 40% 30%, 60% 70%, 80% 40%, 100% 80%, 100% 100%)'}}></div>
                        <svg className="w-full h-48 absolute bottom-0" preserveAspectRatio="none">
                            <path d="M0,80 C150,150 350,0 500,80 C650,160 800,50 1000,100 L1000,200 L0,200 Z" fill="url(#grad1)" fillOpacity="0.4" />
                            <path d="M0,80 C150,150 350,0 500,80 C650,160 800,50 1000,100" stroke="#8F61DB" strokeWidth="3" fill="none" />
                            
                            <path d="M0,120 C200,50 400,150 600,80 C800,10 1000,120 L1000,200 L0,200 Z" fill="url(#grad2)" fillOpacity="0.4" />
                            <path d="M0,120 C200,50 400,150 600,80 C800,10 1000,120" stroke="#FC90AF" strokeWidth="3" fill="none" />
                            
                            <defs>
                                <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{stopColor:'#8F61DB', stopOpacity:1}} />
                                    <stop offset="100%" style={{stopColor:'#8F61DB', stopOpacity:0}} />
                                </linearGradient>
                                <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{stopColor:'#FC90AF', stopOpacity:1}} />
                                    <stop offset="100%" style={{stopColor:'#FC90AF', stopOpacity:0}} />
                                </linearGradient>
                            </defs>
                        </svg>

                        
                   </div>
                </motion.div>
            {/* Feature 8: Daily Overview (Bento Row) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-[#1f1f2e] rounded-3xl p-6 h-32 flex flex-col justify-center">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1">Emails Sent</p>
                  <h4 className="text-3xl font-black">12</h4>
               </div>
               <div className="bg-[#1f1f2e] rounded-3xl p-6 h-32 flex flex-col justify-center">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1">Tasks Completed</p>
                  <h4 className="text-3xl font-black text-[#4ade80]">85%</h4>
               </div>
               <div className="bg-[#1f1f2e] rounded-3xl p-6 h-32 flex flex-col justify-center">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1">AI Uptime</p>
                  <h4 className="text-3xl font-black text-[#a855f7]">24h</h4>
               </div>
            </div>

          </div>
        </main>
      </div>

     {/* 3. RIGHT PANEL (Time, Dates & Profile) */}
     <motion.aside 
        animate={{ width: isRightPanelOpen ? 400 : 80 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="bg-[#15151b] h-full relative flex-shrink-0 flex flex-col border-l border-white/5"
      >
        <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} className="absolute left-[-12px] top-1/2 -translate-y-1/2 bg-[#FC90AF] h-10 w-6 rounded-lg flex items-center justify-center text-[#15151b] z-50 shadow-xl hover:scale-110 transition-transform">
            {isRightPanelOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="p-8 h-full flex flex-col no-scrollbar overflow-y-auto overflow-x-hidden">
          
          {/* Time & Date Header (Survivor of Minimization) */}
          <div className={`mb-12 transition-all duration-500 flex flex-col ${isRightPanelOpen ? 'items-start' : 'items-center pt-6'}`}>
            <h2 className={`font-black tracking-tighter text-[#FC90AF] leading-none transition-all duration-500 ${isRightPanelOpen ? 'text-5xl' : 'text-xl rotate-90 my-12'}`}>
               {formattedTime.split(' ')[0]}
            </h2>
            <AnimatePresence>
              {isRightPanelOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4">
                  <p className="text-gray-300 text-sm font-bold uppercase tracking-[0.3em]">{formattedDate}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-green-500">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                     SERVER STATUS: OPTIMAL
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isRightPanelOpen ? (
            <div className="flex flex-col gap-10">
              {/* User Identity Section */}
              <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-[#FC90AF]/20"><AvatarImage src="https://github.com/shadcn.png" /></Avatar>
                <div className="flex-1">
                   <p className="text-sm font-bold">James Todd</p>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Premium Agent Access</p>
                </div>
                <div className="p-2 bg-white/5 rounded-xl text-gray-500"><Settings size={16} /></div>
              </div>

              {/* Tasks Quick-View */}
              <section>
                 <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Active Pipeline</h3>
                    <CheckSquare size={14} className="text-gray-700"/>
                 </div>
                 <div className="space-y-3">
                    {['Draft Q4 Strategy Email', 'Sync Notion Database'].map((task, i) => (
                       <div key={i} className="flex items-center gap-4 bg-[#1f1f2e] p-5 rounded-2xl border border-white/5 hover:border-[#FC90AF]/20 transition-all group cursor-pointer">
                          <div className="w-5 h-5 rounded-full border border-white/10 group-hover:border-[#FC90AF] transition-colors" />
                          <p className="text-xs font-medium text-gray-300">{task}</p>
                       </div>
                    ))}
                 </div>
              </section>

              {/* Email Activity Indicator */}
              <section>
                 <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Recent Actions</h3>
                    <Mail size={14} className="text-gray-700"/>
                 </div>
                 <div className="bg-[#1f1f2e] rounded-[2rem] p-5 border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8F61DB]/20 to-[#8F61DB]/5 flex items-center justify-center text-[#8F61DB]"><Mail size={18}/></div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold">Email Sent</p>
                        <p className="text-[10px] text-gray-500 truncate">Subject: Project Update Proposal...</p>
                      </div>
                    </div>
                 </div>
              </section>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-10 mt-10">
               <Avatar className="w-10 h-10 border border-white/10"><AvatarImage src="https://github.com/shadcn.png" /></Avatar>
               <CheckSquare size={20} className="text-gray-700" />
               <Mail size={20} className="text-gray-700" />
               <Activity size={20} className="text-gray-700" />
            </div>
          )}
        </div>
      </motion.aside>
    </div>
  )
}