import { Card } from "@/components/ui/card"
import { Header } from "@/components/header"
import { CheckCircle2, Clock, Calendar, TrendingUp, Zap, Target, Users, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const stats = [
  { label: "Tasks Completed", value: "248", icon: CheckCircle2, change: "+12%", color: "text-green-400" },
  { label: "In Progress", value: "12", icon: Clock, change: "+3%", color: "text-primary" },
  { label: "Scheduled", value: "34", icon: Calendar, change: "+8%", color: "text-yellow-400" },
  { label: "Productivity", value: "94%", icon: TrendingUp, change: "+5%", color: "text-blue-400" },
]

const recentTasks = [
  {
    title: "Send quarterly report to stakeholders",
    status: "completed",
    time: "2 hours ago",
    agent: "Executor",
  },
  {
    title: "Schedule team sync for Friday",
    status: "completed",
    time: "5 hours ago",
    agent: "Planner",
  },
  {
    title: "Create Q1 planning document",
    status: "in-progress",
    time: "In progress",
    agent: "Executor",
  },
  {
    title: "Review and approve budget proposal",
    status: "pending",
    time: "Scheduled for tomorrow",
    agent: "Verifier",
  },
]

const weeklyProgress = [
  { day: "Mon", tasks: 12 },
  { day: "Tue", tasks: 18 },
  { day: "Wed", tasks: 15 },
  { day: "Thu", tasks: 22 },
  { day: "Fri", tasks: 19 },
  { day: "Sat", tasks: 8 },
  { day: "Sun", tasks: 6 },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your productivity.</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-2 border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-sm font-medium text-green-400">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Tasks - 2 columns */}
          <Card className="border-2 border-border bg-card p-6 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Tasks</h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentTasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4 transition-all hover:border-primary/50"
                >
                  <div className="mt-1">
                    {task.status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                    {task.status === "in-progress" && <Clock className="h-5 w-5 text-primary" />}
                    {task.status === "pending" && <Calendar className="h-5 w-5 text-yellow-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                        <Zap className="h-3 w-3" />
                        {task.agent}
                      </span>
                      <span>{task.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="border-2 border-border bg-card p-6">
            <h3 className="mb-6 text-lg font-semibold">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                <Target className="h-4 w-4" />
                Create New Task
              </Button>
              <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                <Users className="h-4 w-4" />
                Manage Agents
              </Button>
              <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
            </div>

            <div className="mt-8">
              <h4 className="mb-4 text-sm font-semibold">Weekly Progress</h4>
              <div className="flex items-end justify-between gap-2">
                {weeklyProgress.map((day) => (
                  <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md bg-primary/20"
                      style={{ height: `${day.tasks * 4}px`, minHeight: "20px" }}
                    >
                      <div className="h-full w-full rounded-t-md bg-primary" style={{ height: "100%" }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Agent Activity */}
          <Card className="border-2 border-border bg-card p-6 lg:col-span-3">
            <h3 className="mb-6 text-lg font-semibold">Agent Activity</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-2 text-sm text-muted-foreground">Interpreter</div>
                <div className="mb-2 text-2xl font-bold">142</div>
                <Progress value={85} className="h-2" />
                <div className="mt-2 text-xs text-muted-foreground">85% capacity</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-2 text-sm text-muted-foreground">Planner</div>
                <div className="mb-2 text-2xl font-bold">98</div>
                <Progress value={62} className="h-2" />
                <div className="mt-2 text-xs text-muted-foreground">62% capacity</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-2 text-sm text-muted-foreground">Executor</div>
                <div className="mb-2 text-2xl font-bold">203</div>
                <Progress value={95} className="h-2" />
                <div className="mt-2 text-xs text-muted-foreground">95% capacity</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-2 text-sm text-muted-foreground">Verifier</div>
                <div className="mb-2 text-2xl font-bold">187</div>
                <Progress value={78} className="h-2" />
                <div className="mt-2 text-xs text-muted-foreground">78% capacity</div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
