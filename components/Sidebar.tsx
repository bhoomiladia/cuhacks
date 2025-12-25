'use client';

import React from 'react';
import Link from 'next/link'; // Import Link from Next.js
import { usePathname } from 'next/navigation'; // Optional: for active state styling
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
  const pathname = usePathname(); // Hook to get current route

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: CheckCircle2, label: "Tasks", href: "/tasks" },
    { icon: FileText, label: "Notes", href: "/notes" },
    { icon: Mail, label: "Emails", href: "/emails" },
    { icon: Activity, label: "Activity Log", href: "/activity" },
    { icon: PieChart, label: "Analytics", href: "/analytics" },
    { icon: Users, label: "Integrations", href: "/integrations" },
    { icon: HelpCircle, label: "Help / How it works", href: "/help" },
  ];

  return (
    <nav
      className={`h-full flex flex-col py-8 gap-8 border-r border-white/5 bg-[#23232f] transition-all duration-300 ${
        isSidebarOpen ? "w-56 px-4" : "w-20 items-center"
      }`}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between w-full px-2">
        <Link 
          href="/dashboard"
          className="text-4xl font-bold tracking-tighter text-white uppercase imbue-bold hover:opacity-70 transition-opacity cursor-pointer"
        >
          {isSidebarOpen ? "KAIRO" : "K"}
        </Link>

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
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer group transition-all ${
                isActive ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <Icon 
                size={18} 
                className={`${isActive ? "text-[#FC90AF]" : "text-gray-400 group-hover:text-[#FC90AF]"}`} 
              />
              {isSidebarOpen && (
                <span className={`text-sm transition-colors ${
                  isActive ? "text-white font-medium" : "text-gray-300 group-hover:text-white"
                }`}>
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="mt-auto flex flex-col gap-4 w-full">
        <Link 
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer group transition-all ${
            pathname === '/settings' ? "bg-white/10" : ""
          }`}
        >
          <Settings size={18} className={`text-gray-400 group-hover:text-white ${pathname === '/settings' ? "text-white" : ""}`} />
          {isSidebarOpen && <span className="text-sm text-gray-300">Settings</span>}
        </Link>
        
        {/* Logout usually triggers a function, but Link added as requested */}
        <Link 
          href="/logout"
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer text-red-400 group transition-all"
        >
          <LogOut size={18} />
          {isSidebarOpen && <span className="text-sm">Logout</span>}
        </Link>
      </div>
    </nav>
  );
}