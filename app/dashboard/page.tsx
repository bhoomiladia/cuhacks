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
import Link from "next/link"
import {RightPanel} from "@/components/RightPanel"
export default function DashboardPage() {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: CheckCircle2, label: "Tasks", href: "/tasks" },
    // { icon: FileText, label: "Notes", href: "/notes" },
    { icon: Mail, label: "Emails", href: "/emails" },
    // { icon: Activity, label: "Activity Log", href: "/activity" },
    // { icon: PieChart, label: "Analytics", href: "/analytics" },
    { icon: Users, label: "Integrations", href: "/integrations" },
    { icon: HelpCircle, label: "Help / How it works", href: "/help" },
  ]
  // --- BACKEND CONNECTION START ---
  const [dashboardData, setDashboardData] = useState({
    user: { 
      name: "Loading...", 
      avatar: "https://github.com/shadcn.png",
      title: "", // Add this
      bio: ""    // Add this
    },
    stats: { emailsSent: 0, tasksCompleted: "0%", aiUptime: "0h" },
    activeTasks: [],
    executionLogs: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        
        // If the server says the token is gone (401), kick them out!
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      }
    };
    fetchDashboardData();
  }, []);
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
  {isSidebarOpen && (<button 
      className="text-4xl font-bold tracking-tighter text-white uppercase imbue-bold hover:opacity-70 p-2 transition-opacity cursor-pointer"
    >
      KAIRO
    </button>)
}  
  {!isSidebarOpen && (<button 
      className="text-4xl font-bold tracking-tighter text-white uppercase imbue-bold hover:opacity-70 p-2 transition-opacity cursor-pointer"
    >
      K
    </button>)
}  
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

  <div className="flex flex-col gap-3 mt-6">
  {navItems.map(({ icon: Icon, label, href }) => (
    <Link
      key={label}
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-xl 
                 hover:bg-white/5 cursor-pointer transition"
    >
      <Icon size={18} />
      {isSidebarOpen && (
        <span className="text-sm text-gray-300">{label}</span>
      )}
    </Link>
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
                     {dashboardData.executionLogs.map((log, i) => (
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
                  <h4 className="text-3xl font-black">{dashboardData.stats.emailsSent}</h4>
               </div>
               <div className="bg-[#1f1f2e] rounded-3xl p-6 h-32 flex flex-col justify-center">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1">Tasks Completed</p>
                  <h4 className="text-3xl font-black text-[#4ade80]">85%</h4>
               </div>
               <div className="bg-[#1f1f2e] rounded-3xl p-6 h-32 flex flex-col justify-center">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1">AI Uptime</p>
                  <h4 className="text-3xl font-black text-[#a855f7]">{dashboardData.stats.aiUptime}</h4>
               </div>
            </div>
          </div>
        </main>
      </div>
<RightPanel
isRightPanelOpen={isRightPanelOpen}
setIsRightPanelOpen={setIsRightPanelOpen}/>
      </div>
  )
}