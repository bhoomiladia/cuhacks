import { Card } from "@/components/ui/card"
import { Header } from "@/components/header-in"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, ListTree, Zap, CheckCircle, Search, Download } from "lucide-react"

const activities = [
  {
    id: 1,
    timestamp: "2024-01-15 14:32:18",
    agent: "Interpreter",
    action: "Analyzed user request",
    input: "Schedule a meeting with the design team next week",
    output: "Intent: Schedule Meeting | Participants: Design Team | Timeframe: Next Week",
    status: "success",
    duration: "0.8s",
  },
  {
    id: 2,
    timestamp: "2024-01-15 14:32:19",
    agent: "Planner",
    action: "Created action plan",
    input: "Intent: Schedule Meeting | Participants: Design Team | Timeframe: Next Week",
    output: "Plan: 1) Check team availability 2) Find suitable time slot 3) Send calendar invites",
    status: "success",
    duration: "1.2s",
  },
  {
    id: 3,
    timestamp: "2024-01-15 14:32:21",
    agent: "Executor",
    action: "Executed calendar integration",
    input: "Plan: Check team availability for next week",
    output: "Found 3 available time slots: Mon 2pm, Wed 10am, Thu 3pm",
    status: "success",
    duration: "1.8s",
  },
  {
    id: 4,
    timestamp: "2024-01-15 14:32:23",
    agent: "Executor",
    action: "Sent calendar invites",
    input: "Selected time: Wednesday 10am",
    output: "Calendar invites sent to 5 team members",
    status: "success",
    duration: "1.5s",
  },
  {
    id: 5,
    timestamp: "2024-01-15 14:32:25",
    agent: "Verifier",
    action: "Validated completion",
    input: "Task: Schedule design team meeting",
    output: "Verification passed: All invites delivered, no conflicts detected",
    status: "success",
    duration: "1.0s",
  },
  {
    id: 6,
    timestamp: "2024-01-15 14:28:42",
    agent: "Interpreter",
    action: "Analyzed email context",
    input: "Draft a response to Sarah's proposal email",
    output: "Intent: Email Response | Recipient: Sarah | Context: Proposal Discussion",
    status: "success",
    duration: "0.9s",
  },
  {
    id: 7,
    timestamp: "2024-01-15 14:28:43",
    agent: "Planner",
    action: "Created response strategy",
    input: "Intent: Email Response | Recipient: Sarah",
    output: "Plan: 1) Acknowledge proposal 2) Highlight key points 3) Request follow-up meeting",
    status: "success",
    duration: "1.1s",
  },
  {
    id: 8,
    timestamp: "2024-01-15 14:28:45",
    agent: "Executor",
    action: "Generated email draft",
    input: "Response strategy with professional tone",
    output: "Email draft created (247 words) with subject: Re: Q1 Proposal Discussion",
    status: "success",
    duration: "2.3s",
  },
]

const agentIcons = {
  Interpreter: Brain,
  Planner: ListTree,
  Executor: Zap,
  Verifier: CheckCircle,
}

const agentColors = {
  Interpreter: "text-blue-400",
  Planner: "text-purple-400",
  Executor: "text-green-400",
  Verifier: "text-yellow-400",
}

export default function ActivityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Activity Log</h1>
            <p className="text-muted-foreground">Complete transparency of all agent actions and decisions</p>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export Log
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6 border-2 border-border bg-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search activity logs..." className="pl-9" />
          </div>
        </Card>

        {/* Activity Timeline */}
        <div className="space-y-3">
          {activities.map((activity) => {
            const AgentIcon = agentIcons[activity.agent as keyof typeof agentIcons]
            const agentColor = agentColors[activity.agent as keyof typeof agentColors]

            return (
              <Card
                key={activity.id}
                className="border-2 border-border bg-card p-6 transition-all hover:border-primary/50"
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <AgentIcon className={`h-5 w-5 ${agentColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-semibold">{activity.agent}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{activity.action}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{activity.timestamp}</span>
                          <span>•</span>
                          <span>{activity.duration}</span>
                          <Badge variant="outline" className="text-green-400">
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                        <div className="mb-1 text-xs font-medium text-muted-foreground">Input</div>
                        <div className="text-sm">{activity.input}</div>
                      </div>
                      <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                        <div className="mb-1 text-xs font-medium text-muted-foreground">Output</div>
                        <div className="text-sm">{activity.output}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button variant="outline">Load More Activities</Button>
        </div>
      </main>
    </div>
  )
}
