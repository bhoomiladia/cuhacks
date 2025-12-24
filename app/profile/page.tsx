'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { RightPanel } from '@/components/RightPanel';
import { 
  Mic, Mail, Shield, LogOut, 
  CheckCircle2, FileText, 
  Zap, Bot, Search, MessageSquare, Globe, Fingerprint, Activity
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [activeLang, setActiveLang] = useState('EN');
    const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="bg-[#15151b] h-screen w-full" />;

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const formattedDate = time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();

  return (
    <div className="flex h-screen w-full bg-[#15151b] text-[#e2e2e7] overflow-hidden font-sans">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <main className="flex-1 bg-[#1c1c24] rounded-l-[3.5rem] overflow-y-auto overflow-x-hidden p-12 custom-scrollbar relative">
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FC90AF]/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

        {/* HEADER SECTION */}
        <header className="mb-12 flex justify-between items-start relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Fingerprint className="text-[#FC90AF]" size={18} />
              <span className="text-[10px] font-black tracking-[0.4em] text-gray-500 uppercase">Authorized Access Only</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter italic uppercase text-white">Console<span className="text-[#FC90AF]">.</span>Profile</h1>
          </div>
          <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 text-right">System Health</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                <span className="text-xs font-bold text-white uppercase tracking-tighter">Neural Link 100%</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6 relative z-10">
          
          {/* COLUMN 1: IDENTITY & STATS */}
          <section className="col-span-12 lg:col-span-4 space-y-6">
            {/* Main User Card */}
            <div className="bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 p-10 rounded-[3rem] text-center shadow-2xl">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-[#FC90AF] blur-2xl opacity-20 animate-pulse" />
                <Avatar className="w-32 h-32 border-2 border-white/10 relative z-10">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>JT</AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">James Todd</h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.1em] mt-1">Lead Architect</p>
              
              <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email</span>
                  <span className="text-xs font-medium text-white">james@kairo.io</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Uptime</span>
                  <span className="text-xs font-medium text-white">412 Hours</span>
                </div>
              </div>
            </div>

            {/* Micro Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.03] p-6 rounded-[2rem] border border-white/5">
                <Activity className="text-[#FC90AF] mb-3" size={18} />
                <p className="text-2xl font-black text-white">12.8k</p>
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Neural Req</p>
              </div>
              <div className="bg-white/[0.03] p-6 rounded-[2rem] border border-white/5">
                <Zap className="text-yellow-400 mb-3" size={18} />
                <p className="text-2xl font-black text-white">99.9%</p>
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Accuracy</p>
              </div>
            </div>
          </section>

          {/* COLUMN 2 & 3: SETTINGS BENTO */}
          <section className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Agent Control Board (Compact Grid) */}
            <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Bot className="text-[#FC90AF]" size={18} />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Agent Deployment</h3>
                </div>
                <span className="text-[9px] font-black text-[#FC90AF] bg-[#FC90AF]/10 px-3 py-1 rounded-full uppercase">All Systems Nominal</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "Email Agent", icon: Mail, color: "text-blue-400" },
                  { name: "Summary Agent", icon: Zap, color: "text-yellow-400" },
                  { name: "Research Agent", icon: Search, color: "text-purple-400" },
                  { name: "Response Agent", icon: MessageSquare, color: "text-[#FC90AF]" }
                ].map((agent) => (
                  <div key={agent.name} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
                    <div className="flex items-center gap-3">
                      <agent.icon className={agent.color} size={16} />
                      <span className="text-sm font-bold">{agent.name}</span>
                    </div>
                    <Switch defaultChecked className="scale-75 data-[state=checked]:bg-[#FC90AF]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Language & Linguistic Core */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Globe className="text-[#FC90AF]" size={18} />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">System Dialect</h3>
                  </div>
                  <div className="flex bg-[#15151b] p-1.5 rounded-2xl border border-white/10 w-fit">
                    {['EN', 'FR', 'JP'].map((lang) => (
                      <button 
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${
                          activeLang === lang ? 'bg-[#FC90AF] text-[#15151b]' : 'text-gray-500 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">Vocal Feedback</span>
                  <Switch defaultChecked className="data-[state=checked]:bg-[#FC90AF]" />
                </div>
              </div>

              {/* Voice Core Card */}
              <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Mic className="text-[#FC90AF]" size={18} />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Voice Core</h3>
                </div>
                <div className="space-y-3">
                  {['Neural Alpha (Male)', 'Neural Beta (Female)'].map((voice, idx) => (
                    <div key={voice} className={`p-4 rounded-2xl flex items-center justify-between border transition-all cursor-pointer ${idx === 0 ? 'bg-[#FC90AF]/5 border-[#FC90AF]/20' : 'bg-white/[0.02] border-transparent hover:border-white/10'}`}>
                      <span className={`text-[11px] font-bold ${idx === 0 ? 'text-[#FC90AF]' : 'text-gray-400'}`}>{voice}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-[#FC90AF]' : 'bg-gray-600'}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Critical Actions Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl"><Mail className="text-blue-400" size={20} /></div>
                  <div>
                    <p className="text-sm font-bold text-white">Google Workspace</p>
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Linked / Active</p>
                  </div>
                </div>
                <Button variant="ghost" className="text-red-500 hover:bg-red-500/10 text-[10px] font-black uppercase">Revoke</Button>
              </div>
              <Button className="h-full bg-red-500/10 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white rounded-[2.5rem] font-black uppercase tracking-widest text-[10px]">
                Purge Data
              </Button>
            </div>

          </section>
        </div>

        {/* LOGOUT AREA */}
        <div className="mt-12 flex justify-center">
           <button className="flex items-center gap-2 text-gray-600 hover:text-white transition-colors group">
             <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Terminate Current Session</span>
           </button>
        </div>
      </main>
      <RightPanel 
        isRightPanelOpen={isRightPanelOpen} 
        setIsRightPanelOpen={setIsRightPanelOpen} 
        formattedTime={formattedTime} 
        formattedDate={formattedDate} 
      />
    </div>
  );
}