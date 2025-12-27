"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Home, CheckSquare, Mail, Users, ChevronLeft, ChevronRight,
  Brain, ListTree, Zap, CheckCircle, Activity, TrendingUp, 
  Clock, Plus, Settings, X, Cpu, ShieldCheck, BarChart3, Search,
  Terminal, Database, Radio, Waypoints, Fingerprint
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/Sidebar"
import { RightPanel } from "@/components/RightPanel"
import { format } from 'date-fns'

const agentIcons: { [key: string]: any } = {
  Interpreter: Brain,
  Planner: ListTree,
  Executor: Zap,
}

const agentColors: { [key: string]: string } = {
  Interpreter: "#FC90AF",
  Planner: "#a855f7",
  Executor: "#4ade80",
}

const agentModels: { [key: string]: string } = {
  Interpreter: "K-Alpha-7",
  Planner: "Logic-Grip-v2",
  Executor: "Action-Sync",
}

const agentMemory: { [key: string]: string } = {
  Interpreter: "128GB Flash",
  Planner: "256GB Unified",
  Executor: "512GB High-Speed",
}

const agentCapabilities: { [key: string]: string[] } = {
  Interpreter: ["Semantic Parsing", "Multi-lingual Context", "Entity Extraction", "Tone Mapping"],
  Planner: ["DAG Generation", "Resource Estimation", "Backtracking Logic"],
  Executor: ["OAuth3 Handshaking", "Rate-limit handling", "Parallel Execution"],
}

export default function AgentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [agents, setAgents] = useState<any[]>([])
  const [systemStats, setSystemStats] = useState<any>(null)
  const [recentExecutions, setRecentExecutions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgentStats()
    const interval = setInterval(fetchAgentStats, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchAgentStats = async () => {
    try {
      const response = await fetch('/api/agents/stats')
      if (response.ok) {
        const data = await response.json()
        
        // Map agent data with icons and metadata
        const mappedAgents = data.agents.map((agent: any) => ({
          ...agent,
          icon: agentIcons[agent.name] || Brain,
          color: agentColors[agent.name] || "#FC90AF",
          model: agentModels[agent.name] || "Unknown",
          memory: agentMemory[agent.name] || "Unknown",
          capabilities: agentCapabilities[agent.name] || [],
          description: agent.name === 'Interpreter' 
            ? "Translates human ambiguity into machine-executable directives."
            : agent.name === 'Planner'
            ? "The architect of complexity. Decomposes high-level goals into logic."
            : "The hands of the system. Direct API manipulation and tool usage.",
        }))
        
        setAgents(mappedAgents)
        setSystemStats(data.systemStats)
        setRecentExecutions(data.recentExecutions || [])
      }
    } catch (error) {
      console.error('Error fetching agent stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAgentClick = (agent: any) => {
    setSelectedAgent(agent)
    setIsDetailOpen(true)
  }

  // Generate execution logs from recent executions
  const executionLogs = recentExecutions.slice(0, 5).map((exec, i) => ({
    id: i + 1,
    type: exec.status === 'completed' ? 'success' : exec.status === 'failed' ? 'error' : 'process',
    text: `${exec.status === 'completed' ? '✓' : exec.status === 'failed' ? '✗' : '→'} ${exec.title}`,
    time: exec.completedAt 
      ? `${((new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime()) / 1000).toFixed(2)}s`
      : 'running...',
  }))

  return (
    <div className="flex h-screen bg-[#15151b] overflow-hidden text-white font-sans selection:bg-[#FC90AF]/30">
      
     <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        
        <motion.div 
          animate={{ width: isDetailOpen ? "45%" : "100%" }}
          className="h-full flex flex-col bg-[#15151b] border-r border-white/5 overflow-y-auto no-scrollbar relative"
        >
          <header className="p-10 pb-6">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">Neural <span className="text-[#FC90AF]">Cluster</span></h1>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                  <Radio size={12} className="text-[#4ade80] animate-pulse" /> Live Cluster Performance
                </div>
              </div>
              <Button size="icon" variant="outline" className="border-white/5 rounded-2xl bg-white/5"><Settings size={18}/></Button>
            </div>

            {/* Detailed System Header Grid */}
            <div className="grid grid-cols-4 gap-4 mb-10">
                {[
                  { label: "Active Nodes", val: systemStats?.runningTasks?.toString() || "0", icon: Waypoints, color: "#FC90AF" },
                  { label: "Total Tokens", val: systemStats?.totalTokens || "1.2M", icon: Database, color: "#a855f7" },
                  { label: "System Health", val: systemStats ? `${systemStats.systemHealth}%` : "100%", icon: ShieldCheck, color: "#4ade80" },
                  { label: "Total Tasks", val: systemStats?.totalTasks?.toString() || "0", icon: Clock, color: "#3b82f6" },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#1f1f2e] p-5 rounded-[2rem] border border-white/5 group hover:border-[#FC90AF]/30 transition-colors">
                      <stat.icon size={16} style={{ color: stat.color }} className="mb-3" />
                      <p className="text-xl font-black tracking-tighter">{stat.val}</p>
                      <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">{stat.label}</p>
                  </div>
                ))}
            </div>
          </header>

          <div className="px-10 pb-10 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-[#FC90AF]/20 border-t-[#FC90AF] rounded-full mx-auto"
                  />
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Loading Agent Data...</p>
                </div>
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">No agent executions yet</p>
                <p className="text-gray-600 text-xs mt-2">Create a task to see agent activity</p>
              </div>
            ) : (
              agents.map((agent) => (
              <motion.div
                key={agent.name}
                onClick={() => handleAgentClick(agent)}
                className={`group p-8 rounded-[2.5rem] cursor-pointer transition-all border ${selectedAgent?.name === agent.name ? 'bg-[#FC90AF]/5 border-[#FC90AF]/30 shadow-[0_0_40px_-15px_rgba(252,144,175,0.1)]' : 'bg-[#1f1f2e] border-white/5 hover:border-white/10'}`}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-[#15151b] border border-white/10 flex items-center justify-center shadow-inner" style={{ color: agent.color }}>
                      <agent.icon size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black italic uppercase tracking-tighter group-hover:text-[#FC90AF] transition-colors">{agent.name}</h3>
                      <div className="flex gap-4 mt-1">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <Fingerprint size={12} style={{ color: agent.color }} /> {agent.model}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black">{agent.successRate}%</p>
                    <p className="text-[9px] text-gray-600 uppercase font-black">Accuracy</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-8 items-center">
                   <div className="space-y-2">
                     <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500">
                       <span>Thread Load</span>
                       <span>{agent.currentLoad}%</span>
                     </div>
                     <div className="h-2 w-full bg-[#15151b] rounded-full overflow-hidden p-[2px]">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${agent.currentLoad}%` }} className="h-full rounded-full shadow-[0_0_10px]" style={{ backgroundColor: agent.color, boxShadow: `0 0 10px ${agent.color}55` }} />
                     </div>
                   </div>
                   <div className="flex justify-end gap-2">
                     {agent.capabilities.slice(0, 2).map((c: string) => (
  <span key={c} className="text-[8px] font-black uppercase tracking-tighter px-3 py-1 bg-white/5 border border-white/5 rounded-full text-gray-500">
    {c}
  </span>
))}
                   </div>
                </div>
              </motion.div>
            )))}
          </div>
        </motion.div>

        {/* 3. DETAILED HALF-OPEN VIEW */}
        <AnimatePresence>
          {isDetailOpen && selectedAgent && (
            <motion.div 
              initial={{ width: 0 }} animate={{ width: "55%" }} exit={{ width: 0 }}
              className="h-full bg-[#23232f] border-l border-white/10 flex flex-col overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-8">
                 <button onClick={() => setIsDetailOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors border border-white/5">
                    <X size={20}/>
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-20 h-20 rounded-[2rem] bg-[#15151b] border-2 border-white/5 flex items-center justify-center shadow-2xl" style={{ color: selectedAgent.color }}>
                      <selectedAgent.icon size={40} />
                   </div>
                   <div>
                      <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-1">{selectedAgent.name}</h2>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-[#4ade80]/10 text-[#4ade80] border-none text-[10px] font-black uppercase px-3 py-1">Operational</Badge>
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">{selectedAgent.memory}</span>
                      </div>
                   </div>
                </div>

                {/* Sub-Detailed Stats */}
                <div className="grid grid-cols-3 gap-6 mb-12">
                   {[
                     { l: "Tasks Total", v: selectedAgent.tasksProcessed, i: BarChart3 },
                     { l: "Avg Latency", v: selectedAgent.avgResponseTime, i: Clock },
                     { l: "Stability", v: "High", i: ShieldCheck }
                   ].map((s, i) => (
                     <div key={i} className="bg-[#15151b]/50 p-6 rounded-3xl border border-white/5">
                        <s.i size={16} className="text-gray-600 mb-3" />
                        <p className="text-2xl font-black">{s.v}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{s.l}</p>
                     </div>
                   ))}
                </div>

                {/* Live Console Output */}
                <div className="mb-12">
                   <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FC90AF]">Agent Execution Feed</h4>
                      <div className="w-2 h-2 rounded-full bg-[#FC90AF] animate-pulse" />
                   </div>
                   <div className="bg-[#15151b] rounded-3xl border border-white/10 p-6 font-mono text-[11px] space-y-3 shadow-inner">
                      {executionLogs.map(log => (
                        <div key={log.id} className="flex gap-4">
                           <span className="text-gray-700">[{log.time}]</span>
                           <span className={log.type === 'success' ? 'text-[#4ade80]' : 'text-gray-400'}>{log.text}</span>
                        </div>
                      ))}
                      <div className="flex gap-4 animate-pulse">
                         <span className="text-gray-700">[---]</span>
                         <span className="text-white">Awaiting next directive..._</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Resource Allocation</h4>
                   <Progress value={selectedAgent.currentLoad} className="h-12 bg-[#15151b] rounded-2xl border border-white/5 overflow-hidden shadow-inner" />
                </div>
              </div>

              <div className="p-10 border-t border-white/5 bg-[#15151b]/30 flex gap-4">
                 <Button className="flex-1 bg-[#FC90AF] text-black h-14 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-[#FC90AF]/10 hover:scale-[1.02] transition-transform">Neural Override</Button>
                 <Button variant="outline" className="h-14 w-14 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10"><Settings size={20}/></Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

   <RightPanel isRightPanelOpen={isRightPanelOpen} setIsRightPanelOpen={setIsRightPanelOpen} />
    </div>
  )
}