"use client"

import { Sidebar } from "@/components/Sidebar"; // Add this line
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Search, Filter, CheckCircle2, 
  Clock, Calendar, MoreHorizontal, 
  ChevronLeft, ChevronRight, Home,
  PieChart, Users, Settings, LogOut,
  Mail, FileText, Activity, ShieldCheck, CheckSquare, HelpCircle, Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs"
import { TabsList } from "@/components/ui/glass/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateTaskModal } from "@/components/create-task-modal"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from 'date-fns'
import  GlassSurface  from "@/components/GlassSurface"

// --- Types ---
interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedAgent: string;
  tags: string[];
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

export default function TasksPage() {
  // --- State Management ---
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();

  // --- Fetch Tasks ---
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks');
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setTaskList(data);
      } else {
        console.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Logic: Filtering ---
  const filteredTasks = taskList.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTasksByStatus = (status: string) => {
    if (status === "all") return filteredTasks;
    if (status === "progress") return filteredTasks.filter(t => t.status === "in-progress");
    return filteredTasks.filter(t => t.status === status);
  };

  const tabs = [
    { id: "all", label: "All Tasks" },
    { id: "pending", label: "Pending" },
    { id: "progress", label: "In Progress" },
    { id: "completed", label: "Completed" }
  ];

  // --- Logic: Create Task ---
  const handleCreateTask = async (newTask: {
    title: string;
    description: string;
    dueDate: Date | null;
    priority: 'low' | 'medium' | 'high';
    file: File | null;
  }) => {
    try {
      const formData = new FormData();
      formData.append('title', newTask.title);
      formData.append('description', newTask.description);
      formData.append('priority', newTask.priority);
      if (newTask.dueDate) {
        formData.append('dueDate', newTask.dueDate.toISOString());
      }
      if (newTask.file) {
        formData.append('file', newTask.file);
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        fetchTasks(); // Refresh list
        setIsCreateModalOpen(false);
      } else {
        console.error('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const displayedTasks = getTasksByStatus(activeTab);

  return (
      <div className="flex h-screen bg-[#15151b] overflow-hidden text-white font-sans selection:bg-[#FC90AF]/30">
        
        {/* LEFT SECTION (Sidebar + Main Content) */}
        <div className="flex-1 flex bg-[#23232f] rounded-r-[3rem] z-10 shadow-2xl overflow-hidden relative">
          
          {/* Navigation Sidebar */}
          <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

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
                const count = getTasksByStatus(tab.id).length;
                const isActive = activeTab === tab.id;

                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="relative z-20 h-full px-8 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 data-[state=active]:text-white text-gray-500"
                  >
                    <span className="relative z-30 flex items-center gap-2">
                      {tab.label} 
                      <span className={`transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-40"}`}>
                        ({count})
                      </span>
                    </span>
                    
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
                        <GlassSurface
                          width="100%"
                          height="100%"
                          baseColor="rgba(255, 255, 255, 0.05)"
                          highlightColor="rgba(255, 255, 255, 0.1)"
                          shadowColor="rgba(0, 0, 0, 0.2)"
                          borderOpacity={0.1}
                          blur={10}
                        />
                        <div className="absolute inset-0 bg-[#FC90AF]/10 mix-blend-overlay" />
                      </motion.div>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="text-center py-20 text-gray-500">Loading tasks...</div>
                ) : displayedTasks.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 gap-4"
                  >
                    {displayedTasks.map((task) => (
                      <div 
                        key={task._id} 
                        onClick={() => router.push(`/tasks/${task._id}`)}
                        className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#1a1a23] hover:bg-[#1f1f2a] transition-all duration-300 p-6 flex items-center gap-6 cursor-pointer"
                      >
                        {/* Status Indicator */}
                        <div className={`w-1.5 h-16 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.3)]' :
                          task.status === 'in-progress' ? 'bg-[#FC90AF]/80 shadow-[0_0_10px_rgba(252,144,175,0.3)]' :
                          'bg-gray-700/50'
                        }`} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-white truncate">{task.title}</h3>
                            <Badge variant="outline" className={`
                              border-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 h-5
                              ${task.priority === 'high' ? 'bg-red-500/10 text-red-400' : 
                                task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 
                                'bg-blue-500/10 text-blue-400'}
                            `}>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm truncate">{task.description}</p>
                          
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Calendar size={14} />
                              <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Users size={14} />
                              <span>{task.assignedAgent}</span>
                            </div>
                            {task.fileUrl && (
                                <a 
                                  href={task.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs text-[#FC90AF] hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Download size={14} />
                                  <span>{task.fileName || 'Attachment'}</span>
                                </a>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white hover:bg-white/5 rounded-full">
                          <MoreHorizontal size={20} />
                        </Button>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                   <div className="text-center py-20">
                     <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                       <CheckSquare className="text-gray-600" size={32} />
                     </div>
                     <h3 className="text-lg font-bold text-gray-300">No tasks found</h3>
                     <p className="text-gray-500 text-sm mt-1">Create a new task to get started</p>
                   </div>
                )}
              </TabsContent>
            </AnimatePresence>
          </Tabs>

        </main>
      </div>

      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSave={handleCreateTask}
      />

    </div>
  )
}
