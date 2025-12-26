'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Settings, 
  CheckSquare, 
  Mail, 
  Activity,
  Plus, Clock, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { format } from 'date-fns';

interface RightPanelProps {
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (value: boolean) => void;

}

interface RecentAction {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  taskId: string;
}

export function RightPanel({ 
  isRightPanelOpen, 
  setIsRightPanelOpen, 
}: RightPanelProps) {
  
  // --- BACKEND CONNECTION START ---
  const [dashboardData, setDashboardData] = useState({
  user: { name: "Loading...", avatar: "https://github.com/shadcn.png", title: "", bio: "" }, // Added title and bio
  stats: { emailsSent: 0, tasksCompleted: "0%", aiUptime: "0h" },
  activeTasks: [],
  executionLogs: []
});

  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      }
    };
    
    const fetchRecentActions = async () => {
      try {
        const response = await fetch('/api/actions/recent');
        if (response.ok) {
          const data = await response.json();
          setRecentActions(data.actions || []);
        }
      } catch (error) {
        console.error('Error fetching recent actions:', error);
      }
    };

    fetchDashboardData();
    fetchRecentActions();

    const interval = setInterval(() => {
       fetchRecentActions();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email_sent':
        return Mail;
      case 'execution_completed':
      case 'execution_running':
        return Zap;
      default:
        return Activity;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'email_sent':
        return { text: 'text-[#8F61DB]', bg: 'from-[#8F61DB]/20 to-[#8F61DB]/5' };
      case 'execution_completed':
        return { text: 'text-green-400', bg: 'from-green-400/20 to-green-400/5' };
      case 'execution_running':
        return { text: 'text-yellow-400', bg: 'from-yellow-400/20 to-yellow-400/5' };
      default:
        return { text: 'text-gray-400', bg: 'from-gray-400/20 to-gray-400/5' };
    }
  };
  return (
    <motion.aside 
      animate={{ width: isRightPanelOpen ? 400 : 80 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      className="bg-[#15151b] h-full relative flex-shrink-0 flex flex-col border-l border-white/5"
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} 
        className="absolute left-[-12px] top-1/2 -translate-y-1/2 bg-[#FC90AF] h-10 w-6 rounded-lg flex items-center justify-center text-[#15151b] z-50 shadow-xl hover:scale-110 transition-transform cursor-pointer"
      >
        {isRightPanelOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="p-8 h-full flex flex-col no-scrollbar overflow-y-auto overflow-x-hidden">
        
        {/* Time & Date Header */}
        <div className={`mb-12 transition-all duration-500 flex flex-col ${isRightPanelOpen ? 'items-start' : 'items-center pt-6'}`}>

          <AnimatePresence>
            {isRightPanelOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }} 
                className="mt-4"
              >
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
            <Link href='/profile' className="bg-white/5 p-5 rounded-[2rem] border border-white/5 flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-[#FC90AF]/20">
                <AvatarImage src={dashboardData.user.avatar} />
              </Avatar>
                      <div className="flex-1">
          <p className="text-sm font-bold text-white">{dashboardData.user.name}</p>
          {/* Displays your Professional Title */}
          <p className="text-[10px] text-[#FC90AF] font-bold uppercase tracking-widest">
            {dashboardData.user.title || "Premium Agent Access"}
          </p>
          {/* Displays your Bio */}
          {dashboardData.user.bio && (
            <p className="text-[10px] text-gray-500 mt-1 italic line-clamp-2">
              {dashboardData.user.bio}
            </p>
          )}
        </div>
              <div className="p-2 bg-white/5 rounded-xl text-gray-500 hover:text-white cursor-pointer transition-colors">
                <Settings size={16} />
              </div>
            </Link>

          {/* Tasks Quick-View */}
<section className="bg-[#23232f]/30 rounded-[2.5rem] p-6 border border-white/5 backdrop-blur-sm">
  {/* Header Section */}
  <div className="flex items-center justify-between mb-8 px-2">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-[#FC90AF]/10 rounded-lg">
        <CheckSquare size={16} className="text-[#FC90AF]" />
      </div>
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block">System Queue</span>
        <h3 className="text-sm font-black uppercase italic tracking-tighter">Active Pipeline</h3>
      </div>
    </div>
    <Link 
      href="/tasks" 
      className="group flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-[#FC90AF] transition-colors"
    >
      View All <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
    </Link>
  </div>

  {/* Tasks List */}
  <div className="space-y-3">
    {dashboardData.activeTasks.map((task, i) => (
      <motion.div 
        key={i} 
        whileHover={{ x: 6, backgroundColor: "rgba(252, 144, 175, 0.05)" }}
        className="flex items-center gap-4 bg-[#1f1f2e] p-5 rounded-[1.8rem] border border-white/5 hover:border-[#FC90AF]/30 transition-all group cursor-pointer"
      >
        {/* Interactive Neural Checkbox */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <div className="w-6 h-6 rounded-full border-2 border-white/10 group-hover:border-[#FC90AF] transition-all duration-500" />
          <div className="absolute w-2 h-2 rounded-full bg-[#FC90AF] opacity-0 group-hover:opacity-100 group-hover:shadow-[0_0_12px_#FC90AF] transition-all duration-300" />
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors tracking-tight truncate">
            {task}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
       
          </div>
        </div>

        {/* Action Indicator */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
           <Zap size={14} className="text-[#FC90AF] fill-[#FC90AF]/20" />
        </div>
      </motion.div>
    ))}
  </div>

  {/* Quick Action / Footer */}
  <Button 
    variant="ghost" 
    className="w-full mt-6 border border-dashed border-white/10 rounded-2xl py-6 text-gray-600 hover:text-[#FC90AF] hover:bg-[#FC90AF]/5 hover:border-[#FC90AF]/20 transition-all gap-2"
  >
    <Plus size={14} />
    <span className="text-[10px] font-black uppercase tracking-widest">Deploy New Task</span>
  </Button>
</section>

            {/* Email Activity Indicator */}
            <section>
               <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Recent Actions</h3>
                  <Activity size={14} className="text-gray-700"/>
               </div>
               <div className="space-y-3">
                  {recentActions.length > 0 ? (
                    recentActions.slice(0, 3).map((action, i) => {
                      const Icon = getActionIcon(action.type);
                      const color = getActionColor(action.type);
                      return (
                        <div key={i} className="bg-[#1f1f2e] rounded-[2rem] p-5 border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${color.bg} flex items-center justify-center ${color.text}`}>
                              <Icon size={18}/>
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-xs font-bold text-white">{action.title}</p>
                              <p className="text-[10px] text-gray-500 truncate">{action.description}</p>
                              <p className="text-[9px] text-gray-600 mt-1">
                                {format(new Date(action.timestamp), 'MMM d, HH:mm')}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-[#1f1f2e] rounded-[2rem] p-5 border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8F61DB]/20 to-[#8F61DB]/5 flex items-center justify-center text-[#8F61DB]">
                          <Activity size={18}/>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-bold text-gray-500">No recent actions</p>
                          <p className="text-[10px] text-gray-600">Actions will appear here</p>
                        </div>
                      </div>
                    </div>
                  )}
               </div>
            </section>
          </div>
        ) : (
          /* Minimized State Icons */
          <div className="flex flex-col items-center gap-10 mt-10">
             <Avatar className="w-10 h-10 border border-white/10">
                <AvatarImage src="https://github.com/shadcn.png" />
             </Avatar>
             <CheckSquare size={20} className="text-gray-700 hover:text-[#FC90AF] transition-colors cursor-pointer" />
             <Mail size={20} className="text-gray-700 hover:text-[#FC90AF] transition-colors cursor-pointer" />
             <Activity size={20} className="text-gray-700 hover:text-[#FC90AF] transition-colors cursor-pointer" />
          </div>
        )}
      </div>
    </motion.aside>
  );
}