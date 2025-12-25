import { Card } from "@/components/ui/card"
import { Header } from "@/components/header-in"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, ListTree, Zap, CheckCircle, Activity, TrendingUp, Clock } from "lucide-react"

const agents = [
  {
    name: "Interpreter",
    icon: Brain,
    description: "Understands user intent and context from natural language input",
    status: "active",
    tasksProcessed: 1247,
    successRate: 98.5,
    avgResponseTime: "0.8s",
    currentLoad: 85,
    capabilities: ["Natural Language Processing", "Intent Recognition", "Context Analysis", "Sentiment Detection"],
    stats: {
      today: 142,
      thisWeek: 856,
      thisMonth: 3421,
    },
  },
  {
    name: "Planner",
    icon: ListTree,
    description: "Creates strategic action plans and breaks down complex goals",
    status: "active",
    tasksProcessed: 983,
    successRate: 96.2,
    avgResponseTime: "1.2s",
    currentLoad: 62,
    capabilities: ["Task Decomposition", "Priority Assignment", "Dependency Mapping", "Resource Allocation"],
    stats: {
      today: 98,
      thisWeek: 687,
      thisMonth: 2834,
    },
  },
  {
    name: "Executor",
    icon: Zap,
    description: "Takes action and integrates with tools to complete tasks",
    status: "active",
    tasksProcessed: 2103,
    successRate: 99.1,
    avgResponseTime: "1.8s",
    currentLoad: 95,
    capabilities: ["API Integration", "Email Automation", "Calendar Management", "File Operations"],
    stats: {
      today: 203,
      thisWeek: 1432,
      thisMonth: 5876,
    },
  },
  {
    name: "Verifier",
    icon: CheckCircle,
    description: "Validates results and ensures quality standards are met",
    status: "active",
    tasksProcessed: 1876,
    successRate: 97.8,
    avgResponseTime: "1.0s",
    currentLoad: 78,
    capabilities: ["Output Validation", "Quality Assurance", "Error Detection", "Compliance Checking"],
    stats: {
      today: 187,
      thisWeek: 1243,
      thisMonth: 4987,
    },
  },
]

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Agents</h1>
          <p className="text-muted-foreground">Monitor and manage your multi-agent AI system</p>
        </div>

        {/* System Overview */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <Card className="border-2 border-border bg-card p-6">
            <Activity className="mb-4 h-8 w-8 text-primary" />
            <div className="text-2xl font-bold">4/4</div>
            <div className="text-sm text-muted-foreground">Agents Active</div>
          </Card>
          <Card className="border-2 border-border bg-card p-6">
            <TrendingUp className="mb-4 h-8 w-8 text-green-400" />
            <div className="text-2xl font-bold">97.9%</div>
            <div className="text-sm text-muted-foreground">Avg Success Rate</div>
          </Card>
          <Card className="border-2 border-border bg-card p-6">
            <Clock className="mb-4 h-8 w-8 text-blue-400" />
            <div className="text-2xl font-bold">1.2s</div>
            <div className="text-sm text-muted-foreground">Avg Response Time</div>
          </Card>
          <Card className="border-2 border-border bg-card p-6">
            <Zap className="mb-4 h-8 w-8 text-yellow-400" />
            <div className="text-2xl font-bold">6,209</div>
            <div className="text-sm text-muted-foreground">Total Tasks This Month</div>
          </Card>
        </div>

        {/* Agent Cards */}
        <div className="space-y-6">
          {agents.map((agent) => (
            <Card key={agent.name} className="border-2 border-border bg-card p-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Agent Info */}
                <div className="lg:col-span-2">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <agent.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold">{agent.name}</h3>
                          <Badge variant="outline" className="text-green-400">
                            {agent.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{agent.description}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>

                  {/* Capabilities */}
                  <div className="mb-4">
                    <div className="mb-2 text-sm font-medium">Capabilities</div>
                    <div className="flex flex-wrap gap-2">
                      {agent.capabilities.map((capability) => (
                        <Badge key={capability} variant="secondary">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Current Load */}
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium">Current Load</span>
                      <span className="text-muted-foreground">{agent.currentLoad}%</span>
                    </div>
                    <Progress value={agent.currentLoad} className="h-2" />
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <Card className="border border-border bg-muted/30 p-4">
                    <div className="mb-1 text-sm text-muted-foreground">Tasks Processed</div>
                    <div className="text-2xl font-bold">{agent.tasksProcessed.toLocaleString()}</div>
                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Today:</span>
                        <span className="font-medium">{agent.stats.today}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">This Week:</span>
                        <span className="font-medium">{agent.stats.thisWeek}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">This Month:</span>
                        <span className="font-medium">{agent.stats.thisMonth}</span>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-3">
                    <Card className="border border-border bg-muted/30 p-3">
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                      <div className="text-lg font-bold text-green-400">{agent.successRate}%</div>
                    </Card>
                    <Card className="border border-border bg-muted/30 p-3">
                      <div className="text-xs text-muted-foreground">Avg Time</div>
                      <div className="text-lg font-bold text-blue-400">{agent.avgResponseTime}</div>
                    </Card>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
