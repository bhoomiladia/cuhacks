'use client';

import React from 'react';
import { 
  Home, 
  CheckCircle2, 
  FileText, 
  Mail, 
  Activity, 
  PieChart, 
  Users, 
  HelpCircle, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
}

export function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  const navItems = [
    { icon: Home, label: "Dashboard" },
    { icon: CheckCircle2, label: "Tasks" },
    { icon: FileText, label: "Notes" },
    { icon: Mail, label: "Emails" },
    { icon: Activity, label: "Activity Log" },
    { icon: PieChart, label: "Analytics" },
    { icon: Users, label: "Integrations" },
    { icon: HelpCircle, label: "Help / How it works" },
  ];

  return (
    <nav
      className={`h-full flex flex-col py-8 gap-8 border-r border-white/5 bg-[#23232f] transition-all duration-300 ${
        isSidebarOpen ? "w-56 px-4" : "w-20 items-center"
      }`}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between w-full px-2">
        <button 
          className="text-4xl font-bold tracking-tighter text-white uppercase imbue-bold hover:opacity-70 transition-opacity cursor-pointer"
        >
          {isSidebarOpen ? "KAIRO" : "K"}
        </button>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          {isSidebarOpen ? (
            <ChevronLeft size={18} className="text-gray-400" />
          ) : (
            <ChevronRight size={18} className="text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-3 mt-6 w-full">
        {navItems.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer group transition-all"
          >
            <Icon size={18} className="text-gray-400 group-hover:text-[#FC90AF]" />
            {isSidebarOpen && (
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>
            )}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="mt-auto flex flex-col gap-4 w-full">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer group transition-all">
          <Settings size={18} className="text-gray-400 group-hover:text-white" />
          {isSidebarOpen && <span className="text-sm text-gray-300">Settings</span>}
        </div>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer text-red-400 group transition-all">
          <LogOut size={18} />
          {isSidebarOpen && <span className="text-sm">Logout</span>}
        </div>
      </div>
    </nav>
  );
}