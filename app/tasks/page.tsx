"use client"

import { useState } from 'react';
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Clock, Calendar, Search, Plus, Filter, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateTaskModal } from "@/components/create-task-modal";
import { format } from 'date-fns';

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

export default function TasksPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskList, setTaskList] = useState<Task[]>(initialTasks);
  
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
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      status: 'pending',
      priority: newTask.priority,
      dueDate: newTask.dueDate ? format(newTask.dueDate, 'MMM d, yyyy') : 'No due date',
      assignedAgent: 'Planner',
      tags: ['new'],
    };
    
    setTaskList(prev => [task, ...prev]);
  };

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
              <Input placeholder="Search tasks..." className="pl-9" />
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filter
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
            {taskList.map((task) => (
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
                {task.dueDate}
              </Badge>
              <Badge variant="outline">{task.assignedAgent}</Badge>
              {task.tags.map((tag: string) => (
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
