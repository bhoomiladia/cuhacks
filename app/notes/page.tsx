"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Send, BrainCircuit, Zap, Target, Activity, 
  Quote, Sparkles, Loader2, StickyNote, Home, Users,
  ChevronLeft, ChevronRight
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {Sidebar} from "@/components/Sidebar"
import {RightPanel} from "@/components/RightPanel"

export default function NeuralNotesPage() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [noteInput, setNoteInput] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // 1. Fetch Today's Analysis & Stream
  const fetchDailyData = async () => {
    try {
      const res = await fetch('/api/analysis')
      const result = await res.json()
      setData(result)
    } catch (err) {
      console.error("Failed to fetch analysis", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDailyData()
  }, [])

  // 2. Handle New Note Submission
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteInput.trim()) return

    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteInput })
      })
      
      if (res.ok) {
        setNoteInput("")
        // Refresh the whole analysis so the AI narrative updates
        await fetchDailyData()
      }
    } catch (err) {
      console.error("Error posting note", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#15151b] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FC90AF]" size={40} />
      </div>
    )
  }
  return (
    <div className="flex h-screen bg-[#15151b] text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
    <Sidebar isSidebarOpen={isSidebarOpen}
    setIsSidebarOpen={setIsSidebarOpen}/>
      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-10">
        
        {/* HEADER & AI SUMMARY */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-[#FC90AF]/10 flex items-center justify-center border border-[#FC90AF]/20">
                  <BrainCircuit size={24} className="text-[#FC90AF]" />
               </div>
               <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">Neural <span className="text-[#FC90AF]">Analysis</span></h2>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Integrated Task & Thought Stream</p>
               </div>
            </div>
            <div className="text-right">
               <div className="text-4xl font-black italic text-[#4ade80]">{data?.score || 0}<span className="text-xs uppercase not-italic text-gray-600 ml-1">/100</span></div>
               <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Efficiency Score</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={data?.narrative}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              <div className="lg:col-span-3 bg-[#1f1f2e] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
                <Quote className="absolute top-6 right-6 text-white/5" size={60} />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#FC90AF] mb-4">Daily Narrative</h3>
                <p className="text-sm text-gray-300 font-bold leading-relaxed italic relative z-10">
                   "{data?.narrative || "System awaiting user input to generate daily synopsis..."}"
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#1f1f2e] border border-white/5 p-6 rounded-[2rem]">
                   <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">Status</p>
                   <div className="flex items-center gap-2 text-[#4ade80]">
                      <Activity size={14} />
                      <span className="text-xs font-black uppercase italic">Optimal</span>
                   </div>
                </div>
                <div className="bg-[#1f1f2e] border border-white/5 p-6 rounded-[2rem]">
                   <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">Thought Nodes</p>
                   <p className="text-2xl font-black italic uppercase">
                     {data?.activityStream?.filter((i: any) => i.type === 'note').length || 0}
                   </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* INPUT AREA */}
        <section className="mb-12">
          <form onSubmit={handleAddNote} className="relative group">
            <div className={`absolute inset-0 bg-[#FC90AF]/5 blur-2xl transition-opacity ${isAnalyzing ? 'opacity-100' : 'opacity-0'}`} />
            <div className="relative bg-[#1f1f2e] border border-white/10 p-2 rounded-[2rem] flex items-center">
              <input 
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder={isAnalyzing ? "Gemini is analyzing..." : "Log a thought to update the analysis..."}
                disabled={isAnalyzing}
                className="flex-1 bg-transparent py-5 px-6 outline-none text-sm font-bold text-white placeholder:text-gray-700 disabled:opacity-50"
              />
              <Button 
                type="submit"
                disabled={isAnalyzing}
                className="h-12 w-12 rounded-2xl bg-[#FC90AF] text-black hover:scale-105 transition-all flex items-center justify-center"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </Button>
            </div>
          </form>
        </section>

        {/* ACTIVITY STREAM */}
        <section className="space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700 px-4">Daily Activity Stream</h3>
           <div className="space-y-4 pb-20">
              {data?.activityStream?.map((item: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={item._id || i} 
                  className="flex gap-6 group"
                >
                   <div className="text-[10px] font-black text-gray-700 pt-5 min-w-[40px]">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </div>
                   <div className={`flex-1 p-6 rounded-[2rem] border transition-all ${item.type === 'task' ? 'bg-[#4ade80]/5 border-[#4ade80]/10' : 'bg-[#1f1f2e] border-white/5'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${item.type === 'task' ? 'bg-[#4ade80]/20 text-[#4ade80]' : 'bg-[#FC90AF]/10 text-[#FC90AF]'}`}>
                           {item.type === 'task' ? `Task: ${item.status}` : `Note: ${item.category || 'Thought'}`}
                        </span>
                        {item.sentiment === 'high' && <Sparkles size={12} className="text-[#FC90AF]" />}
                      </div>
                      <p className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors leading-relaxed">
                        {item.type === 'task' ? item.title : item.content}
                      </p>
                      {item.aiSummary && (
                        <p className="mt-3 text-[10px] text-gray-600 font-black italic uppercase tracking-tighter">
                          AI Insight: {item.aiSummary}
                        </p>
                      )}
                   </div>
                </motion.div>
              ))}
           </div>
        </section>
      </main>
      <RightPanel isRightPanelOpen={isRightPanelOpen}
      setIsRightPanelOpen={setIsRightPanelOpen}/>
    </div>
  )
}