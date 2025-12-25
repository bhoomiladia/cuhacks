"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { 
  Sparkles, Mail, CheckCircle2, Clock, Calendar, 
  Paperclip, Send, Zap, FileText, Activity, 
  ChevronLeft, ChevronRight, Home, PieChart, 
  Users, Settings, LogOut, HelpCircle, Bot, ShieldCheck, Download
} from "lucide-react"
import { Sidebar } from '@/components/Sidebar'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RightPanel } from '@/components/RightPanel'
import { format } from 'date-fns'

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

export default function TaskControlPage() {
  const params = useParams()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [chatInput, setChatInput] = useState("")
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setTask(data)
        } else {
          console.error('Failed to fetch task')
        }
      } catch (error) {
        console.error('Error fetching task:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id) {
      fetchTask()
    }
  }, [params.id])

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#15151b] text-white">Loading task...</div>
  }

  if (!task) {
    return <div className="flex h-screen items-center justify-center bg-[#15151b] text-white">Task not found</div>
  }

  return (
    <div className="flex h-screen bg-[#15151b] overflow-hidden text-white font-sans selection:bg-[#FC90AF]/30">
      
      {/* LEFT SECTION (Sidebar + Main Content) */}
      <div className="flex-1 flex bg-[#23232f] rounded-r-[3rem] z-10 shadow-2xl overflow-hidden relative border-r border-white/5">
        
      <Sidebar 
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}/>
    
        <main className="flex-1 p-8 pr-10 overflow-y-auto custom-scrollbar bg-[#15151b]">
          
          {/* Header */}
          <header className="flex justify-between items-start mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-white/5 text-gray-500 border-white/10 font-mono tracking-tighter">TASK-{task._id.slice(-6).toUpperCase()}</Badge>
                <Badge className={`
                  border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest
                  ${task.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                    task.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-gray-500/10 text-gray-400'}
                `}>
                  {task.status}
                </Badge>
                <Badge className={`
                  border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest
                  ${task.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                    task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-blue-500/10 text-blue-400'}
                `}>
                  {task.priority} Priority
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">
               TASK CONTROL
              </h1>
              <div className="flex gap-4 mt-4 text-xs text-gray-500 font-bold uppercase tracking-widest">
                 <span className="flex items-center gap-1.5">
                   <Calendar size={14} className="text-[#FC90AF]"/> 
                   Due {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No Date'}
                 </span>
                 <span className="flex items-center gap-1.5"><Clock size={14}/> Created {format(new Date(task.createdAt), 'MMM d')}</span>
              </div>
            </div>
            <Button onClick={() => router.push('/tasks')} variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest">
              <ChevronLeft className="mr-2" size={16}/> Exit Task
            </Button>
          </header>

          <div className="space-y-12 max-w-5xl">
            
            {/* 📝 TASK CONTEXT (Refractive Glass) */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <FileText size={16} className="text-[#FC90AF]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">User Context</h3>
              </div>
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-md p-8">
                <h4 className="text-2xl font-bold text-white mb-4">{task.title}</h4>
                <p className="text-xl text-gray-200 leading-relaxed italic mb-6">
                  "{task.description || "No description provided."}"
                </p>
                {task.fileUrl && (
                  <div className="flex gap-3">
                    <a 
                      href={task.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-2 rounded-xl text-[10px] font-bold text-gray-400 hover:border-[#FC90AF]/40 cursor-pointer transition-all"
                    >
                      <Paperclip size={12} className="text-[#FC90AF]"/> {task.fileName || 'Attachment'}
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* 🤖 AGENT INTELLIGENCE OUTPUT */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Sparkles size={16} className="text-[#a855f7]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Agent Intelligence</h3>
              </div>
              <Card className="bg-[#1f1f2e] border-white/5 p-8 rounded-[2.5rem] border-l-4 border-l-[#a855f7] space-y-8">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-[#a855f7] mb-3 tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14}/> Task Understanding
                  </h4>
                  <p className="bg-black/20 p-5 rounded-2xl border border-white/5 text-gray-400 text-sm font-mono leading-relaxed">
                    Analyzing input for: {task.title}. Extracting key requirements. Generating execution plan based on {task.priority} priority.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Data Ingestion', 'Trend Analysis', 'Slide Drafting'].map((step, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="h-8 w-8 rounded-lg bg-[#a855f7]/20 text-[#a855f7] flex items-center justify-center text-xs font-black">0{i+1}</div>
                      <span className="text-[10px] font-black uppercase tracking-tighter">{step}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            {/* 💬 TASK CHAT LOG */}
            <section className="space-y-4">
               <div className="flex items-center gap-2 px-2">
                <Bot size={16} className="text-[#FC90AF]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Contextual Chat</h3>
              </div>
              <div className="bg-[#1f1f2e] border border-white/5 rounded-[2.5rem] h-80 flex flex-col overflow-hidden">
                <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar font-medium">
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-[#FC90AF]/20 flex items-center justify-center text-[#FC90AF]"><Bot size={14}/></div>
                    <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none text-xs text-gray-300">
                      I'm ready to assist with "{task.title}". What specific details would you like me to focus on?
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-black/20 flex gap-2">
                  <input 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask the agent to refine this task..." 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-[#FC90AF]/50 transition-colors"
                  />
                  <Button className="bg-[#FC90AF] hover:bg-[#f985a6] text-black rounded-xl px-4"><Send size={16}/></Button>
                </div>
              </div>
            </section>

            {/* ⚙️ ACTION BUTTONS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
              <Button className="h-16 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2">
                <Zap size={16} className="text-[#a855f7]"/> Re-Run AI
              </Button>
              <Button className="h-16 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2">
                <Mail size={16} className="text-blue-400"/> Send Draft
              </Button>
              <Button className="h-16 bg-[#FC90AF] hover:bg-[#f985a6] text-black rounded-2xl font-black uppercase italic text-lg shadow-xl shadow-[#FC90AF]/10">
                Complete Task
              </Button>
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
