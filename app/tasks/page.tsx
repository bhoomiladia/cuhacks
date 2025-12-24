"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Search, Filter, CheckCircle2, 
  Clock, Calendar, MoreHorizontal, 
  ChevronLeft, ChevronRight, Home,
  PieChart, Users, Settings, LogOut,
  Mail, FileText, Activity, ShieldCheck, CheckSquare, HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs"
import { TabsList } from "@/components/ui/glass/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateTaskModal } from "@/components/create-task-modal"
// import dynamic from "next/dynamic"
import { format } from 'date-fns'
import  GlassSurface  from "@/components/GlassSurface"

// --- Types & Initial Data ---
interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedAgent: string;
  tags: string[];
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Prepare quarterly business review presentation",
    description: "Create slides covering Q4 metrics, team achievements, and Q1 goals",
    status: "in-progress",
    priority: "high",
    dueDate: "Tomorrow",
    assignedAgent: "Executor",
    tags: ["presentation", "business"],
  },
  {
    id: 2,
    title: "Send follow-up emails to prospective clients",
    description: "Personalized follow-ups to 12 leads from last week's conference",
    status: "pending",
    priority: "medium",
    dueDate: "Today",
    assignedAgent: "Planner",
    tags: ["email", "sales"],
  },
  {
    id: 3,
    title: "Review and approve team vacation requests",
    description: "Process 5 pending vacation requests for January",
    status: "pending",
    priority: "low",
    dueDate: "This Week",
    assignedAgent: "Verifier",
    tags: ["hr", "admin"],
  },
];

export default function TasksPage() {
  // --- State Management ---
  const [taskList, setTaskList] = useState<Task[]>(initialTasks);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [time, setTime] = useState(new Date());

  // --- Helpers ---
  useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 100)
      return () => clearInterval(timer)
    }, [])
  
    const formattedDate = time.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })
    const formattedTime = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  // --- Logic: Filtering ---
  const filteredTasks = taskList.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const getTasksByStatus = (status: string) => {
    if (status === "all") return filteredTasks;
    if (status === "progress") return filteredTasks.filter(t => t.status === "in-progress");
    return filteredTasks.filter(t => t.status === status);
  };
  const [activeTab, setActiveTab] = useState("all");
  const pendingTasks = filteredTasks.filter((t) => t.status === "pending");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "in-progress");
  const completedTasks = filteredTasks.filter((t) => t.status === "completed");
  const tabs = [
    { id: "all", label: "All Tasks" },
    { id: "pending", label: "Pending" },
    { id: "progress", label: "In Progress" },
    { id: "completed", label: "Completed" }
  ];
  // --- Logic: Create Task ---
  const handleCreateTask = (newTask: {
    title: string;
    description: string;
    dueDate: Date | null;
    priority: 'low' | 'medium' | 'high';
  }) => {
    const task: Task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      status: 'pending',
      priority: newTask.priority,
      dueDate: newTask.dueDate ? format(newTask.dueDate, 'MMM d, yyyy') : 'No due date',
      assignedAgent: 'Planner',
      tags: ['New'],
    };
    setTaskList(prev => [task, ...prev]);
  };

  return (
    <div className="flex h-screen bg-[#15151b] overflow-hidden text-white font-sans selection:bg-[#FC90AF]/30">
      
      {/* LEFT SECTION (Sidebar + Main Content) */}
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

        {/* Main Tasks Area */}
        <main className="flex-1 p-8 pr-6 overflow-y-auto custom-scrollbar selection:bg-[#FC90AF]/30 ">
          <header className="flex justify-between items-end mb-10 ">
            <div>
              <h1 className="text-4xl font-black tracking-tight">Tasks</h1>
              <p className="text-gray-400 text-sm mt-1">Manage and track your automated agent pipeline.</p>
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#FC90AF] hover:bg-[#f985a6] text-[#15151b] font-bold rounded-2xl px-6 py-6 transition-all hover:scale-105"
            >
              <Plus className="mr-2 h-5 w-5" /> New Task
            </Button>
          </header>
        

{/* QUOTE GLASS BANNER */}
<motion.div 
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
  className="relative mb-12"
>
  <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-sm p-8">
    {/* Very subtle pink ambient light */}
    <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#FC90AF]/5 blur-[80px] rounded-full pointer-events-none" />
    
    <div className="relative z-10 flex flex-col items-start gap-1">
      <span className="text-[#FC90AF] text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">
        Current Protocol
      </span>
      
      <h2 className="imbue-bold text-3xl md:text-4xl text-white/90 leading-tight">
        "The best way to predict the future is to <span className="text-white">automate</span> it."
      </h2>
      
    </div>

    {/* Decorative corner accent */}
    <div className="absolute top-0 right-0 p-4 opacity-20">
      <div className="w-12 h-12 border-t border-r border-[#FC90AF] rounded-tr-2xl" />
    </div>
  </div>
</motion.div>
          {/* Search Bar */}
          <div className="bg-white/5 backdrop-blur-xl p-2 rounded-2xl flex items-center border border-white/10 mb-10 max-w-2xl">
            <Search className="ml-4 text-gray-500" size={18} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks or agents..." 
              className="bg-transparent border-none outline-none flex-1 px-4 py-2 text-white font-medium placeholder:text-gray-600"
            />
          </div>

        {/* SLIDING GLASS TABS */}
<Tabs 
  value={activeTab} 
  onValueChange={setActiveTab} 
  className="w-full mb-10"
>
  <TabsList className="bg-transparent border-none w-full justify-start rounded-none h-14 p-0 mb-8 flex gap-4 relative">
    {tabs.map((tab) => {
      // Calculate dynamic count for each tab
      const count = getTasksByStatus(tab.id).length;
      const isActive = activeTab === tab.id;

      return (
        <TabsTrigger
          key={tab.id}
          value={tab.id}
          className="relative z-20 h-full px-8 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 data-[state=active]:text-white text-gray-500"
        >
          {/* Label and Count - Stays on top of glass */}
          <span className="relative z-30 flex items-center gap-2">
            {tab.label} 
            <span className={`transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-40"}`}>
              ({count})
            </span>
          </span>
          
          {/* Sliding Glass and Pink Glow logic */}
          {isActive && (
            <motion.div
              layoutId="activeTabGlow"
              className="absolute inset-0 z-10 rounded-2xl overflow-hidden"
              initial={false}
              transition={{ 
                type: "spring", 
                bounce: 0.18, 
                duration: 0.5 
              }}
            >
              {/* Refractive Glass Layer */}
              <GlassSurface
                width="100%"
                height="100%"
                borderRadius={16}
                borderWidth={0}
                brightness={35}
                backgroundOpacity={0}
                blur={12}
      
              />

              {/* The Pink "Bloom" Glow - Bottom accent */}
              <div className="absolute inset-x-6 bottom-0 h-[2px] bg-[#FC90AF] blur-xl shadow-[0_-2px_15px_2px_#FC90AF]" />
              
              {/* Subtle Pink Overly to tint the glass */}
              {/* <div className="absolute inset-0 bg-[#FC90AF]/10 pointer-events-none" /> */}
            </motion.div>
          )}
        </TabsTrigger>
      );
    })}
  </TabsList>

  {/* Tabs Content Sections */}
  <AnimatePresence mode="wait">
    {tabs.map((tab) => (
      <TabsContent 
        key={tab.id} 
        value={tab.id} 
        className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-4 outline-none"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="contents"
        >
          {getTasksByStatus(tab.id).map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </motion.div>
      </TabsContent>
    ))}
  </AnimatePresence>
</Tabs>
        </main>
      </div>  

      {/* RIGHT PANEL */}
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

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={(newTask) => {
          handleCreateTask(newTask);
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  )
}

function TaskCard({ task }: { task: Task }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-[#1f1f2e] rounded-[2rem] p-6 border border-white/5 hover:border-[#FC90AF]/20 transition-all cursor-pointer overflow-hidden"
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="flex gap-4">
          <div className={`mt-1 p-3 rounded-2xl bg-black/20 ${task.status === 'completed' ? 'text-green-400' : 'text-[#FC90AF]'}`}>
            {task.status === 'completed' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
          </div>
          <div>
            <h3 className="text-lg font-bold group-hover:text-[#FC90AF] transition-colors">{task.title}</h3>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">{task.description}</p>
            
            <div className="flex flex-wrap gap-2 mt-6">
              <Badge className="bg-black/40 text-[10px] font-bold tracking-widest uppercase border-white/5 py-1 px-3">
                {task.priority}
              </Badge>
              <Badge variant="outline" className="border-white/10 text-[10px] text-gray-500 py-1 px-3 gap-2">
                <Calendar size={12} /> {task.dueDate}
              </Badge>
              <Badge className="bg-[#8F61DB]/10 text-[#8F61DB] text-[10px] border-none py-1 px-3">
                {task.assignedAgent}
              </Badge>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-white">
              <MoreHorizontal size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1f1f2e] border-white/10 text-white">
            <DropdownMenuItem className="hover:bg-white/5">Edit Task</DropdownMenuItem>
            <DropdownMenuItem className="text-red-400 hover:bg-red-400/10">Delete Task</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}