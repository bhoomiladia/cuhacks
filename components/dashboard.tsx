import { Card } from "@/components/ui/card"
import { CheckCircle2, Clock, Calendar, TrendingUp } from "lucide-react"

const stats = [
  { label: "Tasks Completed", value: "248", icon: CheckCircle2, change: "+12%" },
  { label: "In Progress", value: "12", icon: Clock, change: "+3%" },
  { label: "Scheduled", value: "34", icon: Calendar, change: "+8%" },
  { label: "Productivity", value: "94%", icon: TrendingUp, change: "+5%" },
]

const recentTasks = [
  { title: "Send quarterly report to stakeholders", status: "completed", time: "2 hours ago" },
  { title: "Schedule team sync for Friday", status: "completed", time: "5 hours ago" },
  { title: "Create Q1 planning document", status: "in-progress", time: "In progress" },
  { title: "Review and approve budget proposal", status: "pending", time: "Scheduled for tomorrow" },
]

export function Dashboard() {
  return (
    <section id="dashboard" className="px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">Your Productivity Dashboard</h2>
          <p className="text-muted-foreground">Track your tasks, notes, and action history in one place</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-2 border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <stat.icon className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium text-green-400">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="border-2 border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Recent Tasks</h3>
            <div className="space-y-3">
              {recentTasks.map((task, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="mt-1">
                    {task.status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                    {task.status === "in-progress" && <Clock className="h-5 w-5 text-primary" />}
                    {task.status === "pending" && <Calendar className="h-5 w-5 text-yellow-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{task.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-2 border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Action History</h3>
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium">Analyzed 47 emails</p>
                <p className="mt-1 text-xs text-muted-foreground">Today at 9:32 AM</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium">Created 8 calendar events</p>
                <p className="mt-1 text-xs text-muted-foreground">Yesterday at 3:15 PM</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium">Sent 12 automated follow-ups</p>
                <p className="mt-1 text-xs text-muted-foreground">Yesterday at 11:20 AM</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium">Processed 23 task completions</p>
                <p className="mt-1 text-xs text-muted-foreground">2 days ago</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
