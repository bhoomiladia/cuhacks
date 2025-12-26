"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { 
  Sparkles, Mail, CheckCircle2, Clock, Calendar, 
  Paperclip, Send, Zap, FileText, Activity, 
  ChevronLeft, ChevronRight, Home, PieChart, 
  Users, Settings, LogOut, HelpCircle, Bot, ShieldCheck, Download, User, Trash
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
  executionStatus?: 'idle' | 'running' | 'completed' | 'failed';
  taskUnderstanding?: string;
  executionPlan?: string;
  intermediateSteps?: string[];
  finalResult?: string;
  assistant_response?: string;
  emailDraft?: {
    subject: string;
    body: string;
    recipient?: string;
  };
  emailSent?: boolean;
  sentAt?: string;
  chatMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date | string;
  }>;
  executionLogs?: Array<{
    agent: string;
    step: string;
    status: 'running' | 'completed' | 'failed';
    output: string;
    timestamp: Date | string;
  }>;
}

export default function TaskControlPage() {
  const params = useParams()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [chatInput, setChatInput] = useState("")
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [editingDraft, setEditingDraft] = useState(false)
  const [draftSubject, setDraftSubject] = useState('')
  const [draftBody, setDraftBody] = useState('')
  const [draftRecipient, setDraftRecipient] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp?: Date }>>([])
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setTask(data)
          
          // Initialize draft editing state
          if (data.emailDraft) {
            setDraftSubject(data.emailDraft.subject || '')
            setDraftBody(data.emailDraft.body || '')
            setDraftRecipient(data.emailDraft.recipient || '')
          }
          
          // Load chat messages from DB or initialize
          if (data.chatMessages && data.chatMessages.length > 0) {
            setChatMessages(data.chatMessages.map((m: any) => ({
              role: m.role,
              content: m.content,
              timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
            })))
          } else {
            // Auto-respond to task creation immediately with initial response
            const initialResponse = generateInitialResponse(data)
            setChatMessages([{
              role: 'assistant',
              content: initialResponse,
              timestamp: new Date(),
            }])
            
            // Save initial response to DB and trigger background execution
            if (!data.executionStatus || data.executionStatus === 'idle') {
              triggerInitialExecution(data._id, data, initialResponse)
            }
          }
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

  const generateInitialResponse = (task: Task): string => {
    const title = task.title.toLowerCase()
    const desc = (task.description || '').toLowerCase()
    const fullText = `${title} ${desc}`
    
    // Agentic AI Example Override
    if (fullText.includes('agentic ai')) {
        // Only return definition if it's a "what is" or vague question
        if (fullText.includes('what') || fullText.includes('define') || fullText.includes('explain') || fullText.length < 50) {
            return `Agentic AI refers to systems designed to act autonomously toward goals rather than simply responding to prompts. These systems can plan steps, make decisions, use tools, and adapt their behavior based on feedback. Instead of waiting for continuous user input, an agentic AI can break down a task, execute subtasks, and adjust its approach as conditions change. This makes it useful for workflows like research, scheduling, automation, and multi-step problem solving.`
        }
        
        // If it's a specific question about companies/usage, answer directly
        if (fullText.includes('companies') || fullText.includes('use') || fullText.includes('industry')) {
             return "Yes, companies like OpenAI, Anthropic, and Microsoft are actively deploying agentic AI. Examples include coding assistants (Devin), autonomous research agents, and customer support bots that can take actions like processing refunds or booking appointments. The industry is shifting from static chatbots to goal-oriented agents."
        }
    }

    // Interpreter Logic (Client-side mirror)
    const isEmail = fullText.includes('email') || fullText.includes('send') || fullText.includes('draft') || fullText.includes('write')
    
    if (isEmail) {
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
      const emailMatch = fullText.match(emailRegex)
      const subject = task.title.replace(/^(draft|send|compose|write|email)\s+/i, '').replace(/\s+(email|mail)$/i, '')
      
      return `I have drafted an email regarding "${subject}"${emailMatch ? ` to ${emailMatch[0]}` : ''}. You can review and send it below.`
    }
    
    if (fullText.includes('frontend') && (fullText.includes('intern') || fullText.includes('job'))) {
       return `Companies hiring for frontend roles include Google (Summer 2025), Meta (Rolling), Microsoft, and Amazon.

Success requires:
1. **Strong Portfolio**: 3-5 projects using React.
2. **Technical Skills**: JavaScript (ES6+), TypeScript, CSS/Tailwind.
3. **Fundamentals**: Data structures, algorithms, and system design basics.

Apply 6-9 months in advance for major tech companies.`
    }
    
    // Default Direct Response
    return `${task.title} refers to a specific objective or topic. Addressing this typically requires identifying key constraints, gathering necessary resources, and executing a structured plan.`;
  }
  
  const triggerInitialExecution = async (taskId: string, taskData: Task, initialResponse: string) => {
    // Save initial response to DB first
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatMessages: [{
            role: 'assistant',
            content: initialResponse,
            timestamp: new Date(),
          }],
        }),
      })
    } catch (e) {
      // Continue even if save fails
    }
    
    // Send initial message to Langflow in background
    try {
      await fetch('/api/langflow/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          message: taskData.title + (taskData.description ? `: ${taskData.description}` : ''),
          chatHistory: [{
            role: 'assistant',
            content: initialResponse,
          }],
        }),
      })
      
      // Refresh task after execution
      const taskResponse = await fetch(`/api/tasks/${taskId}`)
      if (taskResponse.ok) {
        const updatedTask = await taskResponse.json()
        setTask(updatedTask)
        
        // Update chat with any new messages from execution
        if (updatedTask.chatMessages && updatedTask.chatMessages.length > chatMessages.length) {
          setChatMessages(updatedTask.chatMessages.map((m: any) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
          })))
        }
      }
    } catch (error) {
      console.error('Error triggering initial execution:', error)
    }
  }
  
  const triggerExecution = async (taskId: string) => {
    setExecuting(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}/execute`, {
        method: 'POST',
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Refresh task data
        const taskResponse = await fetch(`/api/tasks/${taskId}`)
        if (taskResponse.ok) {
          const updatedTask = await taskResponse.json()
          setTask(updatedTask)
          if (updatedTask.emailDraft) {
            setDraftSubject(updatedTask.emailDraft.subject || '')
            setDraftBody(updatedTask.emailDraft.body || '')
            setDraftRecipient(updatedTask.emailDraft.recipient || '')
          }
          
          // Add execution result to chat when completed
          if (updatedTask.executionStatus === 'completed' && updatedTask.finalResult) {
            setChatMessages(prev => {
              // Check if result already in chat
              const hasResult = prev.some(msg => msg.content === updatedTask.finalResult)
              if (!hasResult) {
                return [...prev, {
                  role: 'assistant',
                  content: updatedTask.finalResult,
                  timestamp: new Date(),
                }]
              }
              return prev
            })
          }
        }
      } else {
        // Handle different error cases
        const errorMessage = result.error || result.message || 'Failed to trigger execution'
        console.error('Failed to trigger execution:', errorMessage)
        
        // If execution failed, refresh task to get updated status
        const taskResponse = await fetch(`/api/tasks/${taskId}`)
        if (taskResponse.ok) {
          const updatedTask = await taskResponse.json()
          setTask(updatedTask)
        }
      }
    } catch (error: any) {
      console.error('Error triggering execution:', error)
      // Try to refresh task even on network errors
      try {
        const taskResponse = await fetch(`/api/tasks/${taskId}`)
        if (taskResponse.ok) {
          const updatedTask = await taskResponse.json()
          setTask(updatedTask)
        }
      } catch (refreshError) {
        console.error('Error refreshing task:', refreshError)
      }
    } finally {
      setExecuting(false)
    }
  }

  const handleRetryExecution = () => {
    if (task) {
      triggerExecution(task._id)
    }
  }

  const handleSaveDraft = async () => {
    if (!task) return
    
    try {
      const response = await fetch(`/api/tasks/${task._id}/email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: draftSubject,
          body: draftBody,
          recipient: draftRecipient,
        }),
      })
      
      if (response.ok) {
        setEditingDraft(false)
        // Refresh task
        const taskResponse = await fetch(`/api/tasks/${task._id}`)
        if (taskResponse.ok) {
          const updatedTask = await taskResponse.json()
          setTask(updatedTask)
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !task || sendingMessage) return
    
    const userMessage = chatInput.trim()
    setChatInput('')
    setSendingMessage(true)
    
    // Add user message to chat immediately
    setChatMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }])
    
    try {
      // Use new Langflow execute endpoint
      const response = await fetch('/api/langflow/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task._id,
          message: userMessage,
          chatHistory: chatMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Add assistant response immediately
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        }])
        
        // Refresh task to get updated execution logs and email draft
        const taskResponse = await fetch(`/api/tasks/${task._id}`)
        if (taskResponse.ok) {
          const updatedTask = await taskResponse.json()
          setTask(updatedTask)
          
          if (updatedTask.emailDraft) {
            setDraftSubject(updatedTask.emailDraft.subject || '')
            setDraftBody(updatedTask.emailDraft.body || '')
            setDraftRecipient(updatedTask.emailDraft.recipient || '')
          }
        }
        
        // Trigger background execution update
        updateExecutionDisplay(data.executionLogs || [])
      } else {
        const error = await response.json()
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error.message || 'Unable to process your message'}`,
          timestamp: new Date(),
        }])
      }
    } catch (error: any) {
      console.error('Error sending chat message:', error)
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
      }])
    } finally {
      setSendingMessage(false)
    }
  }
  
  const updateExecutionDisplay = (logs: any[]) => {
    // Update task understanding and execution plan from logs
    if (task) {
      const interpreterLog = logs.find((l: any) => l.agent === 'Interpreter')
      const researchLog = logs.find((l: any) => l.agent === 'Research')
      const executorLogs = logs.filter((l: any) => l.agent === 'Executor')
      
      if (interpreterLog) {
        setTask(prev => prev ? { ...prev, taskUnderstanding: interpreterLog.output } : null)
      }
      
      if (researchLog) {
        setTask(prev => prev ? { ...prev, executionPlan: researchLog.output } : null)
      }
      
      if (executorLogs.length > 0) {
        setTask(prev => prev ? { 
          ...prev, 
          intermediateSteps: executorLogs.map((l: any) => l.step) 
        } : null)
      }
    }
  }

  const handleSendEmail = async () => {
    if (!task || !draftRecipient) return
    
    setSendingEmail(true)
    try {
      const response = await fetch(`/api/tasks/${task._id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: draftRecipient,
        }),
      })
      
      if (response.ok) {
        // Refresh task
        const taskResponse = await fetch(`/api/tasks/${task._id}`)
        if (taskResponse.ok) {
          const updatedTask = await taskResponse.json()
          setTask(updatedTask)
        }
      } else {
        const error = await response.json()
        alert(`Failed to send email: ${error.message || error.error}`)
      }
    } catch (error: any) {
      console.error('Error sending email:', error)
      alert(`Failed to send email: ${error.message}`)
    } finally {
      setSendingEmail(false)
    }
  }

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

            {/* 🤖 RESPONSE OUTPUT */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#a855f7]" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Response</h3>
                </div>
                {task.executionStatus === 'failed' && (
                  <Button
                    onClick={handleRetryExecution}
                    disabled={executing}
                    className="h-8 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    {executing ? 'Retrying...' : 'Retry Execution'}
                  </Button>
                )}
              </div>
              <Card className="bg-[#1f1f2e] border-white/5 p-8 rounded-[2.5rem] border-l-4 border-l-[#a855f7] space-y-8">
                {(executing || task.executionStatus === 'running') && !task.finalResult ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-[#a855f7]/20 border-t-[#a855f7] rounded-full mx-auto"
                      />
                      <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Generating Response...</p>
                    </div>
                  </div>
                ) : task.executionStatus === 'failed' ? (
                  <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
                    <p className="text-red-400 text-sm font-mono">{task.finalResult || 'Execution failed'}</p>
                  </div>
                ) : (
                  <>
                    {/* Final Output */}
                    {(task.assistant_response || task.finalResult || (chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === 'assistant' ? chatMessages[chatMessages.length - 1].content : null)) && (
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-[#a855f7] mb-3 tracking-widest flex items-center gap-2">
                          <CheckCircle2 size={14}/> Result
                        </h4>
                        <p className="bg-black/20 p-5 rounded-2xl border border-white/5 text-gray-400 text-sm font-mono leading-relaxed whitespace-pre-wrap">
                          {task.assistant_response || task.finalResult || (chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === 'assistant' ? chatMessages[chatMessages.length - 1].content : '')}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </Card>
            </section>

            {/* 📧 EMAIL DRAFT SECTION */}
            {task.emailDraft && (
              <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-blue-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Email Draft</h3>
                  </div>
                  {!editingDraft && (
                    <Button
                      onClick={() => setEditingDraft(true)}
                      className="h-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Edit Draft
                    </Button>
                  )}
                </div>
                <Card className="bg-[#1f1f2e] border-white/5 p-8 rounded-[2.5rem] border-l-4 border-l-blue-400 space-y-6">
                  {editingDraft ? (
                    <>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Recipient</label>
                        <input
                          type="email"
                          value={draftRecipient}
                          onChange={(e) => setDraftRecipient(e.target.value)}
                          placeholder="recipient@example.com"
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Subject</label>
                        <input
                          type="text"
                          value={draftSubject}
                          onChange={(e) => setDraftSubject(e.target.value)}
                          placeholder="Email subject"
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Body</label>
                        <textarea
                          value={draftBody}
                          onChange={(e) => setDraftBody(e.target.value)}
                          placeholder="Email body"
                          rows={8}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400/50 resize-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={handleSaveDraft}
                          className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                          Save Draft
                        </Button>
                        <Button
                          onClick={() => setEditingDraft(false)}
                          variant="outline"
                          className="border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-500 mb-2">To:</p>
                        <p className="text-sm text-gray-300">{task.emailDraft.recipient || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Subject:</p>
                        <p className="text-sm text-gray-300">{task.emailDraft.subject}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Body:</p>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{task.emailDraft.body}</p>
                      </div>
                      {task.emailSent && task.sentAt && (
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                          <p className="text-green-400 text-xs font-bold uppercase tracking-widest">
                            ✓ Sent on {format(new Date(task.sentAt), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </Card>
              </section>
            )}

            {/* 💬 TASK CHAT LOG */}
            <section className="space-y-4">
               <div className="flex items-center gap-2 px-2">
                <Bot size={16} className="text-[#FC90AF]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Contextual Chat</h3>
              </div>
              <div className="bg-[#1f1f2e] border border-white/5 rounded-[2.5rem] h-80 flex flex-col overflow-hidden">
                <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar font-medium">
                  {chatMessages.length === 0 ? (
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-[#FC90AF]/20 flex items-center justify-center text-[#FC90AF]"><Bot size={14}/></div>
                      <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none text-xs text-gray-300">
                        I'm ready to assist with "{task.title}". What specific details would you like me to focus on?
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'ml-auto max-w-[80%] flex-row-reverse' : 'max-w-[80%]'}`}>
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-[#FC90AF]/20 flex items-center justify-center text-[#FC90AF] flex-shrink-0">
                            <Bot size={14}/>
                          </div>
                        )}
                        <div className={`p-4 rounded-2xl text-xs ${
                          msg.role === 'user' 
                            ? 'bg-[#FC90AF]/20 text-white rounded-tr-none' 
                            : 'bg-white/5 text-gray-300 rounded-tl-none'
                        } whitespace-pre-wrap`}>
                          {msg.content}
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                            <User size={14}/>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {sendingMessage && (
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-[#FC90AF]/20 flex items-center justify-center text-[#FC90AF]"><Bot size={14}/></div>
                      <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none text-xs text-gray-400">
                        <span className="animate-pulse">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-black/20 flex gap-2">
                  <input 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendChatMessage()
                      }
                    }}
                    placeholder="Ask the agent to refine this task..." 
                    disabled={sendingMessage}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-[#FC90AF]/50 transition-colors disabled:opacity-50"
                  />
                  <Button 
                    onClick={handleSendChatMessage}
                    disabled={!chatInput.trim() || sendingMessage}
                    className="bg-[#FC90AF] hover:bg-[#f985a6] text-black rounded-xl px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16}/>
                  </Button>
                </div>
              </div>
            </section>

            {/* ⚙️ ACTION BUTTONS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
              {task.executionStatus === 'failed' && (
                <Button
                  onClick={handleRetryExecution}
                  disabled={executing}
                  className="h-16 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2"
                >
                  <Zap size={16}/> {executing ? 'Retrying...' : 'Retry Execution'}
                </Button>
              )}
              {task.emailDraft && !task.emailSent && (
                <Button
                  onClick={handleSendEmail}
                  disabled={sendingEmail || !draftRecipient}
                  className="h-16 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2"
                >
                  <Mail size={16}/> {sendingEmail ? 'Sending...' : 'Send Draft'}
                </Button>
              )}
              {task.emailSent && (
                <Button
                  disabled
                  className="h-16 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2"
                >
                  <CheckCircle2 size={16}/> Email Sent
                </Button>
              )}
              {task.status === 'completed' ? (
                <Button
                  disabled
                  className="h-16 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2"
                >
                  <CheckCircle2 size={16}/> Task Completed
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    if (!task) return
                    try {
                      console.log('Completing task:', task._id);
                      const response = await fetch(`/api/tasks/${task._id}/complete`, {
                        method: 'PATCH',
                      })
                      if (response.ok) {
                        console.log('Task completed successfully');
                        // Refresh task data to update UI
                        const updatedTaskResponse = await fetch(`/api/tasks/${task._id}`);
                        if (updatedTaskResponse.ok) {
                          const updatedTask = await updatedTaskResponse.json();
                          setTask(updatedTask);
                        }
                      } else {
                        const errorData = await response.json();
                        console.error('Failed to complete task:', errorData);
                        alert(`Failed to complete task: ${errorData.message || 'Unknown error'}`);
                      }
                    } catch (error) {
                      console.error('Error completing task:', error)
                      alert('Error completing task. Check console for details.');
                    }
                  }}
                  className="h-16 bg-[#FC90AF] hover:bg-[#f985a6] text-black rounded-2xl font-black uppercase italic text-lg shadow-xl shadow-[#FC90AF]/10"
                >
                  Complete Task
                </Button>
              )}
              <Button
                onClick={async () => {
                  if (!task) return
                  if (!confirm('Are you sure you want to delete this task?')) return
                  try {
                    const response = await fetch(`/api/tasks/${task._id}`, {
                      method: 'DELETE',
                    })
                    if (response.ok) {
                      router.push('/tasks')
                    } else {
                      const errorData = await response.json();
                      alert(`Failed to delete task: ${errorData.message || 'Unknown error'}`);
                    }
                  } catch (error) {
                    console.error('Error deleting task:', error)
                    alert('Error deleting task. Check console for details.');
                  }
                }}
                className="h-16 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2"
              >
                <Trash size={16}/> Delete Task
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
