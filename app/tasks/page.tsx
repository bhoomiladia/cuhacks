"use client"

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Clock, Calendar, Search, Plus, Filter, MoreHorizontal, RefreshCw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from 'date-fns';
import { getTasks } from '@/lib/speechToText';
import { Textarea } from '@/components/ui/textarea';

interface Task {
  id: string | number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedAgent: string;
  tags: string[];
  source?: string;
  createdAt?: string;
}

const initialTasks = [
  {
    id: 1,
    title: "Prepare quarterly business review presentation",
    description: "Create slides covering Q4 metrics, team achievements, and Q1 goals",
    status: "in-progress" as const,
    priority: "high" as const,
    dueDate: "Tomorrow",
    assignedAgent: "Executor",
    tags: ["presentation", "business"],
  },
  {
    id: 2,
    title: "Send follow-up emails to prospective clients",
    description: "Personalized follow-ups to 12 leads from last week's conference",
    status: "pending" as const,
    priority: "medium" as const,
    dueDate: "Today",
    assignedAgent: "Planner",
    tags: ["email", "sales"],
  },
  {
    id: 3,
    title: "Review and approve team vacation requests",
    description: "Process 5 pending vacation requests for January",
    status: "pending" as const,
    priority: "low" as const,
    dueDate: "This Week",
    assignedAgent: "Verifier",
    tags: ["hr", "admin"],
  },
  {
    id: 4,
    title: "Update customer database with new contacts",
    description: "Import 47 new contacts from recent trade show",
    status: "completed" as const,
    priority: "medium" as const,
    dueDate: "Yesterday",
    assignedAgent: "Executor",
    tags: ["database", "crm"],
  },
  {
    id: 5,
    title: "Schedule Q1 planning meetings with department heads",
    description: "Coordinate calendars and book conference rooms for 6 meetings",
    status: "completed" as const,
    priority: "high" as const,
    dueDate: "2 days ago",
    assignedAgent: "Planner",
    tags: ["scheduling", "meetings"],
  },
]

export default function TasksPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskList, setTaskList] = useState<Array<Task>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadStoredTasks = () => {
      try {
        const storedTasks = getTasks();
        setTaskList(storedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setTaskList(initialTasks);
      }
    };

    loadStoredTasks();
    
    // Listen for storage events from other tabs
    const handleStorageChange = () => loadStoredTasks();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const pendingTasks = taskList.filter((t) => t.status === "pending");
  const inProgressTasks = taskList.filter((t) => t.status === "in-progress");
  const completedTasks = taskList.filter((t) => t.status === "completed");

  const handleCreateTask = (newTask: {
    title: string;
    description: string;
    dueDate: Date | null;
    priority: 'low' | 'medium' | 'high';
  }) => {
    const task: Task = {
      id: `local-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      status: 'pending',
      priority: newTask.priority,
      dueDate: newTask.dueDate ? format(newTask.dueDate, 'MMM d, yyyy') : 'No due date',
      assignedAgent: 'Planner',
      tags: ['new'],
      source: 'manual',
      createdAt: new Date().toISOString()
    };

    // Add to local storage
    const updatedTasks = [task, ...taskList];
    if (typeof window !== 'undefined') {
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    }
    setTaskList(updatedTasks);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    try {
      const storedTasks = getTasks();
      setTaskList(storedTasks);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredTasks = taskList.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">Manage and track all your automated tasks</p>
          </div>
          <Button
            className="gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6 border-2 border-border bg-card p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search tasks..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </Card>

        {/* Tasks Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="all">All ({taskList.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="progress">In Progress ({inProgressTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            {inProgressTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateTask({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : null,
                priority: (formData.get('priority') as 'low' | 'medium' | 'high') || 'medium'
              });
              setIsCreateModalOpen(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input name="title" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea 
                    name="description" 
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <Input name="dueDate" type="datetime-local" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select 
                    name="priority"
                    className="w-full p-2 border rounded-md"
                    defaultValue="medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Task
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}

function TaskCard({ task }: { task: Task }) {
  // Ensure tags is always an array
  const tags = Array.isArray(task.tags) ? task.tags : [];
  
  return (
    <Card className="border-2 border-border bg-card p-6 transition-all hover:border-primary/50">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {task.status === "completed" && <CheckCircle2 className="h-6 w-6 text-green-400" />}
            {task.status === "in-progress" && <Clock className="h-6 w-6 text-primary" />}
            {task.status === "pending" && <Calendar className="h-6 w-6 text-yellow-400" />}
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold">{task.title}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{task.description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                }
              >
                {task.priority}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                {task.dueDate || 'No due date'}
              </Badge>
              <Badge variant="outline">{task.assignedAgent || 'Unassigned'}</Badge>
              {tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Task</DropdownMenuItem>
            <DropdownMenuItem>Reassign Agent</DropdownMenuItem>
            <DropdownMenuItem>Change Priority</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete Task</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}