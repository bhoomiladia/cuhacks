'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Settings, 
  CheckSquare, 
  Mail, 
  Activity 
} from 'lucide-react';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

interface RightPanelProps {
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (value: boolean) => void;
}

export function RightPanel({ 
  isRightPanelOpen, 
  setIsRightPanelOpen, 
}: RightPanelProps) {
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
            <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-[#FC90AF]/20">
                <AvatarImage src="https://github.com/shadcn.png" />
              </Avatar>
              <div className="flex-1">
                 <p className="text-sm font-bold text-white">James Todd</p>
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Premium Agent Access</p>
              </div>
              <div className="p-2 bg-white/5 rounded-xl text-gray-500 hover:text-white cursor-pointer transition-colors">
                <Settings size={16} />
              </div>
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
                         <p className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">{task}</p>
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
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8F61DB]/20 to-[#8F61DB]/5 flex items-center justify-center text-[#8F61DB]">
                      <Mail size={18}/>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-white">Email Sent</p>
                      <p className="text-[10px] text-gray-500 truncate">Subject: Project Update Proposal...</p>
                    </div>
                  </div>
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